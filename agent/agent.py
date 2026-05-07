import os
import socket
from datetime import datetime, timezone
from typing import Any

import psutil
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="MISAT Monitor Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def bytes_to_gb(value: float) -> float:
    return round(value / (1024**3), 2)


def get_load_avg() -> list[float | None]:
    try:
        load1, load5, load15 = os.getloadavg()
        return [round(load1, 2), round(load5, 2), round(load15, 2)]
    except (AttributeError, OSError):
        # Windows or restricted environments do not expose load average.
        return [None, None, None]


def collect_disk_metrics() -> list[dict[str, Any]]:
    disks: list[dict[str, Any]] = []
    for partition in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disks.append(
                {
                    "mountpoint": partition.mountpoint,
                    "total_gb": bytes_to_gb(usage.total),
                    "used_gb": bytes_to_gb(usage.used),
                    "percent": round(float(usage.percent), 2),
                }
            )
        except (PermissionError, FileNotFoundError, OSError):
            # Skip unavailable mount points and continue serving valid ones.
            continue
    return disks


def collect_metrics() -> dict[str, Any]:
    hostname = socket.gethostname()
    virtual_memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=0.2)

    return {
        "hostname": hostname,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cpu": {
            "percent": round(float(cpu_percent), 2),
            "count": psutil.cpu_count(logical=True) or 0,
        },
        "memory": {
            "total_gb": bytes_to_gb(virtual_memory.total),
            "used_gb": bytes_to_gb(virtual_memory.used),
            "percent": round(float(virtual_memory.percent), 2),
        },
        "disk": collect_disk_metrics(),
        "load_avg": get_load_avg(),
    }


@app.get("/metrics")
async def metrics() -> dict[str, Any]:
    try:
        return collect_metrics()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to collect metrics: {exc}",
        ) from exc


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "hostname": socket.gethostname()}


if __name__ == "__main__":
    uvicorn.run("agent:app", host="0.0.0.0", port=9646, reload=False)
