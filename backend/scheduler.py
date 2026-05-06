import asyncio
import logging
from collections.abc import Awaitable, Callable
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete, select

from .database import SessionLocal
from .models import Alert, MetricSnapshot, Node, utc_now

logger = logging.getLogger(__name__)

BroadcastFn = Callable[[dict[str, Any]], Awaitable[None]]


def _default_broadcast(_: dict[str, Any]) -> Awaitable[None]:
    return asyncio.sleep(0)


class MetricScheduler:
    def __init__(
        self,
        *,
        poll_interval_seconds: int = 15,
        http_timeout_seconds: float = 5.0,
        retention_days: int = 7,
        broadcast: BroadcastFn | None = None,
    ) -> None:
        self._poll_interval_seconds = poll_interval_seconds
        self._http_timeout_seconds = http_timeout_seconds
        self._retention_days = retention_days
        self._broadcast: BroadcastFn = broadcast or _default_broadcast

        self._scheduler = AsyncIOScheduler()
        self._client: httpx.AsyncClient | None = None

        # In-memory state to detect "2 consecutive polls" condition.
        self._cpu_over_80_consecutive: dict[str, int] = {}

    async def start(self) -> None:
        if self._client is not None:
            return

        self._client = httpx.AsyncClient(timeout=self._http_timeout_seconds)
        self._scheduler.add_job(self.poll_all_nodes, "interval", seconds=self._poll_interval_seconds)
        self._scheduler.start()
        logger.info("MetricScheduler started (interval=%ss)", self._poll_interval_seconds)

    async def stop(self) -> None:
        if self._client is None:
            return

        self._scheduler.shutdown(wait=False)
        await self._client.aclose()
        self._client = None
        logger.info("MetricScheduler stopped")

    async def poll_all_nodes(self) -> None:
        if self._client is None:
            logger.warning("poll_all_nodes called before start(); skipping")
            return

        now = utc_now()
        async with SessionLocal() as session:
            nodes = (await session.execute(select(Node).where(Node.is_active.is_(True)))).scalars().all()

        for node in nodes:
            try:
                await self._poll_single_node(node_id=node.id, host=node.host, port=node.port, now=now)
            except Exception:
                logger.exception("Unexpected error polling node_id=%s", node.id)

        try:
            await self._apply_retention(now=now)
        except Exception:
            logger.exception("Retention cleanup failed")

    async def _poll_single_node(self, *, node_id: str, host: str, port: int, now: datetime) -> None:
        assert self._client is not None

        url = f"http://{host}:{port}/metrics"
        try:
            response = await self._client.get(url)
            response.raise_for_status()
            payload = response.json()
        except Exception as exc:
            logger.warning("Poll failed node_id=%s url=%s err=%s", node_id, url, exc)
            async with SessionLocal() as session:
                node = await session.get(Node, node_id)
                if node is not None:
                    node.last_seen = None
                    await session.commit()
            return

        cpu_percent = float(payload.get("cpu", {}).get("percent", 0.0) or 0.0)
        mem = payload.get("memory", {}) or {}
        memory_percent = float(mem.get("percent", 0.0) or 0.0)
        memory_used_gb = float(mem.get("used_gb", 0.0) or 0.0)
        memory_total_gb = float(mem.get("total_gb", 0.0) or 0.0)
        disk_data = payload.get("disk", []) or []

        async with SessionLocal() as session:
            node = await session.get(Node, node_id)
            if node is None:
                return

            node.last_seen = now

            snapshot = MetricSnapshot(
                node_id=node_id,
                timestamp=now,
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_used_gb=memory_used_gb,
                memory_total_gb=memory_total_gb,
                disk_data=disk_data,
            )
            session.add(snapshot)

            new_alerts: list[Alert] = []
            new_alerts.extend(
                await self._evaluate_alerts(
                    session=session,
                    node=node,
                    now=now,
                    cpu_percent=cpu_percent,
                    memory_percent=memory_percent,
                    disk_data=disk_data,
                )
            )

            await session.commit()

        await self._broadcast(
            {
                "type": "metrics_update",
                "node_id": node_id,
                "timestamp": now.isoformat(),
            }
        )
        for alert in new_alerts:
            await self._broadcast(
                {
                    "type": "new_alert",
                    "alert": {
                        "id": alert.id,
                        "node_id": alert.node_id,
                        "timestamp": alert.timestamp.isoformat(),
                        "metric": alert.metric,
                        "value": alert.value,
                        "threshold": alert.threshold,
                        "severity": alert.severity,
                        "is_read": alert.is_read,
                        "message": alert.message,
                    },
                }
            )

    async def _evaluate_alerts(
        self,
        *,
        session,
        node: Node,
        now: datetime,
        cpu_percent: float,
        memory_percent: float,
        disk_data: list[dict[str, Any]],
    ) -> list[Alert]:
        alerts: list[Alert] = []

        # CPU rules
        if cpu_percent > 80.0:
            self._cpu_over_80_consecutive[node.id] = self._cpu_over_80_consecutive.get(node.id, 0) + 1
        else:
            self._cpu_over_80_consecutive[node.id] = 0

        if cpu_percent > 95.0:
            maybe = await self._create_alert_if_not_duplicate(
                session=session,
                node=node,
                now=now,
                metric="cpu",
                value=cpu_percent,
                threshold=95.0,
                severity="critical",
                message=f"CPU at {cpu_percent:.1f}%, threshold: 95%",
            )
            if maybe:
                alerts.append(maybe)
        elif self._cpu_over_80_consecutive.get(node.id, 0) >= 2:
            maybe = await self._create_alert_if_not_duplicate(
                session=session,
                node=node,
                now=now,
                metric="cpu",
                value=cpu_percent,
                threshold=80.0,
                severity="warning",
                message=f"CPU at {cpu_percent:.1f}% for 2+ consecutive polls, threshold: 80%",
            )
            if maybe:
                alerts.append(maybe)

        # Memory rules
        if memory_percent > 95.0:
            maybe = await self._create_alert_if_not_duplicate(
                session=session,
                node=node,
                now=now,
                metric="memory",
                value=memory_percent,
                threshold=95.0,
                severity="critical",
                message=f"Memory at {memory_percent:.1f}%, threshold: 95%",
            )
            if maybe:
                alerts.append(maybe)
        elif memory_percent > 85.0:
            maybe = await self._create_alert_if_not_duplicate(
                session=session,
                node=node,
                now=now,
                metric="memory",
                value=memory_percent,
                threshold=85.0,
                severity="warning",
                message=f"Memory at {memory_percent:.1f}%, threshold: 85%",
            )
            if maybe:
                alerts.append(maybe)

        # Disk rules (any mountpoint)
        for disk in disk_data:
            percent = float(disk.get("percent", 0.0) or 0.0)
            mountpoint = str(disk.get("mountpoint", "?") or "?")

            if percent > 95.0:
                maybe = await self._create_alert_if_not_duplicate(
                    session=session,
                    node=node,
                    now=now,
                    metric="disk",
                    value=percent,
                    threshold=95.0,
                    severity="critical",
                    message=f"Disk {mountpoint} at {percent:.1f}%, threshold: 95%",
                )
                if maybe:
                    alerts.append(maybe)
            elif percent > 85.0:
                maybe = await self._create_alert_if_not_duplicate(
                    session=session,
                    node=node,
                    now=now,
                    metric="disk",
                    value=percent,
                    threshold=85.0,
                    severity="warning",
                    message=f"Disk {mountpoint} at {percent:.1f}%, threshold: 85%",
                )
                if maybe:
                    alerts.append(maybe)

        return alerts

    async def _create_alert_if_not_duplicate(
        self,
        *,
        session,
        node: Node,
        now: datetime,
        metric: str,
        value: float,
        threshold: float,
        severity: str,
        message: str,
    ) -> Alert | None:
        dedup_since = now - timedelta(minutes=10)
        existing = (
            await session.execute(
                select(Alert)
                .where(Alert.node_id == node.id)
                .where(Alert.metric == metric)
                .where(Alert.is_read.is_(False))
                .where(Alert.timestamp >= dedup_since)
            )
        ).scalars().first()

        if existing is not None:
            return None

        alert = Alert(
            node_id=node.id,
            timestamp=now,
            metric=metric,
            value=value,
            threshold=threshold,
            severity=severity,
            is_read=False,
            message=message,
        )
        session.add(alert)
        return alert

    async def _apply_retention(self, *, now: datetime) -> None:
        cutoff = now - timedelta(days=self._retention_days)
        async with SessionLocal() as session:
            await session.execute(delete(MetricSnapshot).where(MetricSnapshot.timestamp < cutoff))
            await session.commit()

