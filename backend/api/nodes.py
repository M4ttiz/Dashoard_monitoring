from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Node

router = APIRouter(prefix="/nodes", tags=["nodes"])


class NodeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    host: str = Field(min_length=1, max_length=255)
    port: int = Field(default=9646, ge=1, le=65535)


class NodeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    host: str | None = Field(default=None, min_length=1, max_length=255)
    port: int | None = Field(default=None, ge=1, le=65535)
    is_active: bool | None = None


class NodeOut(BaseModel):
    id: str
    name: str
    host: str
    port: int
    is_active: bool
    created_at: datetime
    last_seen: datetime | None
    status: str


def _status_from_last_seen(last_seen: datetime | None) -> str:
    return "online" if last_seen is not None else "offline"


@router.get("", response_model=list[NodeOut])
async def list_nodes(db: AsyncSession = Depends(get_db)) -> list[NodeOut]:
    nodes = (await db.execute(select(Node).order_by(Node.created_at.asc()))).scalars().all()
    return [
        NodeOut(
            id=n.id,
            name=n.name,
            host=n.host,
            port=n.port,
            is_active=n.is_active,
            created_at=n.created_at,
            last_seen=n.last_seen,
            status=_status_from_last_seen(n.last_seen),
        )
        for n in nodes
    ]


@router.post("", response_model=NodeOut, status_code=201)
async def add_node(payload: NodeCreate, db: AsyncSession = Depends(get_db)) -> NodeOut:
    node = Node(name=payload.name, host=payload.host, port=payload.port, is_active=True)
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return NodeOut(
        id=node.id,
        name=node.name,
        host=node.host,
        port=node.port,
        is_active=node.is_active,
        created_at=node.created_at,
        last_seen=node.last_seen,
        status=_status_from_last_seen(node.last_seen),
    )


@router.delete("/{node_id}", status_code=204)
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)) -> None:
    node = await db.get(Node, node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    await db.delete(node)
    await db.commit()


@router.patch("/{node_id}", response_model=NodeOut)
async def update_node(node_id: str, payload: NodeUpdate, db: AsyncSession = Depends(get_db)) -> NodeOut:
    node = await db.get(Node, node_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")

    if payload.name is not None:
        node.name = payload.name
    if payload.host is not None:
        node.host = payload.host
    if payload.port is not None:
        node.port = payload.port
    if payload.is_active is not None:
        node.is_active = payload.is_active

    await db.commit()
    await db.refresh(node)
    return NodeOut(
        id=node.id,
        name=node.name,
        host=node.host,
        port=node.port,
        is_active=node.is_active,
        created_at=node.created_at,
        last_seen=node.last_seen,
        status=_status_from_last_seen(node.last_seen),
    )

