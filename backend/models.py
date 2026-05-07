import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False, default=9646)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    snapshots: Mapped[list["MetricSnapshot"]] = relationship(back_populates="node", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="node", cascade="all, delete-orphan")


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    node_id: Mapped[str] = mapped_column(String(36), ForeignKey("nodes.id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, index=True)
    cpu_percent: Mapped[float] = mapped_column(Float, nullable=False)
    memory_percent: Mapped[float] = mapped_column(Float, nullable=False)
    memory_used_gb: Mapped[float] = mapped_column(Float, nullable=False)
    memory_total_gb: Mapped[float] = mapped_column(Float, nullable=False)
    disk_data: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)

    node: Mapped["Node"] = relationship(back_populates="snapshots")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    node_id: Mapped[str] = mapped_column(String(36), ForeignKey("nodes.id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, index=True)
    metric: Mapped[str] = mapped_column(String(32), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    message: Mapped[str] = mapped_column(String(500), nullable=False)

    node: Mapped["Node"] = relationship(back_populates="alerts")


class MonitorConfig(Base):
    __tablename__ = "monitor_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    cpu_warning: Mapped[float] = mapped_column(Float, nullable=False, default=80.0)
    cpu_critical: Mapped[float] = mapped_column(Float, nullable=False, default=95.0)
    memory_warning: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    memory_critical: Mapped[float] = mapped_column(Float, nullable=False, default=95.0)
    disk_warning: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    disk_critical: Mapped[float] = mapped_column(Float, nullable=False, default=95.0)
    poll_interval_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )
