# MISAT Monitor

MISAT Monitor is a distributed monitoring stack for mixed environments (VMs, physical servers, workstations), built with:

- `agent/`: lightweight Python metrics agent (`/metrics`, `/health`)
- `backend/`: FastAPI collector + scheduler + alerts + WebSocket
- `frontend/`: React dashboard with real-time updates

## Quick start with Docker

From repository root:

```bash
docker compose up -d --build
```

After startup:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Stop stack:

```bash
docker compose down
```

Stop stack and remove backend persistent data:

```bash
docker compose down -v
```

## Manual development (without Docker)

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional frontend env (`frontend/.env`):

```bash
VITE_BACKEND_HTTP_URL=http://localhost:8000
VITE_BACKEND_WS_URL=ws://localhost:8000/ws
```

### 3) Agent

```bash
cd agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python agent.py
```

## Install agent on a new Linux node (systemd)

1. Copy `agent.py` and `requirements.txt` to `/opt/misat-agent`.
2. Create venv and install deps:

```bash
sudo mkdir -p /opt/misat-agent
sudo chown -R $USER:$USER /opt/misat-agent
cp agent/agent.py agent/requirements.txt /opt/misat-agent/
cd /opt/misat-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Create `/etc/systemd/system/misat-agent.service`:

```ini
[Unit]
Description=MISAT Monitor Agent
After=network.target

[Service]
User=root
WorkingDirectory=/opt/misat-agent
ExecStart=/opt/misat-agent/.venv/bin/python /opt/misat-agent/agent.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

4. Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now misat-agent
sudo systemctl status misat-agent
```

## Install agent on Windows (NSSM service)

1. Install Python 3.12+ and NSSM.
2. Prepare folder (example `C:\misat-agent`) with `agent.py` and `requirements.txt`.
3. Create venv and install deps in PowerShell:

```powershell
cd C:\misat-agent
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

4. Create service with NSSM:

```powershell
nssm install MISATAgent "C:\misat-agent\.venv\Scripts\python.exe" "C:\misat-agent\agent.py"
nssm start MISATAgent
```

## Ports used

| Component | Port | Purpose |
|---|---:|---|
| Frontend (Nginx) | `3000` | Web dashboard |
| Backend (FastAPI) | `8000` | REST API + WebSocket `/ws` |
| Agent | `9646` | Node metrics endpoint |

## Screenshot

Dashboard screenshot placeholder:

`docs/screenshots/overview.png`

