# 🖥️ FRONTEND DESIGN PROMPT V2 — MISAT Monitor

**Ispirazione UI:** Checkmk (CMK) — monitoring enterprise professionale  
**Stack:** React 18 + Vite + Tailwind CSS + Recharts + Zustand + TanStack Query  
**Obiettivo:** Monitoraggio flotta 50+ macchine in tempo reale  
**Struttura:** 2 viste principali — Fleet Overview → Device Detail (drill-down)

---

## 🎯 FILOSOFIA UI

L'interfaccia segue la logica operativa di un NOC (Network Operations Center):

- **Overview = visibilità immediata sulla flotta intera.** Niente grafici grandi. Solo una tabella densa e scannable che risponde alla domanda: *"Qualcosa sta bruciando?"*
- **Device Detail = analisi approfondita del singolo nodo.** Solo qui compaiono grafici, KPI storici, tabelle di alert.
- **Dark mode only.** Pensato per monitor che girano 24/7.
- **Data density alta.** Più informazioni per cm² rispetto a una dashboard consumer.

---

## 📁 STRUTTURA CARTELLE

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                  # Componenti atomici
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── MetricBar.jsx
│   │   │   ├── AlertChip.jsx
│   │   │   └── Spinner.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PageShell.jsx
│   │   ├── fleet/               # Componenti Overview
│   │   │   ├── FleetTable.jsx
│   │   │   ├── FleetTableRow.jsx
│   │   │   ├── FleetStatusBar.jsx
│   │   │   └── FleetFilters.jsx
│   │   └── device/              # Componenti Device Detail
│   │       ├── DeviceHeader.jsx
│   │       ├── DeviceKPIRow.jsx
│   │       ├── MetricChart.jsx
│   │       ├── DiskTable.jsx
│   │       └── AlertTable.jsx
│   ├── pages/
│   │   ├── FleetOverview.jsx    # Pagina 1
│   │   └── DeviceDetail.jsx     # Pagina 2
│   ├── store/
│   │   └── useMonitorStore.js   # Zustand global state
│   ├── hooks/
│   │   ├── useWebSocket.js      # WebSocket con reconnect
│   │   ├── useDeviceMetrics.js  # TanStack Query wrapper
│   │   └── useFleetData.js      # TanStack Query wrapper
│   ├── api/
│   │   └── client.js            # Axios instance configurata
│   └── utils/
│       ├── formatters.js        # Formattazione valori (%, GB, uptime)
│       └── thresholds.js        # Logica soglie warning/critical
```

---

## 🎨 DESIGN SYSTEM

### Palette colori

```css
:root {
  /* Background */
  --bg-base:      #0d1117;   /* Pagina */
  --bg-surface:   #161b22;   /* Card, tabella */
  --bg-elevated:  #1c2128;   /* Hover, dropdown */
  --bg-border:    #30363d;   /* Bordi */

  /* Status semantico */
  --status-ok:       #3fb950;  /* Verde — online, ok */
  --status-warning:  #d29922;  /* Giallo — warning */
  --status-critical: #f85149;  /* Rosso — critical, offline */
  --status-unknown:  #6e7681;  /* Grigio — sconosciuto */
  --status-info:     #388bfd;  /* Blu — info, pendente */

  /* Testo */
  --text-primary:   #e6edf3;
  --text-secondary: #8b949e;
  --text-muted:     #484f58;

  /* Accent */
  --accent:         #388bfd;  /* Link, focus ring, selezione attiva */
}
```

### Tipografia

Scegli font tecnici/monospaced per i valori metrici. Evita font generici.

```
Display/Heading : "JetBrains Mono" o "IBM Plex Mono" (per titoli e valori)
Body            : "Inter" o "DM Sans" (per testo leggibile)
Metriche/Numeri : font-mono sempre — mai font proporzionali per valori numerici
```

### Spacing — base 4px

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  24px
2xl: 32px
3xl: 48px
```

---

## 📄 PAGINA 1: FLEET OVERVIEW

> **Obiettivo:** vedere lo stato di 50+ macchine in una sola schermata. No grafici. Solo dati.

### Layout globale

```
┌──────────────────────────────────────────────────────────┐
│ NAVBAR                                                   │
│ [≡ MISAT Monitor]     🔔 3 critical     ● WS Connected  │
├────────┬─────────────────────────────────────────────────┤
│        │  STATUS BAR GLOBALE                             │
│ SIDE   │  ■ 47 OK  ■ 4 Warning  ■ 2 Critical  ■ 1 Down  │
│ BAR    ├─────────────────────────────────────────────────┤
│        │  FILTRI + SEARCH                                │
│ Dash   │  [Search host...] [Tutti▾] [OK] [Warn] [Crit]  │
│ Alerts ├─────────────────────────────────────────────────┤
│ Config │  FLEET TABLE (virtualizzata, 50+ righe)         │
│        │  ┌──────────────────────────────────────────┐  │
│        │  │ HOST         STATUS  CPU   RAM   DISK  … │  │
│        │  │ server-01    ● OK    23%   45%    31%  … │  │
│        │  │ server-02    ⚠ WARN  78%   87%    55%  … │  │
│        │  │ server-03    🔴 CRIT  95%   92%    89%  … │  │
│        │  │ server-04    ○ DOWN   --    --     --   … │  │
│        │  │ …                                         │  │
│        │  └──────────────────────────────────────────┘  │
└────────┴─────────────────────────────────────────────────┘
```

### Status Bar globale (header della tabella)

Barra riepilogativa sempre visibile sopra la tabella. Aggiornamento real-time via WebSocket.

```jsx
// FleetStatusBar
{
  ok:       { count: 47, color: '--status-ok',       label: 'OK' },
  warning:  { count: 4,  color: '--status-warning',  label: 'Warning' },
  critical: { count: 2,  color: '--status-critical', label: 'Critical' },
  down:     { count: 1,  color: '--status-unknown',  label: 'Down' }
}

// Rendering: pillole colorate + totale a destra
// Es: [■ 47 OK] [■ 4 Warning] [■ 2 Critical] [■ 1 Down]  Totale: 54
```

### Filtri e ricerca

```jsx
// FleetFilters
<SearchInput placeholder="Cerca hostname, IP..." />
<GroupFilter />        // Dropdown: Tutti | Gruppo A | Gruppo B
<StatusFilter multi /> // Toggle: OK | Warning | Critical | Down
<SortControl />        // Status (default) | CPU | RAM | Disk | Nome
```

### FleetTable — colonne

```
| HOST          | STATUS    | CPU   | RAM   | DISK  | UPTIME   | ALERTS | AZIONE |
|---------------|-----------|-------|-------|-------|----------|--------|--------|
| server-01     | ● OK      | 23%   | 45%   | 31%   | 14d 3h   |   —    |   →    |
| server-02     | ⚠ Warning | 78%   | 87%   | 55%   |  2d 1h   |   2    |   →    |
| server-03     | 🔴 Critical| 95%   | 92%   | 89%   | 12h 4m   |   5    |   →    |
```

**Regole colore celle metriche:**
- CPU/RAM/Disk < 70% → `var(--text-secondary)` (neutro)
- 70–85% → `var(--status-warning)` + sfondo `amber/10`
- > 85% → `var(--status-critical)` + sfondo `red/10`

**Regole riga intera:**
- Status Critical → bordo sinistro `4px solid var(--status-critical)` + `bg-red/5`
- Status Down → opacity 0.6, testo in italic

**Click su riga** → naviga a `/devices/:id` (Device Detail)

**Hover su riga** → `bg-elevated`, cursor pointer, freccia → visibile

**Colonna ALERTS** → chip colorato con numero. Click → apre Alert Center filtrato per quel nodo.

### Virtualizzazione (OBBLIGATORIA per 50+ nodi)

```bash
npm install @tanstack/react-virtual
```

```jsx
import { useVirtualizer } from '@tanstack/react-virtual'

// La tabella usa un virtualizer sull'asse Y.
// Renderizza solo le righe visibili nel viewport.
// Row height: 48px (fixed)
// Overscan: 5 righe sopra e sotto il viewport
```

Senza virtualizzazione, con 50+ righe e aggiornamenti WebSocket ogni secondo,
il browser andrà in lag. Non è opzionale.

### Skeleton loading

```jsx
// Mentre il fetch iniziale è in corso: 8 righe placeholder
<SkeletonRow />  // bg-surface, pulse animation, 3 colori diversi per sembrare reale
```

---

## 📊 PAGINA 2: DEVICE DETAIL

> **Obiettivo:** analisi completa di una singola macchina. Ci sono i grafici qui, non nell'overview.

Navigazione: click su riga Fleet Table → `/devices/:id`

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ ← Fleet Overview     server-01 / 192.168.1.10   ● Online│
├──────────────────────────────────────────────────────────┤
│ KPI ROW (4 card inline)                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ CPU      │ │ RAM      │ │ Disk /   │ │ Uptime   │    │
│ │ 45.2%    │ │ 8.1/16GB │ │ 31%      │ │ 14d 3h   │    │
│ │ ↑ +2%    │ │ ⚠ 87%    │ │ OK       │ │ Stabile  │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
├──────────────────────────────────────────────────────────┤
│ RANGE: [1h] [6h] [24h] [7d]                              │
├──────────────────────────────────────────────────────────┤
│ GRAFICO — CPU Usage (%)                [export SVG]      │
│ [AreaChart — Recharts]                                   │
│ Avg 34.2% │ Max 91.3% │ Min 12.1%                        │
├──────────────────────────────────────────────────────────┤
│ GRAFICO — Memory Usage (GB / %)        [export SVG]      │
│ [AreaChart — Recharts]                                   │
│ Total 16GB │ Avg 8.1GB │ Max 14.8GB                       │
├──────────────────────────────────────────────────────────┤
│ GRAFICO — Disk per mount point         [export SVG]      │
│ [LineChart multi-linea]                                  │
│ Legend: / ■  /home ■  /var ■                             │
├──────────────────────────────────────────────────────────┤
│ DISK TABLE (stato corrente mount point)                  │
│ Mount | Total | Used | Free | % | Status                 │
│ /     │ 500GB │ 155G │ 345G │31%│ ● OK                  │
├──────────────────────────────────────────────────────────┤
│ ALERT TABLE (ultimi 50 alert)                            │
│ Severity | Metrica | Valore | Soglia | Quando | Stato    │
└──────────────────────────────────────────────────────────┘
```

### DeviceHeader

```jsx
{
  breadcrumb: "← Fleet Overview",
  title: node.name,            // "server-01"
  subtitle: `${node.host}:${node.port}`,
  status: <StatusBadge />,
  actions: [
    { icon: "Settings", label: "Configura", onClick: openConfig },
    { icon: "Trash2",   label: "Rimuovi",   onClick: confirmRemove, style: "danger" }
  ]
}
```

### DeviceKPIRow — 4 card

```jsx
const kpis = [
  {
    label: "CPU",
    value: `${cpu.toFixed(1)}%`,
    trend: cpuTrend,          // { direction: 'up'|'down', delta: 2.1 }
    status: cpu > 85 ? 'critical' : cpu > 70 ? 'warning' : 'ok'
  },
  {
    label: "RAM",
    value: `${memUsedGB.toFixed(1)}/${memTotalGB}GB`,
    sub: `${memPercent.toFixed(0)}%`,
    status: memPercent > 85 ? 'critical' : memPercent > 70 ? 'warning' : 'ok'
  },
  {
    label: "Disk /",
    value: `${diskPercent.toFixed(0)}%`,
    sub: `${diskFreeGB}GB liberi`,
    status: diskPercent > 85 ? 'critical' : diskPercent > 70 ? 'warning' : 'ok'
  },
  {
    label: "Uptime",
    value: formatUptime(uptimeSeconds),   // "14d 3h"
    status: 'ok'
  }
]
```

Card styling per status:
- `ok` → bordo `var(--status-ok)/30`, sfondo neutro
- `warning` → bordo `var(--status-warning)/40`, sfondo `amber/5`
- `critical` → bordo `var(--status-critical)/50`, sfondo `red/5`, leggero glow

### Range Selector

```jsx
const ranges = ['1h', '6h', '24h', '7d']

// ButtonGroup orizzontale
// Attivo: bg-accent, text-white
// Inattivo: bg-surface, text-secondary
// onChange → refetch dati grafici via TanStack Query
```

### MetricChart (wrapper Recharts riusabile)

```jsx
<MetricChart
  title="CPU Usage (%)"
  data={cpuData}           // [{ timestamp, value }]
  dataKey="value"
  color="var(--status-info)"
  threshold={85}           // ReferenceLine rossa tratteggiata
  unit="%"
  height={240}
  loading={isLoading}
  onExport={exportSVG}
/>
```

**Features obbligatorie:**
- `ResponsiveContainer` (larghezza auto)
- Gradient fill leggero sotto la linea (area chart)
- `ReferenceLine` rossa tratteggiata a soglia (85% default)
- Tooltip custom: timestamp formattato + valore con unità
- Riga stats sotto: Avg / Max / Min calcolati sul range
- Smart sampling: se i punti > 300, aggrega in medie (non decimare casualmente)
- Skeleton animato quando `loading={true}`

**Per il Disk chart — multi-linea:**
```jsx
<MetricChart
  title="Disk Usage per mount point"
  data={diskData}
  multi={true}
  dataKeys={mountPoints}     // ['/_percent', '/home_percent']
  colors={['#d29922', '#8957e5', '#388bfd']}
  threshold={85}
  height={220}
/>
// Legend interattiva: click su una linea per nasconderla/mostrarla
```

### DiskTable

Tabella statica (dati correnti, non storici):

```
| Mount Point | Totale | Usato | Libero | %   | Status  |
|-------------|--------|-------|--------|-----|---------|
| /           | 500 GB | 155 G | 345 GB | 31% | ● OK    |
| /home       | 1 TB   | 670 G | 354 GB | 67% | ⚠ Warn  |
| /var        | 200 GB |  46 G | 154 GB | 23% | ● OK    |
```

Colore % → stesse regole della FleetTable (verde/giallo/rosso).

### AlertTable

```
| Severity    | Metrica | Valore | Soglia | Quando       | Stato   |
|-------------|---------|--------|--------|--------------|---------|
| 🔴 Critical | CPU     | 92.3%  | 85%    | 2h fa        | Attivo  |
| 🟡 Warning  | Memory  | 87.1%  | 85%    | 45min fa     | Attivo  |
| 🔴 Critical | Disk /  | 91%    | 85%    | Ieri 14:32   | Risolto |
```

- Paginazione: 20 alert per pagina
- Filtro: Attivi / Risolti / Tutti
- Riga "Risolto" → opacity ridotta, testo muted
- Click su riga → pannello laterale con dettaglio (opzionale, fase 2)

---

## 🔄 STATE MANAGEMENT

### Zustand Store

```js
// store/useMonitorStore.js
{
  // Dati flotta
  nodes: [],                    // Array<Node>
  currentMetrics: {},           // { [nodeId]: Metrics }

  // UI globale
  alerts: [],                   // Array<Alert>
  unreadAlertCount: 0,
  wsConnected: false,
  selectedRange: '1h',          // Per Device Detail

  // Azioni
  setNodes: (nodes) => {},
  updateMetrics: (nodeId, metrics) => {},
  addAlert: (alert) => {},
  markAlertRead: (id) => {},
  markAllRead: () => {},
  setWsConnected: (bool) => {},
  setSelectedRange: (range) => {}
}
```

### TanStack Query

Usa TanStack Query per i fetch HTTP (dati storici grafici, lista nodi, alert table).
Zustand gestisce solo lo stato real-time WebSocket e lo stato UI.

```bash
npm install @tanstack/react-query
```

```js
// hooks/useDeviceMetrics.js
export const useDeviceMetrics = (nodeId, range) => {
  return useQuery({
    queryKey: ['metrics', nodeId, range],
    queryFn: () => api.get(`/nodes/${nodeId}/metrics?range=${range}`),
    refetchInterval: 30_000,    // Fallback polling se WS non disponibile
    staleTime: 10_000
  })
}

// hooks/useFleetData.js
export const useFleetData = () => {
  return useQuery({
    queryKey: ['fleet'],
    queryFn: () => api.get('/nodes'),
    refetchInterval: 15_000,
    staleTime: 5_000
  })
}
```

---

## 📡 WEBSOCKET — Implementazione corretta

```js
// hooks/useWebSocket.js
import { useEffect, useRef } from 'react'
import { useMonitorStore } from '../store/useMonitorStore'

export const useWebSocket = (url) => {
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const store = useMonitorStore()

  const connect = () => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      store.setWsConnected(true)
      clearTimeout(reconnectTimerRef.current)
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      handleMessage(msg, store)
    }

    ws.onclose = () => {
      store.setWsConnected(false)
      // Reconnect automatico con backoff lineare (max 30s)
      reconnectTimerRef.current = setTimeout(connect, Math.min(
        3000 + (wsRef.current._retries || 0) * 2000, 30000
      ))
    }

    ws.onerror = () => ws.close()  // Trigger onclose per il reconnect
  }

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [])
}

const handleMessage = (msg, store) => {
  switch (msg.type) {
    case 'metrics_update':
      store.updateMetrics(msg.nodeId, msg.data)
      break
    case 'new_alert':
      store.addAlert(msg.data)
      showToast(msg.data)   // Notifica
      break
    case 'node_status_change':
      store.updateNodeStatus(msg.nodeId, msg.status)
      break
  }
}
```

**WebSocket message format:**
```json
{ "type": "metrics_update", "nodeId": "uuid", "data": { "cpu_percent": 45.2, "memory_percent": 67.3, "timestamp": "2026-05-07T10:00:00Z" } }
{ "type": "new_alert",      "data": { "id": "uuid", "nodeId": "uuid", "nodeName": "server-01", "metric": "cpu", "value": 92.3, "threshold": 85, "severity": "critical" } }
{ "type": "node_status_change", "nodeId": "uuid", "status": "offline" }
```

**Debounce aggiornamenti UI:** usa un debounce 150ms sugli update metriche per
evitare re-render troppo frequenti su 50+ nodi in parallelo.

---

## 🔔 TOAST NOTIFICATIONS

```jsx
// Appare bottom-right, stacks verticalmente
// Solo per new_alert — non per metrics_update

<AlertToast
  type="critical"              // 'warning' | 'critical'
  title="server-01 — CPU"
  message="CPU al 92.3%, soglia 85%"
  link="/devices/uuid"         // "Vai al nodo →"
  autoClose={6000}
/>

// Styling
// Critical: bg-[#1c0a0a], border-[var(--status-critical)], testo rosso chiaro
// Warning:  bg-[#1a1200], border-[var(--status-warning)], testo giallo chiaro

// Animation: slide-in da destra (200ms ease-out), fade-out (300ms)
// Stack: gap-2, massimo 4 toast visibili contemporaneamente
// Sound: play beep solo su CRITICAL (rispetta prefers-reduced-motion e volume sistema)
```

---

## ♿ ACCESSIBILITÀ — WCAG AA (non AAA)

Il target è **WCAG 2.1 AA**, non AAA. AAA è impraticabile per dashboard real-time.

- Contrast ratio testo/sfondo: 4.5:1 minimo (AA)
- Focus ring visibile su ogni elemento interattivo (2px, colore accent)
- Keyboard navigation: Tab logico, Escape chiude modali, Enter attiva bottoni
- `aria-live="polite"` su alert counter e WS status
- `aria-label` su icone senza testo
- Semantic HTML: `<main>`, `<nav>`, `<table>`, `<th scope>`, `<button>`
- Rispetta `prefers-reduced-motion` (disabilita animazioni)

---

## ⚡ PERFORMANCE — TARGET REALISTICI

### Bundle size stimato (gzipped)

```
React + ReactDOM         ~42KB
Recharts                 ~55KB
Zustand                   ~3KB
TanStack Query           ~15KB
TanStack Virtual          ~5KB
React Router             ~25KB
Axios                    ~12KB
Lucide React (tree-shaken) ~8KB
────────────────────────────────
Librerie totali:        ~165KB
Codice tuo:            ~20–40KB
────────────────────────────────
TOTALE REALISTICO:     ~200–210KB gzipped
```

Target "< 150KB" del prompt precedente è **impossibile** con questo stack.
Obiettivo realistico: **< 250KB gzipped**.

### Lighthouse target

```
Performance:    80+  (non 90+ — WebSocket e grafici pesano)
Accessibility:  90+
Best Practices: 95+
SEO:            90+  (irrilevante per tool interno, ma comunque)
```

### Core Web Vitals

```
LCP: < 3.0s   (non 2.5s — i grafici richiedono fetch dati)
FID: < 100ms
CLS: < 0.1
```

### Ottimizzazioni obbligatorie

- Virtual scrolling sulla FleetTable (`@tanstack/react-virtual`)
- Debounce 150ms su WebSocket metrics update
- Smart sampling grafici: max 300 punti (aggrega in medie, non decimare)
- `React.memo` su `FleetTableRow` (evita re-render su aggiornamenti non pertinenti)
- Lazy loading pagina DeviceDetail (`React.lazy` + `Suspense`)
- Grafico fuori viewport: non aggiornare (Intersection Observer)

---

## 🏗️ FASI DI IMPLEMENTAZIONE

### Phase 1 — Foundation (2 giorni)
- [ ] Setup Vite + React 18 + Tailwind (dark mode)
- [ ] Zustand store base
- [ ] TanStack Query provider
- [ ] React Router: `/` e `/devices/:id`
- [ ] Layout: Navbar + Sidebar + PageShell
- [ ] CSS variables design tokens

### Phase 2 — Componenti atomici (2 giorni)
- [ ] StatusBadge (ok/warning/critical/unknown)
- [ ] MetricBar (progress bar colorata)
- [ ] AlertChip (numero alert)
- [ ] Spinner + Skeleton
- [ ] AlertToast (notifica)

### Phase 3 — Fleet Overview (3 giorni)
- [ ] FleetStatusBar (contatori globali)
- [ ] FleetFilters (search + filtri status)
- [ ] FleetTable con virtualizzazione (`@tanstack/react-virtual`)
- [ ] FleetTableRow (click → navigate)
- [ ] Fetch dati con TanStack Query

### Phase 4 — Device Detail (4 giorni)
- [ ] DeviceHeader (breadcrumb + status + azioni)
- [ ] DeviceKPIRow (4 card)
- [ ] RangeSelector
- [ ] MetricChart (wrapper Recharts) — CPU
- [ ] MetricChart — Memory
- [ ] MetricChart multi-linea — Disk
- [ ] DiskTable (mount point correnti)
- [ ] AlertTable (storico alert)

### Phase 5 — Integrazione real-time (2 giorni)
- [ ] useWebSocket hook (con reconnect corretto)
- [ ] Handler per metrics_update, new_alert, node_status_change
- [ ] Debounce aggiornamenti UI
- [ ] Toast notification su new_alert

### Phase 6 — Polish + QA (2 giorni)
- [ ] Responsive (tablet/mobile — sidebar collassabile)
- [ ] Loading states e error states su ogni pagina
- [ ] Accessibilità audit (axe DevTools)
- [ ] Test WebSocket reconnect
- [ ] Bundle size check (`vite-bundle-analyzer`)
- [ ] Cross-browser test

**Totale stimato: ~15 giorni**

---

## 📦 DIPENDENZE

```bash
# Core
npm install react@18 react-dom@18 react-router-dom

# Build
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer

# State + Data fetching
npm install zustand @tanstack/react-query axios

# UI + Grafici
npm install recharts lucide-react

# Performance
npm install @tanstack/react-virtual

# Dev tools
npm install -D @tanstack/react-query-devtools vite-bundle-visualizer
```

---

## 📞 RIFERIMENTI

- Recharts: https://recharts.org/en-US/api
- TanStack Query: https://tanstack.com/query/latest
- TanStack Virtual: https://tanstack.com/virtual/latest
- Zustand: https://docs.pmnd.rs/zustand
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev/icons
- Checkmk (ispirazione UI): https://checkmk.com

---

**Progetto:** MISAT Monitor v2.0  
**Data:** 2026-05-07  
**Note:** Questo prompt sostituisce `FRONTEND_DESIGN_PROMPT.md` v1.  
Vedi `INITIAL.md` per l'architettura backend e le API disponibili.
