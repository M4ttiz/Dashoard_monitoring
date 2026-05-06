# MISAT Monitor Agent

Lightweight HTTP agent for node monitoring.  
It exposes system metrics on port `9646` and is designed to run on each monitored host.

## Endpoints

- `GET /metrics` - Returns hostname, timestamp, CPU, memory, disk, and load average.
- `GET /health` - Returns agent health status and hostname.

## Local run (without Docker)

```bash
cd agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python agent.py
```

Agent URL: `http://<host>:9646`

## Docker deploy on Linux server

### 1) Prepare project directory

```bash
sudo mkdir -p /opt/misat-monitor
sudo chown -R $USER:$USER /opt/misat-monitor
cd /opt/misat-monitor
```

Copy or clone your repository into `/opt/misat-monitor`.

### 2) Build image

From repository root:

```bash
docker build -t misat-agent:latest -f agent/Dockerfile .
```

If `agent/Dockerfile` does not exist yet, you can create this minimal one:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY agent/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY agent/agent.py /app/agent.py
EXPOSE 9646
CMD ["python", "agent.py"]
```

### 3) Run container with restart policy

```bash
docker run -d \
  --name misat-agent \
  --restart unless-stopped \
  -p 9646:9646 \
  misat-agent:latest
```

### 4) Verify service health

```bash
curl http://localhost:9646/health
curl http://localhost:9646/metrics
```

### 5) Update on new release

```bash
cd /opt/misat-monitor
git pull
docker build -t misat-agent:latest -f agent/Dockerfile .
docker rm -f misat-agent
docker run -d --name misat-agent --restart unless-stopped -p 9646:9646 misat-agent:latest
```

## Linux systemd deployment (non-Docker)

### 1) Install prerequisites

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip
```

### 2) Deploy files and virtualenv

```bash
sudo mkdir -p /opt/misat-agent
sudo chown -R $USER:$USER /opt/misat-agent
cp agent.py requirements.txt /opt/misat-agent/
cd /opt/misat-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3) Create systemd unit

Create `/etc/systemd/system/misat-agent.service`:

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

### 4) Enable and start service

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now misat-agent
sudo systemctl status misat-agent
```

## Networking notes

- Open inbound TCP port `9646` on host firewall/security groups.
- Restrict access to trusted private networks where possible.

## Troubleshooting

- Check logs:
  - Docker: `docker logs -f misat-agent`
  - systemd: `journalctl -u misat-agent -f`
- If `/metrics` is slow, verify host I/O and mount permissions.
- If load average is `null`, this is expected on Windows hosts.
