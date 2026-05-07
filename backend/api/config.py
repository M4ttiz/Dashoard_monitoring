from __future__ import annotations

from collections.abc import Awaitable, Callable

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import MonitorConfig

router = APIRouter(prefix="/config", tags=["config"])
_refresh_scheduler_config: Callable[[], Awaitable[None]] | None = None


def set_refresh_scheduler_config(callback: Callable[[], Awaitable[None]]) -> None:
    global _refresh_scheduler_config
    _refresh_scheduler_config = callback


class MonitorConfigOut(BaseModel):
    cpu_warning: float
    cpu_critical: float
    memory_warning: float
    memory_critical: float
    disk_warning: float
    disk_critical: float
    poll_interval_seconds: int


class MonitorConfigUpdate(BaseModel):
    cpu_warning: float = Field(ge=1, le=100)
    cpu_critical: float = Field(ge=1, le=100)
    memory_warning: float = Field(ge=1, le=100)
    memory_critical: float = Field(ge=1, le=100)
    disk_warning: float = Field(ge=1, le=100)
    disk_critical: float = Field(ge=1, le=100)
    poll_interval_seconds: int = Field(ge=5, le=300)


async def _get_or_create_config(db: AsyncSession) -> MonitorConfig:
    config = await db.get(MonitorConfig, 1)
    if config is None:
        config = MonitorConfig(id=1)
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config


@router.get("", response_model=MonitorConfigOut)
async def get_config(db: AsyncSession = Depends(get_db)) -> MonitorConfigOut:
    cfg = await _get_or_create_config(db)
    return MonitorConfigOut(
        cpu_warning=cfg.cpu_warning,
        cpu_critical=cfg.cpu_critical,
        memory_warning=cfg.memory_warning,
        memory_critical=cfg.memory_critical,
        disk_warning=cfg.disk_warning,
        disk_critical=cfg.disk_critical,
        poll_interval_seconds=cfg.poll_interval_seconds,
    )


@router.patch("", response_model=MonitorConfigOut)
async def update_config(payload: MonitorConfigUpdate, db: AsyncSession = Depends(get_db)) -> MonitorConfigOut:
    cfg = await _get_or_create_config(db)

    cfg.cpu_warning = payload.cpu_warning
    cfg.cpu_critical = payload.cpu_critical
    cfg.memory_warning = payload.memory_warning
    cfg.memory_critical = payload.memory_critical
    cfg.disk_warning = payload.disk_warning
    cfg.disk_critical = payload.disk_critical
    cfg.poll_interval_seconds = payload.poll_interval_seconds

    await db.commit()
    await db.refresh(cfg)
    if _refresh_scheduler_config is not None:
        await _refresh_scheduler_config()

    return MonitorConfigOut(
        cpu_warning=cfg.cpu_warning,
        cpu_critical=cfg.cpu_critical,
        memory_warning=cfg.memory_warning,
        memory_critical=cfg.memory_critical,
        disk_warning=cfg.disk_warning,
        disk_critical=cfg.disk_critical,
        poll_interval_seconds=cfg.poll_interval_seconds,
    )
