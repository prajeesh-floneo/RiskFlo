# RiskFlo

RiskFlo is an interactive frontend prototype demonstrating a modular **Governance, Risk and Compliance (GRC)** platform. The customer-facing prototype name is **NEXORA GRC** — *Governance, Risk & Compliance. Connected.*

The prototype exists for **requirements discovery and product validation**: it shows a potential client what a connected GRC solution could look like, so the conversation can move to *"this is close — now here is what should change."* It is **not** a production application.

The demo is populated with a fictional organisation, **Apex Technologies Ltd.** (Technology & Digital Services, 1,250 employees, India / UAE / Singapore), and a demo user, **Sarah Mathew, Risk & Compliance Manager**.

## Main Modules

| Module | What it demonstrates |
| --- | --- |
| **Executive Dashboard** | Overall risk score, risk distribution, 6-month risk trend, compliance overview, recent activity and clickable priority actions |
| **Risk Management** | Central risk register (24 risks) with search/filter/sort, interactive 5×5 risk matrix, risk detail with treatment plan and timeline, 4-step "Add Risk" wizard with automatic Likelihood × Impact scoring |
| **Compliance** | Four frameworks (ISO 27001, SOC 2, GDPR, NIST CSF), control tables grouped by area, control detail drawer with evidence/status/notes, interactive self-assessment questionnaire with scoring and recommendations |
| **Third-Party Risk** | Vendor portfolio (18 vendors) with risk scores, vendor detail tabs (Overview / Assessment / Risks / Documents / Activity), assessment questionnaire that recalculates the vendor score live |
| **Incidents** | Incident register, lifecycle visualisation (Reported → Post-Incident Review), investigation detail, corrective actions, related risks |
| **Reports** | Reports centre with executive report preview and simulated generate/export |
| **Settings** | Organisation, risk scoring methodology, users & roles, frameworks, notifications, integrations — showing how the platform is configurable per customer |

Cross-cutting features: **global search** across all records, **notifications** that deep-link to records, **connected GRC relationships** (risks ↔ controls ↔ vendors ↔ incidents) and a simulated **GRC Copilot** assistant.

## Technology Stack

- [Next.js](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- [lucide-react](https://lucide.dev/) icons
- [Recharts](https://recharts.org/) for charts
- No backend, no database, no environment variables

## Local Setup

```bash
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

## Vercel Deployment

The project deploys to Vercel with zero configuration:

1. Vercel → **Add New Project** → **Import Git Repository**
2. Select **RiskFlo**
3. **Deploy** (framework preset: Next.js; no environment variables required)

## What Works in Frontend State (genuinely interactive)

- Adding a risk via the 4-step wizard — it appears in the register immediately
- Editing a risk (owner, likelihood, impact, review date) and changing its status
- The 5×5 risk matrix — click any cell to see the risks plotted in it
- Marking controls Compliant / Partial / Non-Compliant — framework scores recalculate
- Adding assessment notes and (simulated) evidence uploads on controls
- Compliance self-assessment — answers produce a score and recommended actions
- Vendor assessment questionnaire — answers recalculate the vendor's risk score and classification
- Changing incident status through the lifecycle
- Global search, notifications, priority actions and all cross-module links
- Demo changes persist across refresh via `localStorage` (reset via the profile menu → *Reset demo data*)

## What Is Simulated

- Authentication (the entry screen simply opens the demo workspace)
- File storage (evidence "uploads" create metadata entries only)
- PDF generation/export in the Reports centre
- Integrations, roles/permissions and notification delivery in Settings
- GRC Copilot (predefined responses computed from the demo dataset — no AI API)
- All data is realistic mock data defined in `lib/data.ts`

## Project Structure

```
app/
  page.tsx                 # Entry / demo sign-in screen
  (app)/                   # Authenticated workspace shell (sidebar, topbar, copilot)
    dashboard/             # Executive dashboard
    risks/                 # Risk register, matrix, risk detail
    compliance/            # Frameworks, controls, assessment
    vendors/               # Vendor portfolio, detail, questionnaire
    incidents/             # Incident register and detail
    reports/               # Reports centre
    settings/              # Configuration screens
components/                # Reusable UI, charts, risk matrix, add-risk wizard, shell
lib/                       # Types, mock data, client-side store (Context + localStorage), utils
```

## Demo Limitations

- Single demo workspace and user; no multi-tenancy
- State lives in the browser (`localStorage`); different browsers/devices see independent state
- Framework control lists are representative samples, not complete standards
- Scoring formulas are illustrative and intended to be configurable in a real implementation
