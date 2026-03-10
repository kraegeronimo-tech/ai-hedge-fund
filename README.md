# AI Hedge Fund

An autonomous crypto trading dashboard powered by 4 AI agents that propose, vote on, and execute trades using a shared $100K paper fund.

**Live:** [ai-hedge-fund-ten-pink.vercel.app](https://ai-hedge-fund-ten-pink.vercel.app)

## How It Works

Four AI agents — each with a distinct strategy and personality — analyze the top 20 cryptocurrencies by market cap and propose trades. A trade only executes when **2 or more agents agree** (voting model). Every proposal, vote, and execution is logged transparently.

| Agent | Strategy | Personality |
|-------|----------|-------------|
| **APEX** | Momentum / Trend-Following | Brash, confident, chases winners |
| **ORACLE** | Value / Fundamentals | Measured, academic, buys dips |
| **SHADOW** | Contrarian | Sardonic, skeptical, fades the crowd |
| **CIPHER** | Quantitative / Technical | Robotic, clinical, pure data |

## Stack

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4
- **AI:** Claude Haiku 4.5 (via Anthropic SDK)
- **Database:** Supabase (PostgreSQL)
- **Market Data:** CoinGecko API (free tier)
- **Charts:** lightweight-charts v5
- **Hosting:** Vercel (serverless functions + cron)

## Project Structure

```
ai-hedge-fund/
├── api/                    # Vercel serverless functions
│   ├── trade.js            # Main trading engine (agent prompting, voting, execution)
│   ├── portfolio.js        # Portfolio with live CoinGecko prices
│   ├── market.js           # CoinGecko proxy with caching
│   ├── history.js          # Trade history with filtering
│   └── status.js           # Fund status and cycle info
├── src/
│   ├── components/
│   │   ├── agents/         # Agent cards, detail view, reasoning blocks
│   │   ├── common/         # Badge, Skeleton
│   │   ├── layout/         # Shell, Sidebar, Ticker
│   │   ├── market/         # Market grid, sparkline charts
│   │   ├── overview/       # Fund overview, stats, cycle recap, performance chart
│   │   └── trades/         # Trade feed, filters, trade rows
│   ├── context/            # React context (FundContext)
│   ├── lib/                # API client, formatters, constants, supabase client
│   └── App.jsx
├── supabase-schema.sql     # Database schema (run in Supabase SQL Editor)
└── vercel.json             # Cron config (daily trade cycle)
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/kraegeronimo-tech/ai-hedge-fund.git
cd ai-hedge-fund
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run `supabase-schema.sql` in the SQL Editor to create tables and seed data

### 3. Environment variables

Create a `.env` file for local dev, or set these in Vercel:

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Anthropic (for AI agents)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: protect the cron endpoint
CRON_SECRET=your-secret
```

### 4. Run locally

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`. API routes require Vercel CLI:

```bash
npx vercel dev
```

### 5. Deploy

```bash
npx vercel --prod
```

## Trading Engine

Each cycle:
1. Fetches top 20 coins from CoinGecko (price, volume, 1h/24h/7d/30d changes)
2. Each agent receives the market data + current fund positions + their personality prompt
3. Agents independently propose BUY/SELL/HOLD with reasoning and conviction
4. Proposals are cross-referenced — trades with **2+ agent votes** are executed
5. All proposals (executed and rejected) are logged to the database

The cron runs daily at midnight UTC (Vercel Hobby plan limit). For more frequent trading, set up an external cron to hit `POST /api/trade`.

## License

MIT
