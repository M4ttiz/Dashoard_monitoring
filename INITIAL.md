# Dashoard_monitoring

# 🖥️ MISAT Monitor — Architettura & Prompt per Cursor

---

## 📐 Architettura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        NODI MONITORATI                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Server 01   │  │  Server 02   │  │  Server 03   │       │
│  │  Python      │  │  Python      │  │  Python      │       │
│  │  Agent :9646 │  │  Agent :9646 │  │  Agent :9646 │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼────────────────┼────────────────┼───────────────┘
          │ HTTP pull       │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND COLLECTOR                        │
│              FastAPI (Python) — porta 8000                   │
│                                                              │
│   ┌───────────────┐    ┌──────────────────────────────┐     │
│   │  Scheduler    │    │   REST API + WebSocket        │     │
│   │  (ogni 15s    │    │   /api/nodes                  │     │
│   │   fa il poll) │    │   /api/metrics/{node}         │     │
│   └───────────────┘    │   /api/alerts                 │     │
│                         │   ws://  (live updates)       │     │
│   ┌───────────────┐    └──────────────────────────────┘     │
│   │  SQLite DB    │                                          │
│   │  metrics.db   │                                          │
│   └───────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                    WebSocket + REST
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND DASHBOARD                         │
│              React + Recharts — porta 5173                   │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ Overview │  │  Grafici │  │  Alert   │  │  Nodi    │   │
│   │   KPI    │  │CPU/RAM/  │  │  Center  │  │  Config  │   │
│   │          │  │  Disk    │  │          │  │          │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧱 Stack Tecnologico

| Componente | Tecnologia | Motivazione |
|---|---|---|
| **Agent** | Python + `psutil` | Cross-platform, leggerissimo, zero dipendenze |
| **Backend** | FastAPI + `APScheduler` | Async, veloce, WebSocket nativo |
| **Database** | SQLite (via `SQLAlchemy`) | Zero infrastruttura, perfetto per team piccoli |
| **Frontend** | React + Vite + Recharts | Grafici performanti, HMR veloce |
| **Stile UI** | Tailwind CSS | Utility-first, ottimo per dashboard |
| **Real-time** | WebSocket (FastAPI native) | Aggiornamenti live senza polling dal browser |

---

## 📁 Struttura del Repository GitHub

```
misat-monitor/
├── agent/                    # Agent Python (gira su ogni nodo)
│   ├── agent.py
│   ├── requirements.txt
│   └── README.md
│
├── backend/                  # Collector + API (gira su server centrale)
│   ├── main.py
│   ├── scheduler.py
│   ├── models.py
│   ├── database.py
│   ├── api/
│   │   ├── nodes.py
│   │   ├── metrics.py
│   │   └── alerts.py
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                 # Dashboard React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NodeCard.jsx
│   │   │   ├── MetricChart.jsx
│   │   │   └── AlertPanel.jsx
│   │   ├── pages/
│   │   │   ├── Overview.jsx
│   │   │   ├── NodeDetail.jsx
│   │   │   └── Alerts.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml        # Tutto insieme con Docker
└── README.md
```

---

## 🤖 PROMPT PER CURSOR — In Ordine di Esecuzione

> **Come usarli**: Apri Cursor, crea il repo, poi esegui i prompt uno alla volta nella chat di Cursor (CMD+L). Ogni prompt costruisce sul precedente.

---

### PROMPT 1 — Setup iniziale del progetto

```
Crea la struttura base del progetto "misat-monitor" con questa organizzazione:

misat-monitor/
├── agent/
├── backend/
└── frontend/

Per il frontend, inizializza un progetto React con Vite:
- Usa il template react
- Installa le dipendenze: recharts, tailwindcss, react-router-dom, axios
- Configura Tailwind CSS con tema dark di default
- Crea un App.jsx con react-router-dom che ha tre route: /, /nodes/:id, /alerts

Per il backend, crea un requirements.txt con:
fastapi, uvicorn, sqlalchemy, aiosqlite, apscheduler, httpx, pydantic

Per l'agent, crea un requirements.txt con:
psutil, fastapi, uvicorn

Crea anche un .gitignore appropriato per Python e Node.js, e un README.md principale che descrive il progetto.
```

---

### PROMPT 2 — Agent Python (sui nodi monitorati)

```
Crea il file agent/agent.py: un agent HTTP leggero in Python che espone le metriche di sistema sulla porta 9646.

Requisiti:
- Usa FastAPI + uvicorn
- Usa psutil per raccogliere le metriche
- Esponi un endpoint GET /metrics che ritorna JSON con:
  {
    "hostname": "nome del server",
    "timestamp": "ISO 8601",
    "cpu": {
      "percent": 45.2,          // utilizzo CPU %
      "count": 8                 // numero core
    },
    "memory": {
      "total_gb": 16.0,
      "used_gb": 8.4,
      "percent": 52.5
    },
    "disk": [
      {
        "mountpoint": "/",
        "total_gb": 500.0,
        "used_gb": 120.0,
        "percent": 24.0
      }
    ],
    "load_avg": [1.2, 0.9, 0.8]  // 1min, 5min, 15min (None su Windows)
  }

- Esponi GET /health che ritorna {"status": "ok", "hostname": "..."}
- Aggiungi CORS permissivo (l'agent è su rete interna)
- Gestisci gracefully le eccezioni (es. load_avg non disponibile su Windows)
- Crea anche un README.md nella cartella agent/ con istruzioni per installarlo come servizio systemd su Linux
```

---

### PROMPT 3 — Database e modelli Backend

```
Crea il database layer del backend in backend/database.py e backend/models.py.

In models.py definisci con SQLAlchemy questi modelli:

1. Node:
   - id (UUID, primary key)
   - name (string, es. "Server-Prod-01")
   - host (string, es. "192.168.1.10")
   - port (int, default 9646)
   - is_active (bool)
   - created_at (datetime)
   - last_seen (datetime, nullable)

2. MetricSnapshot:
   - id (UUID, primary key)
   - node_id (FK -> Node)
   - timestamp (datetime, indexed)
   - cpu_percent (float)
   - memory_percent (float)
   - memory_used_gb (float)
   - memory_total_gb (float)
   - disk_data (JSON string, per i vari mount points)

3. Alert:
   - id (UUID, primary key)
   - node_id (FK -> Node)
   - timestamp (datetime)
   - metric (string: "cpu" | "memory" | "disk")
   - value (float)
   - threshold (float)
   - severity (string: "warning" | "critical")
   - is_read (bool, default False)
   - message (string)

In database.py:
- Usa SQLAlchemy async con aiosqlite
- Database file: ./metrics.db
- Crea funzione init_db() per creare le tabelle
- Crea funzione get_db() come dependency FastAPI
```

---

### PROMPT 4 — Scheduler e raccolta metriche

```
Crea backend/scheduler.py: il modulo che ogni N secondi fa il poll degli agent e salva i dati nel DB, generando alert se necessario.

Requisiti:
- Usa APScheduler (AsyncIOScheduler)
- Ogni 15 secondi, per ogni Node attivo nel DB:
  1. Chiama GET http://{host}:{port}/metrics dell'agent con timeout 5s
  2. Se la chiamata fallisce, aggiorna last_seen a None e logga l'errore
  3. Se ha successo, salva un MetricSnapshot nel DB
  4. Controlla le soglie:
     - CPU > 80% per più di 2 poll consecutivi → Alert WARNING
     - CPU > 95% → Alert CRITICAL
     - Memory > 85% → Alert WARNING
     - Memory > 95% → Alert CRITICAL
     - Qualsiasi disco > 85% → Alert WARNING
     - Qualsiasi disco > 95% → Alert CRITICAL
  5. Non creare Alert duplicati: se esiste già un alert non letto per lo stesso nodo/metrica nelle ultime 10 minuti, non crearne un altro
  6. Dopo aver salvato dati, invia update via WebSocket a tutti i client connessi

- Mantieni in memoria gli ultimi N poll per ogni nodo (per rilevare "2 consecutivi")
- Configura retention: cancella MetricSnapshot più vecchi di 7 giorni

Configura lo scheduler in modo da poterlo avviare e stoppare da main.py.
```

---

### PROMPT 5 — API REST Backend

```
Crea le API REST del backend nella cartella backend/api/:

backend/api/nodes.py — Gestione nodi:
- GET /api/nodes → lista tutti i nodi con last_seen e status (online/offline)
- POST /api/nodes → aggiungi un nodo (body: {name, host, port})
- DELETE /api/nodes/{id} → rimuovi un nodo
- PATCH /api/nodes/{id} → modifica nome/host/port

backend/api/metrics.py — Dati storici:
- GET /api/metrics/{node_id}?range=1h|6h|24h|7d → ritorna array di snapshot nel range, campionati intelligentemente (max 200 punti)
- GET /api/metrics/{node_id}/current → snapshot più recente

backend/api/alerts.py — Alert:
- GET /api/alerts?unread=true → lista alert (filtro opzionale per non letti)
- PATCH /api/alerts/{id}/read → segna come letto
- PATCH /api/alerts/read-all → segna tutti come letti

backend/main.py — App principale:
- Inizializza FastAPI
- Include tutti i router con prefisso /api
- Aggiungi endpoint WebSocket ws://localhost:8000/ws che manda aggiornamenti real-time (JSON con tipo: "metrics_update" | "new_alert")
- Avvia lo scheduler all'avvio dell'app
- Aggiungi CORS per http://localhost:5173
- All'avvio chiama init_db()
```

---

### PROMPT 6 — Hook WebSocket e stato globale Frontend

```
Nel frontend, crea:

1. src/hooks/useWebSocket.js:
   - Hook personalizzato che si connette a ws://localhost:8000/ws
   - Gestisce riconnessione automatica ogni 3 secondi se si disconnette
   - Espone: { lastMessage, isConnected }

2. src/store/useStore.js (usa Zustand, installalo):
   - Stato globale con:
     - nodes: []
     - currentMetrics: {} (keyed by node_id, con dati più recenti)
     - alerts: []
     - unreadCount: 0
   - Actions:
     - fetchNodes()
     - fetchAlerts()
     - handleWebSocketMessage(message)
     - markAlertRead(id)
     - markAllRead()

3. Integra il WebSocket in App.jsx:
   - All'avvio, carica nodi e alert via API
   - Ogni messaggio WebSocket aggiorna lo store
   - Mostra un badge rosso con unreadCount nella navbar se ci sono alert non letti

Installa Zustand: npm install zustand
```

---

### PROMPT 7 — Dashboard Overview (pagina principale)

```
Crea src/pages/Overview.jsx: la pagina principale della dashboard con tema dark professionale.

Layout:
┌─────────────────────────────────────────────────────┐
│  MISAT Monitor          🔔 3 alert    ● Connected   │
├─────────────────────────────────────────────────────┤
│  KPI Cards:                                          │
│  [Nodi Online: 5/6] [CPU Media: 34%] [RAM: 67%]    │
│  [Alert Critici: 1] [Alert Warning: 2]              │
├─────────────────────────────────────────────────────┤
│  Griglia nodi (card per ogni nodo):                  │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ Server-01    │ │ Server-02    │ │ Server-03   │ │
│  │ ● Online     │ │ ● Online     │ │ ✕ Offline   │ │
│  │ CPU: 45%     │ │ CPU: 12%     │ │ Last: 5m ago│ │
│  │ RAM: 67%     │ │ RAM: 34%     │ │             │ │
│  │ Disk: 23%    │ │ Disk: 78% ⚠ │ │             │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘

Requisiti:
- Tema dark (#0f172a background, #1e293b cards)
- Le KPI card usano colori semantici (verde OK, giallo warning, rosso critico)
- Le NodeCard mostrano mini progress bar colorata per CPU/RAM/Disk (verde<70%, giallo 70-85%, rosso >85%)
- Cliccando una NodeCard si va a /nodes/:id
- I dati si aggiornano in real-time via WebSocket store
- Aggiungi un pulsante "+ Aggiungi Nodo" che apre una modal con form (host, nome, porta)
- Skeleton loading mentre carica
```

---

### PROMPT 8 — Pagina Dettaglio Nodo con Grafici

```
Crea src/pages/NodeDetail.jsx: pagina di dettaglio per un singolo nodo con grafici storici.

Layout:
┌─────────────────────────────────────────────────────┐
│  ← Back    Server-01 (192.168.1.10)    ● Online     │
├─────────────────────────────────────────────────────┤
│  Range: [1h] [6h] [24h] [7d]                        │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │  CPU Usage %                                  │   │
│  │  [Area chart Recharts, colore azzurro]        │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Memory Usage %                               │   │
│  │  [Area chart Recharts, colore verde]          │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Disk Usage per mountpoint                    │   │
│  │  [Line chart multi-linea, colori diversi]     │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Alert History (ultimi 20 per questo nodo)    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

Requisiti:
- Usa Recharts: AreaChart per CPU e RAM, LineChart per Disk
- Tooltip custom che mostra valore e timestamp formattato
- ReferenceLine rossa a 85% (soglia warning) nei grafici
- Cambio range ricarica i dati dall'API
- Il grafico CPU mostra anche una linea tratteggiata per la media del periodo
- Usa ResponsiveContainer per adattarsi al viewport
- I dati in tempo reale (ultimo punto) si aggiornano via WebSocket
```

---

### PROMPT 9 — Pagina Alert Center

```
Crea src/pages/Alerts.jsx: pagina di gestione degli alert con notifiche in-app.

Componente notifica toast (src/components/AlertToast.jsx):
- Appare in basso a destra quando arriva un nuovo alert via WebSocket
- Mostra icona, nome nodo, metrica e valore
- Si chiude da solo dopo 5 secondi o al click
- Colore rosso per CRITICAL, giallo per WARNING
- Animazione slide-in da destra

Pagina Alerts:
- Header: "Alert Center" + pulsante "Segna tutti come letti"
- Filtri: [Tutti] [Non letti] [Warning] [Critical]
- Lista alert con:
  - Icona colorata per severità
  - Nome nodo + metrica (es. "Server-01 — CPU")
  - Messaggio (es. "CPU al 92.3%, soglia: 80%")
  - Timestamp relativo (es. "3 minuti fa")
  - Punto blu se non letto
  - Click → segna come letto
- Badge counter nella navbar aggiornato in real-time
- Se non ci sono alert: empty state carino con icona checkmark verde
```

---

### PROMPT 10 — Docker Compose & Deploy

```
Crea docker-compose.yml per avviare l'intero stack con un solo comando.

Servizi:
1. backend:
   - Build da ./backend/Dockerfile
   - Porta 8000:8000
   - Volume per metrics.db persistente
   - Restart: unless-stopped

2. frontend:
   - Build da ./frontend/Dockerfile (nginx per servire la build React)
   - Porta 3000:80
   - Dipende da backend

Crea anche:
- backend/Dockerfile: Python 3.12 slim, installa requirements, avvia uvicorn
- frontend/Dockerfile: multi-stage, stage 1 build React (node:20-alpine), stage 2 nginx:alpine

Aggiorna il README.md principale con:
- Istruzioni quick start con Docker: docker-compose up -d
- Istruzioni manuali (senza Docker) per dev
- Come installare l'agent su un nuovo nodo Linux (come servizio systemd)
- Come installare l'agent su Windows (come servizio con NSSM)
- Tabella porte usate
- Screenshot placeholder
```

---

## 🚀 Ordine Consigliato di Esecuzione

1. **PROMPT 1** → Struttura + inizializzazione
2. **PROMPT 2** → Agent (testalo subito su una macchina)
3. **PROMPT 3** → Database models
4. **PROMPT 4** → Scheduler
5. **PROMPT 5** → API REST + WebSocket
6. ✅ **Test backend**: `uvicorn main:app --reload` + aggiungi un nodo via curl/Postman
7. **PROMPT 6** → Store + WebSocket frontend
8. **PROMPT 7** → Overview dashboard
9. **PROMPT 8** → Pagina dettaglio nodo
10. **PROMPT 9** → Alert center
11. ✅ **Test frontend**: `npm run dev`
12. **PROMPT 10** → Docker + deploy

---

## 💡 Suggerimenti extra per Cursor

- Dopo ogni prompt, di' a Cursor: *"Controlla che non ci siano import mancanti e che tutto sia coerente con i file già creati"*
- Se qualcosa non funziona, incolla l'errore direttamente nella chat di Cursor
- Usa **Cursor Composer** (CMD+Shift+I) per i prompt che toccano più file contemporaneamente
- Per il PROMPT 10, usa Composer così modifica Dockerfile + docker-compose + README insieme

---

*Generato per il progetto MISAT Monitor — architettura agent-pull, FastAPI + React + SQLite*
 