# 🎨 FRONTEND DESIGN SYSTEM — Dashboard Monitoring Enterprise

**Per: MISAT Monitor**  
**Obiettivo:** Dashboard professionale per monitoraggio 50+ macchine in tempo reale  
**Stack:** React 18 + Vite + Tailwind CSS + Recharts + Zustand  

---

## 📐 DESIGN FOUNDATION

### Color Palette (Dark Mode Only)

```
PRIMARY BACKGROUND
  - slate-950: #030712 (page background)
  - slate-900: #0f172a (card background)
  - slate-800: #1e293b (hover state)
  - slate-700: #334155 (border)

SEMANTIC STATUS
  - success: #10b981 (online, ok)
  - warning: #f59e0b (warning alerts)
  - critical: #ef4444 (critical alerts, error)
  - info: #0ea5e9 (info, connected)
  - muted: #64748b (offline, disabled)

TEXT
  - text-50: #f8fafc (primary text)
  - text-200: #e2e8f0 (secondary text)
  - text-400: #94a3b8 (tertiary/muted)
```

### Typography System

```
HEADINGS
  - H1: 2.25rem (36px), font-bold, tracking-tight, letter-spacing: -0.02em
  - H2: 1.875rem (30px), font-bold, tracking-tight
  - H3: 1.5rem (24px), font-semibold
  - H4: 1.25rem (20px), font-semibold

BODY
  - Body Regular: 1rem (16px), font-normal, line-height: 1.5
  - Body Small: 0.875rem (14px), font-normal, line-height: 1.43
  - Body XSmall: 0.75rem (12px), font-normal, line-height: 1.33

MONOSPACE (metrics)
  - 0.875rem, font-mono, font-semibold
```

### Spacing System

```
8px grid
  xs: 2px (0.125rem)
  sm: 4px (0.25rem)
  md: 8px (0.5rem)
  lg: 12px (0.75rem)
  xl: 16px (1rem)
  2xl: 24px (1.5rem)
  3xl: 32px (2rem)
  4xl: 48px (3rem)
```

### Border & Shadows

```
RADIUS
  - sm: 4px
  - md: 8px
  - lg: 12px
  - full: 9999px

SHADOWS
  - sm: 0 1px 2px rgba(0,0,0,0.05)
  - md: 0 4px 6px rgba(0,0,0,0.1)
  - lg: 0 10px 15px rgba(0,0,0,0.1)
  - critical: inset 0 0 0 1px #ef4444, 0 0 0 3px rgba(239,68,68,0.1)
```

### Animation & Transitions

```
TIMING
  - duration-75: 75ms (hover)
  - duration-200: 200ms (standard)
  - duration-300: 300ms (slower)
  - easing: cubic-bezier(0.4, 0, 0.2, 1) [ease-in-out]

PREFERS-REDUCED-MOTION
  - Tutte le animazioni rispettano @media (prefers-reduced-motion: reduce)
```

---

## 🧩 COMPONENT LIBRARY

### 1. **StatusBadge** (Riusabile)

```jsx
/* Props:
   - status: 'online' | 'offline' | 'warning' | 'critical'
   - size: 'sm' | 'md' | 'lg'
   - animated: boolean (default: true)
*/

// Rendering
Online → Green dot (animated pulse)
Offline → Gray dot (static)
Warning → Yellow dot (animated)
Critical → Red dot (animated, stronger)

// Example: <StatusBadge status="online" size="md" animated />
```

### 2. **MetricCard** (Base component)

```jsx
/* Props:
   - label: string
   - value: string | number
   - unit: string (es. "%", "GB")
   - icon?: ReactNode
   - trend?: { direction: 'up'|'down', percent: number }
   - status?: 'ok' | 'warning' | 'critical'
   - loading?: boolean
*/

Structure:
┌─────────────────────────────┐
│ Label          [Icon] Trend │
│ 45.2%                       │
└─────────────────────────────┘

Colors:
  - status='ok': bg-emerald-900/20, border-emerald-600/30
  - status='warning': bg-amber-900/20, border-amber-600/30
  - status='critical': bg-red-900/20, border-red-600/30
```

### 3. **NodeCard** (Standalone component)

```jsx
/* Props:
   - node: { id, name, host, status }
   - metrics: { cpu, memory, disk }
   - alerts: number (unread alerts)
   - onClick: () => {}
*/

Structure:
┌──────────────────────────────┐
│ Server-01          ● Online   │
│ 192.168.1.10                 │
├──────────────────────────────┤
│ CPU:  ████████░░ 67%         │
│ RAM:  ██████████ 85% ⚠        │
│ Disk: ███░░░░░░░ 31%         │
├──────────────────────────────┤
│ 🔔 2 alerts                  │
└──────────────────────────────┘

Progress bar color:
  - green: < 70%
  - yellow: 70-85%
  - red: > 85%

Hover: Bg transition to slate-800, cursor pointer, shadow-lg
```

### 4. **KPICard** (Summary metric)

```jsx
/* Props:
   - title: string
   - value: string | number
   - icon?: ReactNode
   - color: 'emerald' | 'cyan' | 'red' | 'amber'
   - comparison?: { value: number, text: string }
*/

Example:
┌──────────────────┐
│ 📊 Nodi Online  │
│      5/6         │
│    ↑ 1 oggi      │
└──────────────────┘
```

### 5. **Chart Components** (Recharts wrapper)

```jsx
/* AreaChart — CPU/Memory Usage */
<ResponsiveMetricChart
  data={metricsData}
  type="area"
  dataKey="cpu_percent"
  name="CPU Usage"
  color="#0ea5e9"
  threshold={85}
  height={300}
/>

Props:
  - data: { timestamp, value }[]
  - type: 'area' | 'line' | 'bar'
  - color: hex color
  - threshold: number (line di warning rossa)
  - showAverage: boolean
  - loading: boolean (skeleton)

Features:
  - Tooltip custom con timestamp formattato
  - ResponsiveContainer (auto-width)
  - ReferenceLine rossa a 85%
  - Gradient background leggero
  - Mobile: riduce numero di gridline
```

### 6. **AlertToast** (Notification)

```jsx
/* Props:
   - type: 'warning' | 'critical'
   - title: string
   - message: string
   - icon?: ReactNode
   - onClose: () => {}
   - autoCloseDuration: number (ms, default: 5000)
*/

Animation:
  - Slide-in da right (200ms)
  - Auto-close fade-out (300ms)
  - Shake animation su CRITICAL

Position: bottom-right, z-50
Stacking: Multiple toast stack vertically con gap-2

Sound:
  - Play sound su new critical alert
  - Respetta user preference per volume
```

### 7. **FilterBar** (Filtri riusabili)

```jsx
/* Props:
   - filters: { label, value, active, onClick }[]
   - multi?: boolean (default: false)
*/

Rendering:
[Tutti] [Warning] [Critical] [Read]

Style:
  - Inactive: bg-slate-800, text-slate-300
  - Active: bg-emerald-600, text-white
  - Hover: brightness-110
  - Transition: 200ms
```

---

## 📄 PAGINA 1: DASHBOARD OVERVIEW

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ NAVBAR                                                  │
│ Logo  /  Title          🔔 5 alerts     ● Connected    │
├──────────┬──────────────────────────────────────────────┤
│ SIDEBAR  │  MAIN CONTENT                                │
│ Nav      │  ┌────────────────────────────────────────┐ │
│ Links    │  │ OVERVIEW Dashboard                     │ │
│          │  ├────────────────────────────────────────┤ │
│          │  │ KPI CARDS (4 columns responsive)      │ │
│          │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │
│          │  │ │ Online  │ │ Avg CPU │ │ Avg RAM │  │ │
│          │  │ │  5/6    │ │  34%    │ │  67%    │  │ │
│          │  │ └─────────┘ └─────────┘ └─────────┘  │ │
│          │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │
│          │  │ │Critical │ │Warning  │ │   Add   │  │ │
│          │  │ │    1    │ │    2    │ │  Node   │  │ │
│          │  │ └─────────┘ └─────────┘ └─────────┘  │ │
│          │  ├────────────────────────────────────────┤ │
│          │  │ NODE GRID (auto-responsive)           │ │
│          │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │
│          │  │ │ Server  │ │ Server  │ │ Server  │  │ │
│          │  │ │   01    │ │   02    │ │   03    │  │ │
│          │  │ └─────────┘ └─────────┘ └─────────┘  │ │
│          │  └────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────┘
```

### Responsive Breakpoints

```
Mobile (<640px):
  - Sidebar hidden (hamburger menu)
  - KPI Cards: 1 column
  - Node Grid: 1 column
  - Navbar: Stack logo + title

Tablet (640-1024px):
  - Sidebar: Fixed, 200px wide
  - KPI Cards: 2 columns
  - Node Grid: 2 columns

Desktop (1024+):
  - Sidebar: Fixed, 250px wide
  - KPI Cards: 4 columns
  - Node Grid: 3-6 columns
```

### Navbar Component

```jsx
{
  layout: 'flex justify-between items-center',
  bg: 'bg-slate-900 border-b border-slate-700',
  padding: 'px-6 py-4',
  height: 'h-16',
  
  left: [Logo, Title],
  right: [
    NotificationBell (with badge count),
    ConnectionStatus (green dot + "Connected"),
    UserMenu (avatar + dropdown)
  ]
}
```

### KPI Cards Grid

```jsx
const kpiCards = [
  {
    title: "Nodi Online",
    value: onlineCount,
    total: totalNodes,
    icon: "Server",
    color: "emerald",
    trend: { direction: "up", percent: 20 }
  },
  {
    title: "CPU Media",
    value: avgCpu.toFixed(1),
    unit: "%",
    icon: "Zap",
    color: "cyan",
    status: avgCpu > 80 ? "warning" : "ok"
  },
  {
    title: "RAM Media",
    value: avgRam.toFixed(1),
    unit: "%",
    icon: "BarChart3",
    color: "cyan",
    status: avgRam > 85 ? "warning" : "ok"
  },
  {
    title: "Alert Critici",
    value: criticalCount,
    icon: "AlertTriangle",
    color: "red",
    badge: criticalCount > 0 ? "urgent" : null
  },
  {
    title: "Alert Warning",
    value: warningCount,
    icon: "AlertCircle",
    color: "amber"
  },
  {
    title: "Aggiungi Nodo",
    value: "+",
    icon: "Plus",
    color: "slate",
    onClick: openAddNodeModal,
    style: "cursor-pointer hover:bg-slate-700"
  }
];

// Responsive: 4 col desktop, 2 col tablet, 1 col mobile
// Grid: gap-4, auto-fit, minmax(250px, 1fr)
```

### Node Grid Layout

```jsx
/* Grid dinami co che si adatta al numero di nodi */
- Desktop: 3-6 colonne (minmax 300px, 1fr)
- Tablet: 2 colonne
- Mobile: 1 colonna

NodeCard hover states:
  - shadow-lg
  - bg-slate-800
  - Border: brighter

Skeleton loading:
  - Mostra 6 placeholder card mentre fetch
  - Animate pulse
```

### Add Node Modal

```jsx
/* ModalForm per aggiungere nodo */
Title: "Aggiungi Nuovo Nodo"
Fields:
  - Nome (string, required, placeholder: "Server-01")
  - Hostname/IP (string, required, placeholder: "192.168.1.10")
  - Porta (number, default: 9646)
  - Nota (textarea, optional)

Buttons:
  - Cancel: gray
  - Save: emerald (disabled while loading)

Validation:
  - Hostname/IP non deve essere duplicato
  - Porta tra 1024-65535
  - Nome non vuoto

Success: Toast notification + refresh grid
Error: Toast notification red
```

---

## 📊 PAGINA 2: NODE DETAIL

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back    Server-01 (192.168.1.10)    ● Online         │
├─────────────────────────────────────────────────────────┤
│ Range: [1h] [6h] [24h] [7d]                            │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐│
│ │ CPU Usage (%)                                        ││
│ │ [AreaChart Recharts]                                 ││
│ │ Average: 45.2% | Max: 87.3% | Min: 12.1%            ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Memory Usage (GB)                                    ││
│ │ [AreaChart Recharts]                                 ││
│ │ Total: 16GB | Average: 10.2GB | Max: 14.8GB          ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Disk Usage (%)                                       ││
│ │ [LineChart multi-linea]                              ││
│ │ / : 45% | /home : 67% | /var : 23%                   ││
│ └──────────────────────────────────────────────────────┘│
│                                                         │
│ ┌──────────────────────────────────────────────────────┐│
│ │ Alert History (ultimi 20)                            ││
│ │ [Table: Severity | Metric | Value | Time]            ││
│ └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Header Section

```jsx
{
  title: "Server-01",
  subtitle: "192.168.1.10:9646",
  status: <StatusBadge status="online" />,
  actionButtons: [
    { icon: "ArrowLeft", onClick: goBack },
    { icon: "Settings", onClick: openConfig }
  ]
}
```

### Range Selector

```jsx
const ranges = [
  { label: "1h", value: "1h", duration: 3600 },
  { label: "6h", value: "6h", duration: 21600 },
  { label: "24h", value: "24h", duration: 86400 },
  { label: "7d", value: "7d", duration: 604800 }
];

// ButtonGroup
// Active: bg-emerald-600, text-white
// Inactive: bg-slate-800, text-slate-300
// OnChange: refetch metrics
```

### Chart 1: CPU Usage

```jsx
<ResponsiveMetricChart
  data={cpuData}
  type="area"
  dataKey="cpu_percent"
  name="CPU %"
  color="#0ea5e9"
  threshold={85}
  showAverage={true}
  loading={isLoading}
/>

Data transformation:
  - Group by range (smart sampling: max 200 punti)
  - Calculate avg/min/max per il range
  - ReferenceLine rossa a 85%
  - Average line tratteggiata in grigio

Stats row sotto:
  "Average: {avg}% | Max: {max}% | Min: {min}%"
```

### Chart 2: Memory Usage

```jsx
<ResponsiveMetricChart
  data={memoryData}
  type="area"
  dataKey="memory_percent"
  name="Memory %"
  color="#10b981"
  threshold={85}
  unit="GB"
  showAbsolute={true}  // mostra GB, non %
/>

Data:
  - memory_percent (Y-axis)
  - Tooltip mostra anche GB assoluti
  - Legend: "Memory Usage (% e GB utilizzati)"

Stats:
  "Total: 16GB | Average: 10.2GB | Max: 14.8GB"
```

### Chart 3: Disk Usage

```jsx
<ResponsiveMetricChart
  data={diskData}
  type="line"
  multi={true}  // multi-linea
  dataKeys={["/_percent", "/home_percent", "/var_percent"]}
  names={["/", "/home", "/var"]}
  colors={["#f59e0b", "#8b5cf6", "#06b6d4"]}
  threshold={85}
/>

Legend:
  - Colorata, interattiva (click per toggle)
  - Mostra % per mount point

Multi-line features:
  - Diverse linee colorate per mount point
  - Hover: highlight solo quella linea
  - ReferenceLine rossa a 85%
```

### Alert History Table

```jsx
Columns:
  | Severity | Metric | Value | Threshold | Triggered |
  |----------|--------|-------|-----------|-----------|
  | 🔴 Critical | CPU | 92.3% | 95% | 2h ago |
  | 🟡 Warning | Memory | 87.2% | 85% | 1h ago |

Styling:
  - Header: bg-slate-800, border-slate-700
  - Row hover: bg-slate-800
  - Severity icon colorata
  - Timestamp relativo

Pagination: 20 items per page, scroll dentro table
```

---

## 🚨 PAGINA 3: ALERT CENTER

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Alert Center                 [Mark all as read]        │
├─────────────────────────────────────────────────────────┤
│ Filter: [Tutti] [Non letti] [Warning] [Critical]       │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 Server-01 — CPU                                  │ │
│ │    CPU al 92.3%, soglia: 80% — CRITICAL            │ │
│ │    ● 5 minuti fa                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟡 Server-03 — Memory                              │ │
│ │    Memory al 87%, soglia: 85% — WARNING             │ │
│ │    5 minuti fa                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Empty state (se no alerts):                             │
│ ✓ All systems operational                              │
│ "No active alerts. Great job!"                         │
└─────────────────────────────────────────────────────────┘
```

### Alert Item Component

```jsx
/* Props:
   - alert: { id, nodeName, metric, value, threshold, severity, createdAt, isRead }
   - onClick: () => markAsRead(id)
*/

Structure:
┌────────────────────────────────────────────┐
│ [Icon] Node — Metric                   [●] │
│ Alert message (value vs threshold)         │
│ Relative time (5 minuti fa)                │
└────────────────────────────────────────────┘

Styling:
  - bg-slate-800, border-left spesso (4px)
  - Border-left color: red se critical, yellow se warning
  - Blue dot (●) se non letto
  - Hover: bg-slate-700, shadow
  - Transition: 200ms

Click action:
  - Toggle blue dot (mark as read)
  - Visual feedback (fade dot)
```

### Filter Bar

```jsx
const filterOptions = [
  { label: "Tutti", value: "all" },
  { label: "Non letti", value: "unread" },
  { label: "Warning", value: "warning" },
  { label: "Critical", value: "critical" }
];

// Active: emerald-600
// Inactive: slate-800
// Badge counter: es. "Non letti (3)"
```

### Action Bar (Header)

```jsx
- Titolo: "Alert Center"
- Counter: "{totalCount} alerts, {unreadCount} unread"
- Button: "Segna tutti come letti" (disabled se nessuno unread)
- Button: "Elimina letti" (soft, secondary style)
```

### Toast Notification (on new alert via WebSocket)

```jsx
/* Appears bottom-right, stacks */
Position: fixed, bottom: 1rem, right: 1rem, z-50

Animation:
  - Slide-in from right (200ms)
  - Auto-close after 5s (fade-out 300ms)
  - Manual close: click X

Content:
  - Icon: ⚠️ (yellow) o 🚨 (red)
  - Title: "Server-01 — CPU"
  - Message: "CPU al 92.3%, soglia: 80%"
  - Action link: "View" (go to node detail)

Sound:
  - Play alert sound (beep, low volume)
  - Respetta user's system volume + preference
  - Only on CRITICAL (not warning)

Styling:
  - Critical: bg-red-900, border-red-700, text-red-50
  - Warning: bg-amber-900, border-amber-700, text-amber-50
```

### Empty State

```jsx
{
  icon: <CheckCircle size={64} className="text-emerald-500" />,
  title: "All Systems Operational ✓",
  description: "No active alerts. Everything looks great!",
  action: <Button>← Back to Dashboard</Button>
}
```

---

## 🏗️ SIDEBAR NAVIGATION

### Desktop Sidebar

```
┌──────────────────┐
│ 🎯 MISAT Monitor │
│                  │
│ 📊 Dashboard     │ ← active
│ 🚨 Alerts (3)    │
│ ⚙️  Settings      │
│                  │
│ ─────────────────│
│ 📚 Docs          │
│ 🐛 Report Issue  │
└──────────────────┘
```

### Mobile Sidebar (Hamburger)

```jsx
- Hidden by default (<640px)
- Hamburger button in navbar
- Slide-out from left
- Overlay backdrop (click to close)
- Same items as desktop
- Full height, touch-friendly padding
```

---

## 🔄 STATE MANAGEMENT (Zustand Store)

### Store Structure

```javascript
{
  // Nodes data
  nodes: Array<{
    id, name, host, port, status, lastSeen
  }>,
  
  // Current metrics (keyed by node_id)
  currentMetrics: Object<{
    node_id: { cpu, memory, disk, timestamp }
  }>,
  
  // Alerts
  alerts: Array<{
    id, nodeId, metric, value, threshold, 
    severity, isRead, createdAt
  }>,
  
  // UI state
  unreadAlertCount: number,
  selectedRange: '1h'|'6h'|'24h'|'7d',
  isConnected: boolean,
  
  // Actions
  fetchNodes(),
  fetchAlerts(),
  handleWebSocketMessage(msg),
  markAlertRead(id),
  markAllAlertsRead(),
  selectRange(range),
  setConnected(bool)
}
```

---

## 📡 WEBSOCKET INTEGRATION

### Message Types

```javascript
{
  type: 'metrics_update',
  nodeId: 'uuid',
  data: {
    cpu_percent: 45.2,
    memory_percent: 67.3,
    timestamp: '2026-05-06T14:45:00Z'
  }
}

{
  type: 'new_alert',
  data: {
    id: 'uuid',
    nodeName: 'Server-01',
    metric: 'cpu',
    value: 92.3,
    threshold: 80,
    severity: 'critical'
  }
}

{
  type: 'node_status_change',
  nodeId: 'uuid',
  status: 'online'|'offline'
}
```

### Frontend Hook

```javascript
const useMetricsWebSocket = () => {
  const store = useStore();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      setIsConnected(true);
      store.setConnected(true);
    };
    
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      store.handleWebSocketMessage(msg);
      
      // Toast notification on new alert
      if (msg.type === 'new_alert') {
        showAlertToast(msg.data);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect in 3s
      setTimeout(() => ws = new WebSocket(...), 3000);
    };
    
    return () => ws.close();
  }, []);
  
  return { isConnected };
};
```

---

## ⚡ PERFORMANCE TARGETS

### Lighthouse Scores
```
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 100
```

### Core Web Vitals
```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### Bundle Size
```
Initial JS: < 150KB (gzipped)
CSS: < 30KB (gzipped)
Total: < 200KB
```

### Metrics
```
Time to Interactive: < 3.5s
First Contentful Paint: < 1.2s
DOMContentLoaded: < 2s
```

### WebSocket Optimization
```
- Message debouncing: 100ms (metrics update)
- Smart sampling: max 200 chart points
- Lazy loading: load alerts on demand
- Pagination: 20 items per page
```

---

## ♿ ACCESSIBILITY (WCAG AAA)

### Color Contrast
```
- Text on background: 7:1+ ratio
- Icons on background: 4.5:1+ ratio
- Borders: distinguishable without color alone
- All interactive elements: focus ring (2px cyan)
```

### Keyboard Navigation
```
- Tab order: logical (top→bottom, left→right)
- All interactive elements: focusable
- Modals: trap focus inside
- Escape key: close modals
- Enter key: submit forms/activate buttons
```

### Screen Readers
```
- Semantic HTML: <button>, <nav>, <main>, <article>
- ARIA labels: aria-label, aria-describedby
- Icons with text: text content or aria-label
- Live regions: aria-live="polite" for alerts
- Form labels: <label for="input-id">
```

### Motion
```
- Respect prefers-reduced-motion
- Animations: can be disabled
- No auto-playing animations on page load
- Transitions: 200ms (respects settings)
```

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Foundation (2 days)
- [x] Vite project setup
- [x] Tailwind CSS config (dark theme)
- [x] Zustand store setup
- [x] Basic routing (React Router)
- [x] Folder structure
- [x] Base layout (Navbar + Sidebar)

### Phase 2: Base Components (3 days)
- [ ] StatusBadge component
- [ ] MetricCard component
- [ ] KPICard component
- [ ] NodeCard component
- [ ] Chart wrapper (Recharts)
- [ ] AlertToast component
- [ ] FilterBar component

### Phase 3: Pages (4 days)
- [ ] Dashboard Overview page
  - KPI cards
  - Node grid
  - Add node modal
- [ ] Node Detail page
  - Header + range selector
  - CPU chart
  - Memory chart
  - Disk chart
  - Alert history table
- [ ] Alert Center page
  - Alert list
  - Filters
  - Empty state

### Phase 4: Integration (2 days)
- [ ] WebSocket hook
- [ ] API calls (axios)
- [ ] Store actions
- [ ] Real-time updates
- [ ] Error handling

### Phase 5: Polish (2 days)
- [ ] Loading states (skeletons)
- [ ] Error boundaries
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization

### Phase 6: QA (1 day)
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Sound/notification testing
- [ ] WebSocket reconnection
- [ ] Bundle size check

---

## 🛠️ DEVELOPMENT SETUP

### Install Dependencies
```bash
cd frontend
npm install react@18 react-dom@18
npm install vite @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm install recharts
npm install zustand
npm install react-router-dom
npm install axios
npm install lucide-react  # icons
```

### Tailwind Config
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Slate palette (primary)
        slate: { ... }
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shake: 'shake 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) both'
      }
    }
  }
}
```

### Vite Config
```javascript
// vite.config.js
import react from '@vitejs/plugin-react'
export default {
  plugins: [react()],
  server: { port: 5173 },
  build: { target: 'es2020' }
}
```

---

## 📋 CHECKLIST IMPLEMENTAZIONE

- [ ] Colori CSS custom variables setup
- [ ] Navbar + Sidebar layout
- [ ] Routing structure (/, /nodes/:id, /alerts)
- [ ] Store (Zustand) base setup
- [ ] API integration (axios config)
- [ ] WebSocket hook
- [ ] Dashboard page layout
  - [ ] KPI cards
  - [ ] Node grid
  - [ ] Add node modal
- [ ] Node detail page
  - [ ] Charts implementation
  - [ ] Range selector
  - [ ] Alert history table
- [ ] Alert center page
  - [ ] Alert list
  - [ ] Filters
  - [ ] Toast notifications
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Build & bundle size check

---

## 🎨 DESIGN TOKENS (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary-bg: #030712;
  --color-card-bg: #0f172a;
  --color-hover-bg: #1e293b;
  --color-border: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #e2e8f0;
  --color-text-muted: #94a3b8;
  
  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #0ea5e9;
  
  /* Spacing */
  --spacing-xs: 2px;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 12px;
  --spacing-xl: 16px;
  
  /* Timing */
  --duration-fast: 75ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
}
```

---

## 📞 SUPPORT & RESOURCES

- **Recharts Docs:** https://recharts.org
- **Tailwind Docs:** https://tailwindcss.com/docs
- **React Router:** https://reactrouter.com
- **Zustand:** https://github.com/pmndrs/zustand
- **Lucide Icons:** https://lucide.dev

---

**Generato per:** MISAT Monitor v1.0  
**Data:** 2026-05-06  
**Per domande:** Vedi INITIAL.md per architettura backend
