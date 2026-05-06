Sei un senior frontend developer specializzato in React, TypeScript, Tailwind CSS e visualizzazione dati.  
Lavora sulla dashboard di monitoring attuale e implementa i seguenti miglioramenti, in ordine di priorità.

### 1. Architettura e Stato Globale (Zustand)
- Crea uno store Zustand (`useDashboardStore`) con questi slice:
  - `metrics`: dati correnti dei server (cpu, ram, disk, rete)
  - `historical`: storico ultimi 15 minuti
  - `alerts`: array di alert attivi con gravità e timestamp
  - `ui`: tema (light/dark), pannelli aperti, filtri attivi
  - `fetchStatus`: loading, error, lastUpdated
- Implementa un polling automatico configurabile (default ogni 10s) con React Query o un custom hook (`usePolling`).
- Aggiungi logica di retry esponenziale in caso di errore di rete.

### 2. Componenti UI Atomici e Molecole
- Crea un design system minimo con Tailwind:
  - `Card` (con varianti: default, compact, alert)
  - `Badge` (stati: ok, warning, critical, offline)
  - `Sparkline`, `Gauge`, `TrendIndicator` (freccia up/down con percentuale)
  - `Skeleton` per loading state di ogni tipo di grafico/tabella
  - `EmptyState` con illustrazione e messaggio personalizzato
  - `ErrorBoundary` con fallback UI e pulsante "Riprova"
- Tutti i componenti devono essere accessibili (ARIA labels, ruoli, keyboard nav).

### 3. Dashboard Layout e Responsività
- Layout a griglia CSS Grid che si adatta: 1 colonna mobile, 2 tablet, 3-4 desktop.
- Le card devono essere ridimensionabili e riordinabili tramite drag & drop (usa react-grid-layout o @dnd-kit).
- Salva il layout nel localStorage per sessione utente.
- Aggiungi un header fisso con:
  - Nome dashboard e orario ultimo aggiornamento
  - Indicatore di connessione (websocket/HTTP polling) con pallino verde/giallo/rosso
  - Toggle tema chiaro/scuro
  - Campanella notifiche con contatore alert attivi

### 4. Grafici e Visualizzazioni (Recharts)
- Ogni grafico deve gestire 4 stati: loading, empty, error, data.
- LineChart per metriche storiche: usa colori distinti per ogni server, legenda interattiva, brush per zoom.
- BarChart comparativo CPU/RAM tra server.
- Heatmap calendario (o griglia) per uptime giornaliero.
- Aggiungi tooltip personalizzati ricchi: oltre al valore, mostra variazione % rispetto al periodo precedente.
- Usa `useMemo` e `React.memo` per evitare re-render inutili.

### 5. Real-Time Updates (WebSocket o SSE)
- Implementa un hook `useWebSocket` che si connette al backend e aggiorna lo store Zustand.
- Mostra un indicatore di latenza (ms) nell'header.
- Le notifiche di alert in tempo reale devono apparire come toast (usa react-hot-toast o Sonner).

### 6. Gestione Avanzata degli Alert
- Tabella alert con colonne: server, metrica, valore, soglia, gravità, timestamp, azioni.
- Filtri: per server, gravità, tipo metrica.
- Opzione "acknowledge" e "snooze" per ogni alert, con mutazione ottimistica.
- Storico alert con paginazione lato client (usa TanStack Table).

### 7. Performance e Bundle
- Lazy loading dei pannelli con `React.lazy` e `Suspense`.
- Code splitting per pagina dettaglio server.
- Ottimizza immagini e assets.
- Aggiungi `why-did-you-render` in dev per scovare re-render.

### 8. Testing e Qualità del Codice
- Scrivi test unitari per lo store Zustand e i custom hook (Vitest + Testing Library).
- Test di integrazione per almeno un grafico: verifica rendering dati e stati.
- Configura ESLint e Prettier con regole strict per TypeScript.
- Aggiungi Storybook per documentare i componenti UI del design system.

### 9. Dettaglio Server (Pagina Secondaria)
- Cliccando su una card server si apre una rotta `/server/:id` con:
  - Dettaglio metriche in tempo reale (gauge circolari)
  - Timeline eventi (alerts, restart, deploy)
  - Log recenti in un terminale virtuale stilizzato
  - Pulsanti azione: restart, refresh agent, export dati.

### 10. Extra – Progressive Web App
- Rendi la dashboard installabile (manifest.json, service worker con vite-plugin-pwa).
- Cache delle risorse statiche e dati ultimo stato per visualizzazione offline.
- Notifiche push per alert critici (previa autorizzazione).

Consegna alla fine:
- La struttura aggiornata delle cartelle
- Un esempio di ogni componente principale implementato
- I file di configurazione aggiornati (vite.config, tailwind.config, tsconfig, package.json con nuovi pacchetti)

L'obiettivo è una dashboard professionale, performante e mantenibile, pronta per produzione.S