# MISAT Monitor — Frontend Visual Redesign Prompt

## Obiettivo

Redesign completo dell'identità visiva del frontend **senza toccare la logica applicativa**.
Nessuna modifica a hook, store, API client, routing o business logic.
Intervieni **esclusivamente** su: `index.css`, i componenti UI (`components/ui/`, `components/layout/`, `components/fleet/`, `components/device/`) e le due pagine più visibili (`FleetOverview.jsx`, `DeviceDetail.jsx`).

Il risultato deve sembrare estratto da **Grafana Enterprise**, **Datadog**, o una console NOC militare — non da un tutorial React su YouTube.

---

## Riferimenti visivi da interiorizzare

Studia questi prodotti prima di scrivere una singola riga di CSS:

- **Grafana** — densità informativa, pannelli con header tecnici, barre segmentate, colori semantici forti
- **Datadog** — rigore tipografico, tabelle compatte, status indicator con LED glow
- **PagerDuty** — gerarchia degli alert, urgency visiva immediata
- **Zabbix** — utility-first, ogni pixel porta informazione
- **Bloomberg Terminal** — layout a griglia fissa, monospace ovunque, zero decorazione inutile

**Cosa NON fare:** nessun gradiente viola su sfondo bianco, nessun "frosted glass" da landing page SaaS, nessun border-radius `xl` su tutto, nessun componente che sembra uscito da shadcn/ui senza personalizzazione.

---

## Palette colori — riscrivere completamente `@theme` in `index.css`

Abbandona il tema GitHub-clone attuale. Adotta una palette da ops center industriale:

```css
@theme {
  /* Background — più profondi, più veri */
  --color-bg-base:     #07090d;   /* quasi nero, con leggero blue shift */
  --color-bg-surface:  #0e1117;   /* pannelli */
  --color-bg-elevated: #141920;   /* header di tabella, hover */
  --color-bg-border:   #1f2733;   /* separatori */
  --color-bg-subtle:   #1a2030;   /* highlight di riga */

  /* Status — più saturi, più decisi */
  --color-status-ok:       #00d97e;   /* verde fosforescente, non il verde pastello */
  --color-status-warning:  #f5a623;   /* ambra pura, non giallo */
  --color-status-critical: #ff3b30;   /* rosso operativo, non il rosa-rosso */
  --color-status-unknown:  #4a5568;
  --color-status-info:     #0ea5e9;   /* sky blue, non il blu generico */

  /* Testo */
  --color-text-primary:   #e8edf5;
  --color-text-secondary: #7a8694;
  --color-text-muted:     #3d4855;
  --color-text-data:      #c8d6e5;   /* per valori numerici — leggermente più freddo */

  /* Accento — un solo accento, usato con parsimonia */
  --color-accent:         #0ea5e9;
  --color-accent-dim:     rgba(14, 165, 233, 0.12);

  /* Font stack — OBBLIGATORIO cambiare */
  --font-mono:    "Berkeley Mono", "TX-02", "Departure Mono", "Martian Mono",
                  ui-monospace, "Cascadia Code", Consolas, monospace;
  --font-display: "Barlow Condensed", "DIN Next Condensed", "Roboto Condensed",
                  "Arial Narrow", sans-serif;
  --font-sans:    "Inter Variable", "DM Sans", system-ui, sans-serif;
}
```

---

## Tipografia — regole ferree

1. **Tutti i valori numerici e le metriche** usano `font-mono` (`var(--font-mono)`). Sempre. Senza eccezioni.
2. **Header di sezione e titoli di pagina** usano `font-display` in `font-weight: 700`, `letter-spacing: 0.04em`, `text-transform: uppercase`.
3. **Label di campo e intestazioni di tabella** → `font-mono`, `text-[9px]`, `tracking-[0.18em]`, `uppercase`, colore `text-muted`.
4. **Corpo testo** → `font-sans`, `text-sm`, ma usato il meno possibile.
5. **Nessun titolo di pagina in gradiente**. Il `text-gradient-accent` attuale va rimosso. I titoli importanti usano `color: var(--color-text-primary)` con un singolo underline decorativo colorato via `border-bottom`.

---

## Body e background — riscrivere

```css
body {
  background-color: var(--color-bg-base);
  background-image:
    /* griglia tecnica sottile */
    linear-gradient(var(--color-bg-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-bg-border) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: -0.5px -0.5px;
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
```

Rimuovi i `radial-gradient` decorativi dal body. Il background deve essere flat e tecnico, non "atmosferico".

---

## Componenti da ricostruire

### `StatusBadge.jsx` — da pill arrotondata a LED indicator

Il badge attuale sembra un tag di Notion. Deve sembrare un indicatore LED di una rack unit.

```
[●  CRITICAL ]   ← LED dot con glow + testo in maiuscolo condensato
```

Implementazione:
- `border-radius: 2px` (quasi zero, non `rounded-full`)
- Il dot `.size-1.5` diventa `.size-2` con `box-shadow: 0 0 6px 1px currentColor`
- Per `status === 'critical'`: il dot ha `animation: led-pulse 1.4s ease-in-out infinite`
- Per `status === 'ok'`: il dot ha un glow statico sottile verde
- Background: `rgba(currentColor, 0.08)` non `0.15`
- Bordo: `1px solid rgba(currentColor, 0.35)`

```css
@keyframes led-pulse {
  0%, 100% { box-shadow: 0 0 4px 1px var(--color-status-critical); opacity: 1; }
  50%       { box-shadow: 0 0 10px 3px var(--color-status-critical); opacity: 0.7; }
}
```

---

### `MetricBar.jsx` — da barra liscia a barra segmentata stile Grafana

La barra attuale è un `div` piatto. Deve essere una **barra segmentata** con tacche ogni 25%.

Struttura HTML risultante:
```
[████████████░░░░|░░░░░░░░|░░░░░░░░]  78%
```

- Altezza: `height: 8px`
- La barra riempita usa `background: repeating-linear-gradient(90deg, currentColor 0, currentColor calc(100% - 1px), transparent calc(100% - 1px), transparent 100%)` con `background-size: 25% 100%`  
  — oppure semplicemente metti 3 tacche verticali semitrasparenti sopra la barra come overlay assoluto
- Track: `background: var(--color-bg-border)` con stesse tacche overlay
- Nessun `border-radius`
- I colori seguono le soglie esattamente come ora (ok/warning/critical)

---

### `MetricChart.jsx` — da chart decorativo a grafico operativo

Cambia esclusivamente la configurazione di Recharts e il container, **non la logica**:

**Colori e stile chart:**
```jsx
// Griglia: linee sottili, meno rumore
<CartesianGrid
  strokeDasharray="none"
  stroke="var(--color-bg-border)"
  strokeOpacity={0.6}
  horizontal={true}
  vertical={false}  // ← solo linee orizzontali, più leggibile
/>

// Assi: font mono piccolo
tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--color-text-muted)' }}

// Area fill: molto più scura, quasi invisibile
fillOpacity={0.06}   // era 0.18 — troppo
strokeWidth={2}       // era 1.5 — aumenta

// Colore default area: sostituisci #388bfd con var(--color-status-info)
```

**Soglia (ReferenceLine):**
```jsx
// Più visibile, più tecnica
<ReferenceLine
  y={threshold}
  stroke="var(--color-status-critical)"
  strokeDasharray="3 3"
  strokeOpacity={0.9}
  strokeWidth={1}
  label={{
    value: `CRIT ${threshold}%`,
    fill: 'var(--color-status-critical)',
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
    position: 'insideTopRight',
  }}
/>
```

**Container del chart** (il `<section>`):
- `border-radius: 0` → spigoli netti
- Bordo: `1px solid var(--color-bg-border)` → ok com'è
- Aggiungi un header con `border-bottom: 1px solid var(--color-bg-border)` — la linea che separa titolo da grafico è fondamentale nell'estetica NOC

**Statistiche avg/max/min** nell'header: mettile in una row separata con sfondo `var(--color-bg-elevated)`, font `9px mono uppercase`. Devono sembrare una riga di terminale, non una didascalia.

---

### `FleetTableRow.jsx` — da card hover a riga terminale

Questo componente è il cuore visivo del prodotto. Deve essere denso, tecnico, senza ornamenti.

**Cambiamenti:**
- `border-l-4` → mantieni, è il segnale visivo principale. MA: il colore della left border deve avere `box-shadow: inset -2px 0 8px -2px <color>` per dare profondità
- `height: 48px` → abbassa a `height: 40px`. Più righe = più informazione visibile
- `border-radius: 0` — nessun arrotondamento nelle righe
- `border-b: 1px solid var(--color-bg-border)` → ok
- Hover: `background: var(--color-bg-subtle)` → no gradiente, no transizione lunga. `transition: background 80ms`
- Il `ChevronRight` hover: invece di `opacity-0 → group-hover:opacity-100`, usa sempre una `›` in `font-mono` che cambia colore sull'hover

**Metriche nella riga:**
- Il numero percentuale (`formatPercent`) deve essere in `font-mono font-semibold text-xs` con colore semantico, allineato a destra nel suo slot da `w-10`
- La `MetricBar` accanto deve essere alta esattamente `6px`

**Font del nome nodo:** `font-display font-bold text-sm uppercase tracking-wide` — i nomi dei server in un NOC non sono in minuscolo, sans-serif ordinario

---

### `Navbar.jsx` — da header SaaS a barra di controllo

La navbar attuale sembra quella di un e-commerce. Deve sembrare una barra di stato di un sistema operativo o una control strip NOC.

**Layout target:**
```
[■ MISAT]  [████ FLEET STATUS ████]  [● 3 CRITICAL]  [⚡ 7 WARN]  [◈ WS LIVE]
```

- Altezza: `h-12` → `h-10` (più compatta)
- Background: `var(--color-bg-surface)` con `border-bottom: 1px solid var(--color-bg-border)`. Rimuovi `backdrop-blur` — su un tool operativo non serve
- Il logo "M" square: diventa `font-display font-black text-xs` con border `1px solid var(--color-accent)`, nessun `bg-accent/15` o `shadow` glow decorativo
- Il testo "MISAT Monitor" → `font-display font-bold text-sm tracking-[0.12em] uppercase text-text-primary`. Niente gradiente
- I badge a destra (`3 critical`, `WS Connected`): rimuovi i `rounded-md`. Usa `border-radius: 2px`. Formato: `[● LABEL: VALORE]` tutto in mono

**Indicatore WebSocket:**
```jsx
// Invece di "WS Connected" usa un formato da terminale:
wsConnected ? "◈ LIVE" : "◇ OFFLINE"
// Con un dot che pulsa quando connesso
```

---

### `DeviceKPIRow.jsx` — da card arrotondate a KPI panel industriale

Le 4 KPI card attuali hanno `border-radius: 8px` e sembrano widget di un fitness tracker.

**Target:** pannelli piatti stile Bloomberg/Grafana stat panel.

- `border-radius: 0` o `2px` max
- Bordo: `1px solid var(--color-bg-border)`. Left border `4px` con colore semantico (esattamente come le righe della fleet table)
- Il valore principale: `font-mono font-bold text-3xl` in `var(--color-text-data)`. **Grande. Dominante.**
- Il label sopra: `font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted`
- Il sub sotto: `font-mono text-[10px] text-text-secondary`
- Per `status === 'critical'`: aggiungi un sottilissimo `background: rgba(255,59,48,0.04)` — non il `shadow-[...]` attuale che è too much
- Rimuovi le icone `ArrowUp`/`ArrowDown` Lucide. Sostituisci con caratteri Unicode: `▲` `▼` `─` in `font-mono`. Più tecnico, meno "app mobile"

---

### `PageShell.jsx` + `Sidebar.jsx` — layout ops center

**PageShell:**
- Rimuovi il `radial-gradient` decorativo `absolute inset-0` — è rumore visivo, non aggiunge valore
- `padding` del `<main>`: riduci da `px-4 py-5 sm:px-6 lg:px-8` a `px-3 py-4 sm:px-4 lg:px-6`. Un NOC dashboard usa ogni pixel

**Sidebar:**
- Le voci di navigazione devono avere `border-radius: 0`
- Indicatore di voce attiva: `border-left: 3px solid var(--color-accent)` + `background: var(--color-accent-dim)`, non un pill/badge
- Font: `font-mono text-xs uppercase tracking-wider`
- Separatori tra gruppi: `border-top: 1px solid var(--color-bg-border)` secchi, no `opacity` tricks

---

### `FleetStatusBar.jsx` — da progress bar a status strip

Se attualmente è una barra orizzontale con percentuali colorate:
- Rimuovi `border-radius` dalla barra
- Aggiungi tacche verticali ogni 25% in `var(--color-bg-base)` sopra la barra (stesso approccio MetricBar)
- I label `OK / WARN / CRIT` devono essere `font-mono text-[9px] uppercase` con il numero in `font-semibold`

---

### `AlertToast.jsx` — da notifica app mobile a alert operativo

Il toast attuale ha bordi arrotondati e sembra iOS. Deve sembrare un alert di PagerDuty o Nagios.

- `border-radius: 4px` max, non `rounded-lg`
- Bordo sinistro `4px` colorato (non solo `border` su tutti i lati)
- Background: per critical → `#0d0505` (quasi nero con red shift), per warning → `#0d0900`
- Header del toast: `CRITICAL · CPU · node-name-01` tutto in `font-mono uppercase text-[10px]`
- Rimuovi le icone Lucide `OctagonAlert` e `AlertTriangle`. Usa invece un indicatore testuale: `[!!!]` per critical, `[!]` per warning, in `font-mono font-bold`. Più terminale, meno Material Design
- Larghezza: `w-72` → `w-80`, ma con `max-width: 320px`
- Animazione di entrata: `translateX(100%)` → `translateX(0)` in `150ms ease-out`. Rapida, non "elegante"

---

### `FleetOverview.jsx` — riorganizzare il layout dell'header panel

Il pannello "NOC Command Center" attuale usa `.panel-premium` con gradient e shadow. Semplifica:

```
FLEET OVERVIEW                          [OK: 12]  [WARN: 3]  [CRIT: 1]  [UNREAD: 5]
──────────────────────────────────────────────────────────────────────────────────────
```

- Rimuovi `.panel-premium` e `.panel-soft` classes. Sostituiscile con pannelli piatti con solo `border-bottom: 1px solid var(--color-bg-border)`
- I `HeroPill` devono essere rettangolari (`border-radius: 2px`), bordo `1px solid`, font `font-mono font-bold text-xl`. Più grandi, più leggibili da lontano
- Il sottotitolo italiano "Visione real-time della flotta..." → rimuovilo. Un NOC non ha copy descrittivo nell'header. Usa solo: `{nodes.length} NODES · REAL-TIME`

---

## CSS globale aggiuntivo da aggiungere a `index.css`

```css
/* Panel tecnico standard — sostituisce panel-premium e panel-soft */
.panel {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-bg-border);
}

.panel-header {
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-bg-border);
  background: var(--color-bg-elevated);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* LED pulse per status critical */
@keyframes led-pulse {
  0%, 100% {
    box-shadow: 0 0 3px 1px var(--color-status-critical);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 8px 3px var(--color-status-critical);
    opacity: 0.65;
  }
}

/* LED ok — glow statico */
.led-ok {
  box-shadow: 0 0 5px 1px var(--color-status-ok);
}

/* Scrollbar ancora più discreta */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-bg-border); border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: var(--color-bg-elevated); }

/* Focus ring più tecnico */
:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 1px;
  border-radius: 0;
}
```

---

## Regole di stile da rispettare ovunque

| Regola | ✅ Corretto | ❌ Vietato |
|--------|-------------|------------|
| Border radius | `0`, `2px`, `4px` max | `rounded-lg`, `rounded-xl`, `rounded-full` |
| Font per dati | `font-mono` sempre | `font-sans` su numeri o metriche |
| Titoli | `font-display uppercase tracking-wide` | Gradiente text, shadow text |
| Spaziatura | Densa, `p-2`/`p-3` sui pannelli | `p-5`, `p-6`, spazio "respiro SaaS" |
| Animazioni | Solo su stati operativi (LED pulse) | Fade in su mount, slide decorativi |
| Colori | Solo dalla palette semantica | Colori custom inline `#hexhex` spot |
| Background | Flat + dot-grid | Radial gradient decorativi |
| Icon set | Mantenere Lucide | Aggiungere altri icon set |
| Border left | 3-4px colorato per severity | Solo top/bottom border su righe |

---

## Font — come caricarli

Aggiungi in `index.html`:

```html
<!-- Barlow Condensed per display -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet">
```

Per `Berkeley Mono` o `Departure Mono`: se non disponibili in produzione, il fallback `"Cascadia Code", Consolas, monospace` è accettabile — sono font mono con carattere tecnico, non generici come ui-monospace su macOS.

---

## Output atteso

Dopo il redesign, aprendo il browser su `FleetOverview`:
1. La griglia puntata di sfondo dà subito "ops center", non "landing page"
2. La `FleetTable` sembra un output di `htop` o un pannello Grafana con righe dense
3. I `StatusBadge` con LED glow comunicano urgenza a colpo d'occhio
4. I titoli in `Barlow Condensed` uppercase danno carattere tecnico immediato
5. Nessun elemento sembra estratto da un template shadcn/ui

Su `DeviceDetail`:
1. I 4 KPI in cima hanno valori grandi e dominanti, leggibili da 2 metri
2. I grafici Recharts sembrano Grafana panels — griglia orizzontale, area quasi flat, soglia critica ben visibile
3. Le barre segmentate nelle KPI card danno senso di precisione

**Il criterio finale:** se screenshot del tool risultante viene postato su HackerNews nella sezione "Show HN", nessuno deve indovinare che il design è stato generato da un AI.
