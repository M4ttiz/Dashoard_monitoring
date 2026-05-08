# CURSOR PROMPT — Fix completo frontend: route, pagine reali, CSS responsive
# Branch: feature/prompt-11-frontend-v2

---

## CONTESTO E STACK

- React + React Router v6 + Tailwind CSS + Lucide React
- Token CSS custom: `bg-bg-surface`, `bg-bg-elevated`, `bg-bg-base`, `border-bg-border`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-accent`
- Backend FastAPI con queste API reali disponibili:
  - `GET /api/nodes` → lista nodi con id, nome, status, IP, ecc.
  - `GET /api/metrics/{node_id}/current` → snapshot CPU/RAM/disco corrente
  - `GET /api/metrics/{node_id}?from=X&to=Y` → storico metriche
  - `GET /api/alerts` → lista alert
  - `PATCH /api/alerts/{alert_id}/read` → segna alert come letto
  - `PATCH /api/alerts/read-all` → segna tutti come letti
  - `GET /api/config` → configurazione monitor (poll interval, soglie, ecc.)
  - `PATCH /api/config` → salva configurazione

**NON esistono endpoint per: services, users, roles, integrations.**

---

## REGOLE ASSOLUTE

1. **ZERO dati mock inventati** — ogni dato viene da fetch alle API reali sopra elencate
2. **ZERO pagine con "Coming Soon"** — ogni pagina ha contenuto reale e funzionante
3. **Non toccare**: `FleetOverview.jsx`, `HostsPage.jsx`, `AlertCenter.jsx`, `InventoryPage.jsx`, `DeviceDetail.jsx` e tutti i file in `components/`
4. **Non installare dipendenze npm nuove**
5. Ogni fetch usa `useEffect` + `useState` con stato loading/error gestito
6. Il CSS deve essere **responsive**: funziona su desktop (1920px), laptop (1366px) e tablet (768px). Usa classi Tailwind responsive (`sm:`, `md:`, `lg:`). Niente overflow orizzontale, niente elementi che escono dallo schermo
7. Pattern fetch da usare in ogni pagina:
```jsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetch('/api/...')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(setData)
    .catch(e => setError(String(e)))
    .finally(() => setLoading(false))
}, [])

if (loading) return <Spinner />
if (error) return <p className="text-red-400">Errore: {error}</p>
```

---

## TASK 1 — Pulizia Sidebar (`frontend/src/components/layout/Sidebar.jsx`)

Rimuovi dalla sidebar le voci che non hanno una pagina backend reale.
La sidebar finale deve contenere SOLO queste voci, tutte con `to` e SENZA `disabled`:

```js
const NAV_SECTIONS = [
  {
    id: 'monitoring',
    label: 'Monitoring',
    items: [
      { to: '/',          label: 'Overview',   icon: LayoutDashboard, end: true },
      { to: '/hosts',     label: 'Hosts',      icon: Server },
      { to: '/alerts',    label: 'Alerts',     icon: AlertTriangle },
      { to: '/inventory', label: 'Inventory',  icon: Boxes },
      { to: '/maps',      label: 'Maps',       icon: Map },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { to: '/metrics', label: 'Metrics', icon: BarChart3 },
      { to: '/trends',  label: 'Trends',  icon: TrendingUp },
      { to: '/reports', label: 'Reports', icon: FileBarChart2 },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { to: '/settings',     label: 'Settings',     icon: Settings },
      { to: '/integrations', label: 'Integrations', icon: Plug },
    ],
  },
]
```

Rimuovi completamente: Services, Dashboards, Users, Roles (non hanno backend).

---

## TASK 2 — Aggiorna `App.jsx`

Assicurati che queste siano le UNICHE route presenti (aggiungi quelle mancanti, rimuovi quelle per pagine eliminate):

```jsx
import ServicesPage    // RIMUOVI se presente
import DashboardsPage  // RIMUOVI se presente
import UsersPage       // RIMUOVI se presente
import RolesPage       // RIMUOVI se presente
import MapsPage        from './pages/MapsPage.jsx'        // aggiungi se manca

// Route finali:
<Route path="/"             element={<FleetOverview />} />
<Route path="/hosts"        element={<HostsPage />} />
<Route path="/inventory"    element={<InventoryPage />} />
<Route path="/devices/:id"  element={<DeviceDetail />} />
<Route path="/alerts"       element={<AlertCenter />} />
<Route path="/maps"         element={<MapsPage />} />
<Route path="/metrics"      element={<MetricsPage />} />
<Route path="/trends"       element={<TrendsPage />} />
<Route path="/reports"      element={<ReportsPage />} />
<Route path="/settings"     element={<SettingsPage />} />
<Route path="/integrations" element={<IntegrationsPage />} />
<Route path="*"             element={<Navigate to="/" replace />} />
```

---

## TASK 3 — `frontend/src/pages/MapsPage.jsx` (crea o riscrivi)

**Dati:** `GET /api/nodes`

**Layout:**
- Header: "Network Map" + "Visual topology of monitored hosts"
- Mappa SVG che mostra i nodi come cerchi colorati, tutti connessi con linee a un nodo centrale "Gateway"
  - Verde = status "up" o "ok"
  - Giallo = status "warning"
  - Rosso = status "down" o "critical"
  - Grigio = status sconosciuto
- I nodi sono posizionati in cerchio attorno al Gateway centrale con coordinate calcolate trigonometricamente (non hardcoded)
- Hover su nodo: mostra tooltip con `node.name`, `node.ip` (o `node.address`), `node.status`
- Sotto la mappa SVG: tabella responsive con colonne Host | IP | Status — dati presi da `/api/nodes`
- Legenda colori in basso a sinistra della mappa

**Calcolo posizioni nodi (usa questo algoritmo):**
```js
const cx = 400, cy = 300, r = 200
nodes.map((node, i) => {
  const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
  return { ...node, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
})
```

---

## TASK 4 — `frontend/src/pages/MetricsPage.jsx` (riscrivi completamente)

**Dati:** `GET /api/nodes` + `GET /api/metrics/{node_id}/current` per ogni nodo + `GET /api/metrics/{node_id}` per lo storico

**Layout:**
- Header: "Metrics" + "Real-time and historical performance data"
- Riga selettori: dropdown "Select Host" (opzioni da `/api/nodes`) + dropdown "Metric" (CPU / RAM / Disk) + dropdown "Range" (1h / 6h / 24h / 7d)
- Grafico a linea grande usando `<MetricChart>` già esistente in `components/device/MetricChart.jsx` — passa i dati storici del nodo selezionato
- Sotto il grafico: 4 card KPI con valori calcolati dai dati storici: Current | Average | Peak | Minimum — mostra il valore in % con 1 decimale
- Se nessun nodo selezionato: messaggio "Select a host to view metrics"
- Se `/api/metrics/{id}/current` ritorna 404 (nodo offline): mostra banner giallo "No recent data for this host"

---

## TASK 5 — `frontend/src/pages/TrendsPage.jsx` (riscrivi completamente)

**Dati:** `GET /api/nodes` + `GET /api/metrics/{node_id}` per tutti i nodi + `GET /api/alerts`

**Layout:**
- Header: "Trends" + "Usage patterns and capacity forecasting"

**Sezione 1 — "Disk Capacity Forecast":**
- Tabella con colonne: Host | Disk Used | Disk Total | % Used | Trend
- Dati da `/api/metrics/{id}/current` per ogni nodo
- Barra di progresso per "% Used" (verde < 70%, giallo 70-90%, rosso > 90%)
- Colonna "Trend": se % used > 85% mostra badge rosso "Critical", se > 70% badge giallo "Warning", altrimenti badge verde "OK"

**Sezione 2 — "Top CPU Consumers":**
- Lista top 5 nodi ordinati per CPU% corrente (da `/api/metrics/{id}/current`)
- Per ogni nodo: nome + barra orizzontale colorata + valore %

**Sezione 3 — "Top RAM Consumers":**
- Stessa struttura di Sezione 2 ma per RAM%

**Sezione 4 — "Alert Frequency":**
- Conteggio alert per nodo (da `/api/alerts`): tabella Host | Total Alerts | Last Alert — ordinata per totale decrescente

---

## TASK 6 — `frontend/src/pages/ReportsPage.jsx` (riscrivi completamente)

**Dati:** `GET /api/nodes` + `GET /api/alerts` + `GET /api/metrics/{node_id}/current`

**Layout:**
- Header: "Reports" + "Summary of fleet health and activity"

**Sezione 1 — "Fleet Summary":**
- 4 card: Total Hosts | Online | Offline | Total Alerts (non letti)
- Dati calcolati da `/api/nodes` e `/api/alerts`

**Sezione 2 — "Host Health Table":**
- Tabella con colonne: Host | Status | CPU% | RAM% | Disk% | Alerts | Uptime
- Ogni riga: dati da `/api/nodes` + `/api/metrics/{id}/current`
- Riga colorata di rosso tenue se host down, giallo se warning
- Pulsante "Export CSV" in alto a destra che scarica la tabella come file CSV usando solo JS vanilla (no librerie):
```js
const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
const blob = new Blob([csv], { type: 'text/csv' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click()
```

**Sezione 3 — "Recent Alerts":**
- Tabella ultimi 10 alert da `/api/alerts` con colonne: Time | Host | Message | Severity
- Badge colorato per Severity

---

## TASK 7 — `frontend/src/pages/SettingsPage.jsx` (riscrivi completamente)

**Dati:** `GET /api/config` per leggere + `PATCH /api/config` per salvare

**Prima cosa:** fai `GET /api/config` e mostra i campi reali restituiti. Non inventare campi.

**Layout:**
- Header: "Settings" + "Monitoring configuration"
- Form con i campi esatti restituiti da `GET /api/config` — usa input number per valori numerici, input text per stringhe
- Pulsante "Save" che fa `PATCH /api/config` con i valori aggiornati
- Feedback visivo dopo salvataggio: banner verde "Settings saved" per 3 secondi
- Feedback errore: banner rosso "Save failed"
- Nessuna tab, nessuna sezione inventata — solo i campi che esistono davvero nell'API

---

## TASK 8 — `frontend/src/pages/IntegrationsPage.jsx` (riscrivi completamente)

**Nota:** il backend NON ha endpoint per le integrazioni. Questa pagina è solo UI informativa.

**Layout:**
- Header: "Integrations" + "Connect external notification services"
- Banner informativo giallo in cima: "Integrations are configured via environment variables on the server. Restart the backend container after changes."
- 4 card (solo UI, niente fetch):
  1. **Email (SMTP)** — icona Mail — descrizione "Send alert notifications via email" — mostra le env var da configurare: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
  2. **Slack** — icona MessageSquare — descrizione "Send alerts to a Slack channel" — mostra: `SLACK_WEBHOOK_URL`
  3. **Microsoft Teams** — icona Users — descrizione "Send alerts to a Teams channel" — mostra: `TEAMS_WEBHOOK_URL`
  4. **Telegram** — icona Send — descrizione "Send alerts via Telegram bot" — mostra: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Ogni card mostra le variabili d'ambiente in un blocco `<code>` con sfondo scuro
- In fondo: link "View documentation" (href="#" per ora)

---

## TASK 9 — CSS Responsive (controlla tutti i file modificati)

Dopo aver scritto tutte le pagine, controlla che:

1. **Nessuna pagina ha `overflow-x` orizzontale** — se una tabella è troppo larga, wrappala in `<div className="overflow-x-auto">`
2. **Le grid sono responsive:**
   - 4 card KPI: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
   - 2 colonne: `grid grid-cols-1 md:grid-cols-2`
   - 3 colonne: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
3. **La mappa SVG in MapsPage** ha `viewBox` e `width="100%"` per scalare correttamente
4. **I dropdown/select** hanno `w-full sm:w-auto` per non rompere il layout su mobile
5. **Le tabelle** su schermi piccoli hanno `text-xs` e le colonne meno importanti sono nascoste con `hidden md:table-cell`

---

## ORDINE DI ESECUZIONE

1. `Sidebar.jsx` — rimuovi voci senza backend
2. `App.jsx` — sincronizza le route
3. `MapsPage.jsx`
4. `MetricsPage.jsx`
5. `TrendsPage.jsx`
6. `ReportsPage.jsx`
7. `SettingsPage.jsx`
8. `IntegrationsPage.jsx`
9. Verifica CSS responsive su tutte le pagine modificate

Dopo ogni file: `npm run build` nella cartella `frontend/` per verificare zero errori TypeScript/ESLint prima di procedere.