# CURSOR PROMPT — Implementazione pagine sidebar mancanti
# Branch: feature/prompt-11-frontend-v2
# Repo: M4ttiz/Dashoard_monitoring

---

## CONTESTO

Stai lavorando su un fleet monitoring dashboard per macchine Windows aziendali.
Stack: **React + React Router v6 + Tailwind CSS + Lucide React**.
Le classi CSS usano design token custom (`bg-bg-surface`, `text-text-primary`, `text-accent`, ecc.).

### Struttura file esistente rilevante:
```
frontend/src/
├── App.jsx                          ← routing principale
├── pages/
│   ├── FleetOverview.jsx            ✅ funzionante
│   ├── HostsPage.jsx                ✅ funzionante
│   ├── AlertCenter.jsx              ✅ funzionante
│   ├── InventoryPage.jsx            ✅ funzionante
│   ├── DeviceDetail.jsx             ✅ funzionante
│   ├── MetricsPage.jsx              ⚠️ esiste ma potrebbe essere "coming soon"
│   ├── TrendsPage.jsx               ⚠️ esiste ma potrebbe essere "coming soon"
│   ├── ReportsPage.jsx              ⚠️ esiste ma potrebbe essere "coming soon"
│   ├── SettingsPage.jsx             ⚠️ esiste ma potrebbe essere "coming soon"
│   ├── IntegrationsPage.jsx         ⚠️ esiste ma potrebbe essere "coming soon"
│   └── SimplePlaceholderPage.jsx    ← pagina "coming soon" generica
├── components/
│   ├── layout/Sidebar.jsx           ← navigazione
│   ├── layout/PageShell.jsx
│   ├── layout/Navbar.jsx
│   ├── ui/ (StatusBadge, MetricBar, Spinner, AlertChip, SkeletonCard, ecc.)
│   ├── fleet/ (FleetTable, FleetTableRow, FleetFilters, FleetStatusBar)
│   └── device/ (MetricChart, AlertTable, DiskTable, DeviceKPIRow, ecc.)
```

---

## OBIETTIVO

Implementare **tutte le pagine mancanti** dalla sidebar e completare quelle parziali, in modo che ogni voce di navigazione sia funzionante con contenuto reale e coerente con il resto dell'app.

---

## TASK 1 — Aggiornare `Sidebar.jsx`

Nel file `frontend/src/components/layout/Sidebar.jsx`, nella costante `NAV_SECTIONS`, rimuovi `disabled: true` e aggiungi il campo `to` per questi item:

```js
// MONITORING
{ to: '/services', label: 'Services', icon: Gauge }       // era disabled
{ to: '/maps',     label: 'Maps',     icon: Map }          // era disabled
{ to: '/dashboards', label: 'Dashboards', icon: Package }  // era disabled

// ADMINISTRATION
{ to: '/users', label: 'Users', icon: Users }              // era disabled
{ to: '/roles', label: 'Roles', icon: Shield }             // era disabled
```

---

## TASK 2 — Aggiornare `App.jsx`

Nel file `frontend/src/App.jsx`, aggiungere le route mancanti:

```jsx
<Route path="/services"   element={<ServicesPage />} />
<Route path="/maps"       element={<MapsPage />} />
<Route path="/dashboards" element={<DashboardsPage />} />
<Route path="/users"      element={<UsersPage />} />
<Route path="/roles"      element={<RolesPage />} />
```

Aggiungere i relativi import in cima al file.

---

## TASK 3 — Creare le pagine mancanti

Per ogni pagina, seguire questi principi stilistici:
- Usa gli stessi token CSS del progetto: `bg-bg-surface`, `bg-bg-elevated`, `border-bg-border`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-accent`
- Header pagina consistente con le altre pagine (titolo + sottotitolo)
- Usa i componenti UI esistenti dove appropriato (StatusBadge, MetricBar, Spinner, SkeletonCard, ecc.)
- Usa **dati mock realistici** (array JS hardcodati) per popolare le pagine — niente fetch reali
- Icone da `lucide-react`
- Layout responsive

---

### 📄 `frontend/src/pages/ServicesPage.jsx`

**Scopo:** mostrare tutti i servizi Windows monitorati su tutti gli host.

**Contenuto:**
- Header: titolo "Services" + sottotitolo "Monitored Windows services across all hosts"
- Barra filtri: input ricerca per nome servizio + dropdown stato (All / Running / Stopped / Warning)
- Tabella con colonne: `Service Name` | `Host` | `Status` | `PID` | `Start Type` | `Last Check`
- Badge colorati per Status: verde=Running, rosso=Stopped, giallo=Warning
- Mock data: almeno 10 servizi su 3 host diversi (es. "Windows Update", "IIS", "SQL Server", "Print Spooler", "Remote Desktop", "Windows Defender", "DHCP Client", "DNS Client", "Task Scheduler", "Windows Firewall")
- Contatori in alto: totale servizi, running, stopped, warning

---

### 📄 `frontend/src/pages/MapsPage.jsx`

**Scopo:** visualizzazione topologia della rete con gli host come nodi.

**Contenuto:**
- Header: titolo "Network Map" + sottotitolo "Visual topology of monitored hosts"
- Nota: non usare librerie esterne di grafi. Implementa una visualizzazione SVG semplice con:
  - Nodi circolari per ogni host, colorati per stato (verde=OK, giallo=Warning, rosso=Down)
  - Linee di connessione tra i nodi (tutti connessi a un nodo centrale "Gateway/Router")
  - Label con hostname sotto ogni nodo
  - Legenda colori in basso a sinistra
  - Tooltip al hover sul nodo: hostname, IP, status, servizi attivi
- Mock: usa gli stessi host della FleetOverview (toolticket, PC_DI_ANDREA, pasqui_pc)
- Sotto la mappa: tabella riassuntiva con host, IP, subnet

---

### 📄 `frontend/src/pages/DashboardsPage.jsx`

**Scopo:** dashboard personalizzabili con widget selezionabili dall'utente.

**Contenuto:**
- Header: titolo "Custom Dashboards" + sottotitolo "Build your personalized monitoring view"
- Toolbar: pulsante "Add Widget" + pulsante "Save Layout"
- Griglia 2x2 di widget, ciascuno con:
  - Titolo widget + pulsante X per rimuoverlo
  - Contenuto mock (mini-grafico a linea, numero KPI, o mini-tabella)
- Widget disponibili (modale al click su "Add Widget"):
  - CPU Usage (grafico linea)
  - RAM Usage (barra)
  - Host Status Summary (donut)
  - Top Alerts (lista)
  - Disk Usage (barra)
  - Services Status (contatori)
- Stato locale con useState: lista widget attivi
- Se nessun widget attivo: empty state con messaggio "No widgets added. Click 'Add Widget' to start."

---

### 📄 `frontend/src/pages/UsersPage.jsx`

**Scopo:** gestione utenti che hanno accesso al dashboard.

**Contenuto:**
- Header: titolo "Users" + sottotitolo "Manage access to the monitoring dashboard"
- Pulsante "Invite User" in alto a destra (apre un modale con form: nome, email, ruolo)
- Tabella con colonne: `Name` | `Email` | `Role` | `Last Login` | `Status` | `Actions`
- Badge ruolo: Admin (viola), Operator (blu), Viewer (grigio)
- Badge status: Active (verde), Inactive (grigio)
- Actions: pulsanti "Edit" e "Deactivate" per ogni riga
- Mock: 5 utenti con ruoli diversi
- Il modale "Invite User" deve avere: input nome, input email, select ruolo, pulsante "Send Invite" + "Cancel"

---

### 📄 `frontend/src/pages/RolesPage.jsx`

**Scopo:** gestione ruoli e permessi.

**Contenuto:**
- Header: titolo "Roles & Permissions" + sottotitolo "Define what each role can see and do"
- 3 card ruolo: **Admin**, **Operator**, **Viewer**
- Ogni card mostra:
  - Nome ruolo + badge colorato
  - Numero utenti assegnati
  - Lista di permessi con icona ✅/❌: View Dashboard, Manage Hosts, Acknowledge Alerts, Edit Settings, Manage Users, Export Reports
- Admin: tutti ✅
- Operator: View, Manage Hosts, Acknowledge Alerts, Export Reports ✅ | Edit Settings, Manage Users ❌
- Viewer: solo View Dashboard e Export Reports ✅ | tutto il resto ❌
- Pulsante "Edit Role" su ogni card (per ora solo console.log o alert "Coming soon")
- In basso: note informativa "Contact your administrator to request permission changes"

---

## TASK 4 — Completare le pagine esistenti parziali

Per ognuna, **prima controlla il contenuto attuale** del file. Se è una pagina "coming soon" o con contenuto placeholder, sostituiscila con il contenuto reale descritto sotto.

---

### 📄 `frontend/src/pages/MetricsPage.jsx`

**Contenuto:**
- Header: "Metrics" + "Historical performance data for all monitored hosts"
- Selettore host (dropdown con i 3 host mock) + selettore metrica (CPU / RAM / Disk / Network) + range temporale (1h / 6h / 24h / 7d)
- Grafico a linea grande che occupa tutta la larghezza (usa il componente `MetricChart` esistente se disponibile, altrimenti SVG path semplice)
- Sotto il grafico: 4 card KPI — Current Value, Average, Peak, Minimum
- Seconda sezione: "Compare Hosts" — grafico sovrapposto con linee colorate per host diversi

---

### 📄 `frontend/src/pages/TrendsPage.jsx`

**Contenuto:**
- Header: "Trends" + "Predictive analysis and usage patterns"
- Sezione 1 "Disk Space Forecast": tabella con colonne Host | Used | Total | % Used | Estimated Full In — con una barra di progresso per "% Used" e badge rosso se < 10% libero
- Sezione 2 "Top Resource Consumers" (ultima settimana): top 5 host per CPU media + top 5 per RAM media, come liste ordinate con barre
- Sezione 3 "Incident Heatmap": griglia 7x24 (giorni x ore) con celle colorate per intensità problemi (usa gradiente da verde a rosso) — dati mock casuali ma realistici (più problemi in orari lavorativi)
- Sezione 4 "Weekly Summary": confronto questa settimana vs settimana scorsa per: total alerts, avg CPU, avg RAM

---

### 📄 `frontend/src/pages/ReportsPage.jsx`

**Contenuto:**
- Header: "Reports" + "Generate and export monitoring reports"
- 4 card report pre-costruiti, ciascuna con titolo, descrizione, icona e pulsante "Generate":
  1. **Host Availability Report** — uptime % per host nel periodo selezionato
  2. **Alert Summary Report** — frequenza e tipologia alert
  3. **Resource Usage Report** — CPU/RAM/Disk medi per host
  4. **Service Health Report** — stato servizi nel tempo
- Ogni card ha un select per il range temporale (Last 7 days / Last 30 days / Last 3 months)
- Sotto le card: "Recent Reports" — tabella con colonne: Report Name | Generated On | Range | Format | Download
- Mock: 5 report già generati con link download fittizio (pulsante PDF/CSV disabilitato o con alert)

---

### 📄 `frontend/src/pages/SettingsPage.jsx`

**Contenuto:**
- Header: "Settings" + "Configure your monitoring environment"
- Layout a tab orizzontali: General | Notifications | Thresholds | Monitoring | Appearance
- **Tab General:** nome organizzazione (input), timezone (select), lingua (select), refresh interval dashboard (select: 30s/1m/5m/10m) — pulsante "Save Changes"
- **Tab Notifications:** toggle per Email / Slack / Teams / Telegram, input per endpoint/webhook quando toggle ON — pulsante "Test" per ciascuno
- **Tab Thresholds:** slider o input numerici per: CPU Warning (%), CPU Critical (%), RAM Warning (%), RAM Critical (%), Disk Warning (%), Disk Critical (%), alert repeat interval (minuti)
- **Tab Monitoring:** check interval (select), timeout (input), numero di retries (input), lista host esclusi dal monitoraggio
- **Tab Appearance:** toggle Dark/Light mode, accent color picker (4-5 colori predefiniti), toggle sidebar collapsed di default

---

### 📄 `frontend/src/pages/IntegrationsPage.jsx`

**Contenuto:**
- Header: "Integrations" + "Connect external services and tools"
- Griglia di card integrazione (2 colonne), ciascuna con:
  - Logo/icona + nome + descrizione breve
  - Toggle ON/OFF
  - Se ON: form inline con i campi necessari (webhook URL, token, ecc.)
  - Badge "Connected" (verde) o "Not configured" (grigio)
- Integrazioni da includere:
  1. **Email (SMTP)** — campi: host, port, username, password, from address
  2. **Slack** — campo: webhook URL
  3. **Microsoft Teams** — campo: webhook URL
  4. **Telegram** — campi: bot token, chat ID
  5. **Grafana** — campi: URL istanza, API key
  6. **Active Directory** — campi: server LDAP, base DN, bind user, bind password
- Pulsante "Save & Test" per ogni integrazione configurata

---

## REGOLE GENERALI DA RISPETTARE

1. **Non toccare** i file esistenti che già funzionano: `FleetOverview.jsx`, `HostsPage.jsx`, `AlertCenter.jsx`, `InventoryPage.jsx`, `DeviceDetail.jsx` e tutti i componenti in `components/`

2. **Non installare nuove dipendenze npm** — usa solo quello che è già nel progetto

3. **Dati mock coerenti**: usa sempre gli stessi 3 hostname (`toolticket`, `PC_DI_ANDREA`, `pasqui_pc`) e gli stessi range di valori (CPU 20-95%, RAM 40-85%) in tutte le pagine

4. **Componenti UI riutilizzabili**: prima di creare nuovi elementi, controlla se esiste già un componente adatto in `components/ui/` o `components/fleet/`

5. **Ogni nuova pagina** deve essere un default export e seguire questa struttura base:
```jsx
export default function NomePagina() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Titolo</h1>
        <p className="mt-1 text-sm text-text-secondary">Sottotitolo</p>
      </div>
      {/* Content */}
    </div>
  )
}
```

6. **Stato locale**: usa `useState` per filtri, tab attivi, toggle, modali — niente Redux o context globale aggiuntivo

7. **Accessibilità minima**: tutti i pulsanti devono avere `type="button"`, le form usano label associate

---

## ORDINE DI ESECUZIONE SUGGERITO

1. Aggiorna `Sidebar.jsx` (rimuovi disabled, aggiungi to)
2. Aggiorna `App.jsx` (aggiungi route e import)
3. Crea `ServicesPage.jsx`
4. Crea `MapsPage.jsx`
5. Crea `DashboardsPage.jsx`
6. Crea `UsersPage.jsx`
7. Crea `RolesPage.jsx`
8. Completa/sostituisci `MetricsPage.jsx`
9. Completa/sostituisci `TrendsPage.jsx`
10. Completa/sostituisci `ReportsPage.jsx`
11. Completa/sostituisci `SettingsPage.jsx`
12. Completa/sostituisci `IntegrationsPage.jsx`

Dopo ogni file, verifica che l'app compili senza errori prima di procedere al successivo.