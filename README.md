# Park Vista — Headquarters

Executive headquarters dashboard for **Park Vista Senior Housing Management**, providing a unified view across all 8 communities in WI, IA, and IL.

## Communities

- Noel Manor (WI)
- Noel Manor The Legacy (WI)
- Park Vista Camanche (IA)
- Park Vista North Hill (IA)
- Park Vista The Legacy (IA)
- Park Vista Waupaca (WI)
- The Legacy of DeForest (WI)
- Willow Lane (IL)

## Stack

- **Next.js 16** / React 19 / TypeScript
- **Tailwind CSS 4**
- **AppFolio Reports API v2** (REST, Basic Auth)
- **DeepSeek** (AI assistant via OpenAI client)
- **Recharts** (charts & sparklines)

## Getting Started

```bash
cd dashboard
cp ../.env.example .env.local   # Fill in AppFolio + DeepSeek credentials
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `APPFOLIO_CLIENT_ID` | AppFolio API client ID |
| `APPFOLIO_CLIENT_SECRET` | AppFolio API client secret |
| `APPFOLIO_DATABASE` | AppFolio subdomain (e.g., `parkvista`) |
| `DEEPSEEK_API_KEY` | DeepSeek API key for AI assistant |

## Features

- **Headquarters Dashboard** — Portfolio KPIs, community performance table, alerts
- **Communities** — Per-community P&L with drill-down
- **Financial Reports** — P&L, Cash Flow, Budget vs Actuals
- **Aged Receivables** — Outstanding balances with aging buckets
- **Lease Expirations** — Upcoming expirations by time bucket
- **Rent Roll** — Full occupancy and rent detail
- **Vendors** — Disbursement tracking
- **PV Assistant** — AI-powered financial Q&A with live data
