# MISAT Monitor

MISAT Monitor is a distributed monitoring dashboard with three components:

- `agent/`: lightweight Python agent that runs on monitored nodes
- `backend/`: FastAPI collector, API service, and persistence layer
- `frontend/`: React dashboard application built with Vite

## Current setup

This repository currently contains the initial Prompt 1 baseline:

- base folder structure (`agent`, `backend`, `frontend`)
- frontend bootstrapped with React + Vite
- frontend dependencies installed: `recharts`, `tailwindcss`, `react-router-dom`, `axios`
- frontend routes ready for:
  - `/`
  - `/nodes/:id`
  - `/alerts`
- Python requirements files for backend and agent
- shared `.gitignore` for Python and Node.js artifacts

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend (placeholder for next prompts)

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

### Agent (placeholder for next prompts)

```bash
cd agent
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```
