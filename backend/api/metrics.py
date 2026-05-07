from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import MetricSnapshot, Node

router = APIRouter(prefix="/metrics", tags=["metrics"])

RangeKey = Literal["1h", "6h", "24h", "7d"]


def _range_to_delta(value: RangeKey) -> timedelta:
    if value == "1h":
        return timedelta(hours=1)
    if value == "6h":
        return timedelta(hours=6)
    if value == "24h":
        return timedelta(hours=24)
    return timedelta(days=7)


class MetricSnapshotOut(BaseModel):
    id: str
    node_id: str
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    memory_total_gb: float
    disk_data: list[dict[str, Any]]


@router.get("/{node_id}")
async def get_metrics(
    node_id: str,
    range: RangeKey = Query(default="1h"),
    db: AsyncSession = Depends(get_db),
) -> list[MetricSnapshotOut]:
    node = await db.get(Node, node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")

    now = datetime.now(timezone.utc)
    start = now - _range_to_delta(range)

    snapshots = (
        await db.execute(
            select(MetricSnapshot)
            .where(MetricSnapshot.node_id == node_id)
            .where(MetricSnapshot.timestamp >= start)
            .order_by(MetricSnapshot.timestamp.asc())
        )
    ).scalars().all()

    # Intelligent sampling (simple stride) to max 200 points.
    max_points = 200
    if len(snapshots) > max_points:
        stride = max(1, len(snapshots) // max_points)
        snapshots = snapshots[::stride]
        if len(snapshots) > max_points:
            snapshots = snapshots[:max_points]

    return [
        MetricSnapshotOut(
            id=s.id,
            node_id=s.node_id,
            timestamp=s.timestamp,
            cpu_percent=s.cpu_percent,
            memory_percent=s.memory_percent,
            memory_used_gb=s.memory_used_gb,
            memory_total_gb=s.memory_total_gb,
            disk_data=s.disk_data,
        )
        for s in snapshots
    ]


@router.get("/{node_id}/current", response_model=MetricSnapshotOut)
async def get_current_metric(node_id: str, db: AsyncSession = Depends(get_db)) -> MetricSnapshotOut:
    node = await db.get(Node, node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")

    snapshot = (
        await db.execute(
            select(MetricSnapshot)
            .where(MetricSnapshot.node_id == node_id)
            .order_by(desc(MetricSnapshot.timestamp))
            .limit(1)
        )
    ).scalars().first()

    if snapshot is None:
        raise HTTPException(status_code=404, detail="No metrics available for node")

    return MetricSnapshotOut(
        id=snapshot.id,
        node_id=snapshot.node_id,
        timestamp=snapshot.timestamp,
        cpu_percent=snapshot.cpu_percent,
        memory_percent=snapshot.memory_percent,
        memory_used_gb=snapshot.memory_used_gb,
        memory_total_gb=snapshot.memory_total_gb,
        disk_data=snapshot.disk_data,
    )

