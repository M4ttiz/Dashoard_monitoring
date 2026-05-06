# Deploy Guide - Ubuntu + Docker

This guide deploys MISAT Monitor on an Ubuntu server using Docker Compose.

## 1) Server prerequisites

Run as a sudo-enabled user:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
```

Install Docker Engine + Compose plugin:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Optional: run Docker without sudo (re-login required):

```bash
sudo usermod -aG docker $USER
```

Verify:

```bash
docker --version
docker compose version
```

## 2) Get project code

```bash
cd /home/it
git clone https://github.com/M4ttiz/Dashoard_monitoring.git
cd Dashoard_monitoring
git checkout feature/prompt-10-docker-deploy
```

## 3) Start stack

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

## 4) Access services

- Frontend: `http://SERVER_IP:3000`
- Backend docs: `http://SERVER_IP:8000/docs`

Quick health checks:

```bash
curl http://localhost:8000/docs
curl http://localhost:8000/api/nodes
```

## 5) Add first monitored node

If agent runs on host `192.168.1.50` port `9646`:

```bash
curl -X POST http://localhost:8000/api/nodes \
  -H "Content-Type: application/json" \
  -d '{"name":"server-01","host":"192.168.1.50","port":9646}'
```

## 6) Firewall ports

Open at least:

- `3000/tcp` (frontend)
- `8000/tcp` (backend API)
- `9646/tcp` on each monitored node (agent)

Example with UFW:

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw status
```

## 7) Update procedure

```bash
cd /home/it/Dashoard_monitoring
git fetch --all
git checkout feature/prompt-10-docker-deploy
git pull
docker compose up -d --build
```

## 8) Stop / restart

Stop containers:

```bash
docker compose down
```

Stop and remove persistent DB volume:

```bash
docker compose down -v
```

Restart:

```bash
docker compose restart
```

## 9) Troubleshooting

- Backend not reachable:
  - `docker compose logs backend`
  - Check port `8000` not blocked by firewall
- Frontend loads but API fails:
  - `docker compose logs frontend`
  - Verify nginx proxy routes `/api` and `/ws`
- No metrics shown:
  - Verify agent reachable from backend network (`curl http://NODE_IP:9646/health`)
  - Check node exists in `/api/nodes`

