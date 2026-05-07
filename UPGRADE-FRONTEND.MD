Refactor the monitoring dashboard UI to match a new design. Keep all existing backend logic and WebSocket connections intact. Only change the frontend layout and components.

---

SIDEBAR
Replace the current sidebar with a structured nav divided into sections:

MONITORING: Overview, Hosts, Alerts, Inventory
ANALYTICS: Metrics, Trends, Reports
ADMINISTRATION: Settings, Integrations

Add a collapse toggle at the bottom. Do NOT create pages for: Services, Maps, Dashboards, Users, Roles (add them as disabled/placeholder nav items).

---

TOPBAR
Replace current header with:
- Left: dropdown breadcrumb showing current page name (e.g. "Fleet Overview")
- Center/Right: time range selector ("Last 5 minutes"), auto-refresh selector ("30s"), Share button
- Remove the old alert counter and WS badge — move WS status to a small indicator in the corner

---

FLEET OVERVIEW PAGE (Overview)
Replace the current layout with:

1. STATUS PILLS ROW (top right): OK | Warning | Critical | Down — colored badge buttons

2. KPI CARDS ROW: Total Hosts, Up Hosts, Warning Hosts, Critical Hosts, Down Hosts, Total Services, Problems, Unchecked
   Each card shows: label, big number, delta vs last 24h, percentage colored (green/yellow/red)

3. THREE-COLUMN ROW:
   - Host Status Distribution: donut chart with legend (OK/Warning/Down + count + %)
   - Service Status Distribution: donut chart (OK/Warning/Critical/Unknown)
   - Problems Over Time: area/line chart with time axis, three lines (Critical=red, Warning=yellow, Unknown=gray)

4. THREE-COLUMN ROW:
   - Top Problem Hosts: table with Host, Status badge, Problems count, Last Change
   - Host Problems by State: horizontal bar chart (Critical/Warning/Unknown)
   - Service Problems by State: horizontal bar chart (Critical/Warning/Unknown)

5. HOSTS TABLE at bottom:
   Columns: Host (name + IP), Status badge, Services (colored dots x/x/x/x), CPU bar, Memory bar, Disk bar, Last Check, Problems badge, Actions (chart icon, list icon, bell icon, menu)
   Add search input and pagination (10/page)

---

PAGES TO CREATE (minimal but functional):
- Hosts: full table view of all hosts with filters
- Alerts: table of alerts with severity filter
- Inventory: simple host inventory list
- Metrics: placeholder with "coming soon"
- Trends: placeholder
- Reports: placeholder
- Settings: placeholder
- Integrations: placeholder

---

STYLE
Dark theme. Keep existing color tokens (green=OK, yellow=warning, red=critical, gray=down/unknown).
Use the same font and spacing system already in the project.
Component library: use whatever is already installed (do not add new dependencies).
