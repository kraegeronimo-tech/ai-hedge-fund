# Hive Capital

AI analyst firm simulation with 6 comical agent personalities that analyze crypto markets, propose trades, and vote on execution. Corporate comedy tone with a classified-document aesthetic.

## Tech Stack

- React 19 + Vite 7 + Tailwind CSS 4
- Supabase (PostgreSQL -- portfolio, trades, performance snapshots)
- Anthropic Claude Haiku 4.5 (agent decision-making)
- CoinGecko API (crypto market data)
- lightweight-charts v5 (price charts)
- Single-page app (no router)

## Setup

```bash
git clone https://github.com/kraegeronimo-tech/ai-hedge-fund.git
cd ai-hedge-fund
npm install
cp .env.example .env  # Then fill in values
npm run dev
```

## Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

- Supabase project ID: `bmslbiftesddeafsafqk`
- `VITE_` prefixed vars are exposed to the client
- `ANTHROPIC_API_KEY` and `COINGECKO_API_KEY` are server-only (Vercel API functions)

## Deployment

```bash
npx vercel --prod --yes
```

**Vercel URL:** https://ai-hedge-fund-ten-pink.vercel.app

## Agents

| Agent | Personality | Color |
|-------|------------|-------|
| APEX | Crypto gym bro | #F97316 |
| ORACLE | Stock snob | #3B82F6 |
| SHADOW | Doomer | #A855F7 |
| CIPHER | Quant robot | #06B6D4 |
| LUMI | Goth TCG nerd | #EC4899 |
| GREMLIN | Feral degen | #22C55E |

## Database Tables

- `agent_portfolios` -- Per-agent holdings
- `trades` -- Trade history
- `trade_cycles` -- Voting rounds
- `performance_snapshots` -- Portfolio value over time

All tables use RLS with `service_role` for writes.

## Key Notes

- Shared $100K fund. Agents propose trades; 2+ votes required to execute.
- CoinGecko coin IDs differ from symbols (e.g., `hyperliquid` not `hype`, `binancecoin` not `bnb`).
- Use `chart.addSeries(LineSeries, opts)` not `addLineSeries` (lightweight-charts v5 API).
- Vercel daily cron on Hobby plan. Can use external cron for 4h intervals hitting `POST /api/trade`.
- Theme: Dark void (#06070B), honey/amber (#FBBF24), Outfit (display) + Space Mono (mono).
