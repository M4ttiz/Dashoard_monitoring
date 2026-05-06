from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


class AlertOut(BaseModel):
    id: str
    node_id: str
    timestamp: datetime
    metric: str
    value: float
    threshold: float
    severity: str
    is_read: bool
    message: str


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    unread: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[AlertOut]:
    stmt = select(Alert).order_by(desc(Alert.timestamp))
    if unread is True:
        stmt = stmt.where(Alert.is_read.is_(False))
    alerts = (await db.execute(stmt)).scalars().all()
    return [
        AlertOut(
            id=a.id,
            node_id=a.node_id,
            timestamp=a.timestamp,
            metric=a.metric,
            value=a.value,
            threshold=a.threshold,
            severity=a.severity,
            is_read=a.is_read,
            message=a.message,
        )
        for a in alerts
    ]


@router.patch("/{alert_id}/read", response_model=AlertOut)
async def mark_alert_read(alert_id: str, db: AsyncSession = Depends(get_db)) -> AlertOut:
    alert = await db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    await db.commit()
    await db.refresh(alert)
    return AlertOut(
        id=alert.id,
        node_id=alert.node_id,
        timestamp=alert.timestamp,
        metric=alert.metric,
        value=alert.value,
        threshold=alert.threshold,
        severity=alert.severity,
        is_read=alert.is_read,
        message=alert.message,
    )


@router.patch("/read-all", status_code=204)
async def mark_all_read(db: AsyncSession = Depends(get_db)) -> None:
    await db.execute(update(Alert).where(Alert.is_read.is_(False)).values(is_read=True))
    await db.commit()

