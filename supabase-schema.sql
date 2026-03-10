-- AI Hedge Fund Database Schema
-- Run this in Supabase SQL Editor

-- Agent Portfolios — 1 row per agent, upserted each cycle
CREATE TABLE IF NOT EXISTS agent_portfolios (
  agent_id TEXT PRIMARY KEY,
  cash DECIMAL NOT NULL DEFAULT 25000,
  positions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_value DECIMAL NOT NULL DEFAULT 25000,
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades — every decision logged
CREATE TABLE IF NOT EXISTS trades (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  coin_id TEXT,
  symbol TEXT,
  amount DECIMAL,
  price DECIMAL,
  value DECIMAL,
  pnl DECIMAL DEFAULT 0,
  reasoning TEXT,
  portfolio_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_agent ON trades(agent_id);
CREATE INDEX IF NOT EXISTS idx_trades_action ON trades(action);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at DESC);

-- Trade Cycles — each 4h run
CREATE TABLE IF NOT EXISTS trade_cycles (
  id BIGSERIAL PRIMARY KEY,
  cycle_number INTEGER NOT NULL,
  market_snapshot JSONB,
  agents_processed JSONB,
  total_fund_value DECIMAL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Snapshots — for charts
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  total_value DECIMAL NOT NULL,
  cash DECIMAL NOT NULL,
  positions_value DECIMAL NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_agent ON performance_snapshots(agent_id);
CREATE INDEX IF NOT EXISTS idx_perf_time ON performance_snapshots(timestamp);

-- RLS: anon can SELECT all tables
ALTER TABLE agent_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read agent_portfolios" ON agent_portfolios
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public read trades" ON trades
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public read trade_cycles" ON trade_cycles
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public read performance_snapshots" ON performance_snapshots
  FOR SELECT TO anon USING (true);

-- Service role gets full access (for API routes)
CREATE POLICY "Service write agent_portfolios" ON agent_portfolios
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service write trades" ON trades
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service write trade_cycles" ON trade_cycles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service write performance_snapshots" ON performance_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial portfolios
INSERT INTO agent_portfolios (agent_id, cash, positions, total_value, total_trades, winning_trades)
VALUES
  ('apex', 25000, '[]'::jsonb, 25000, 0, 0),
  ('oracle', 25000, '[]'::jsonb, 25000, 0, 0),
  ('shadow', 25000, '[]'::jsonb, 25000, 0, 0),
  ('cipher', 25000, '[]'::jsonb, 25000, 0, 0)
ON CONFLICT (agent_id) DO NOTHING;
