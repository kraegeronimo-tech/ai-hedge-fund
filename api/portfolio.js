import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

let marketCache = { data: null, ts: 0 };
const MARKET_TTL = 60_000;

async function getLivePrices() {
  const now = Date.now();
  if (marketCache.data && now - marketCache.ts < MARKET_TTL) return marketCache.data;

  const url = 'https://api.coingecko.com/api/v3/coins/markets?' + new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '20',
    page: '1',
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error('CoinGecko fetch failed');
  const coins = await res.json();
  const prices = {};
  for (const c of coins) {
    prices[c.id] = c.current_price;
  }
  marketCache = { data: prices, ts: now };
  return prices;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [{ data: fundData, error: fundError }, prices] = await Promise.all([
      supabase.from('agent_portfolios').select('*').eq('agent_id', 'fund').single(),
      getLivePrices(),
    ]);

    // Also get recent proposals per agent for their "stance"
    const { data: recentTrades } = await supabase
      .from('trades')
      .select('*')
      .neq('agent_id', 'fund')
      .order('created_at', { ascending: false })
      .limit(20);

    const fund = fundData || {
      agent_id: 'fund',
      cash: 100000,
      positions: [],
      total_value: 100000,
      total_trades: 0,
      winning_trades: 0,
    };

    // Enrich positions with live prices
    const positions = (fund.positions || []).map(pos => {
      const livePrice = prices[pos.coin_id] || pos.price;
      const currentValue = pos.amount * livePrice;
      const costBasis = pos.amount * pos.avg_price;
      return {
        ...pos,
        live_price: livePrice,
        current_value: currentValue,
        pnl: currentValue - costBasis,
        pnl_pct: ((livePrice - pos.avg_price) / pos.avg_price) * 100,
      };
    });

    const positionsValue = positions.reduce((sum, pos) => sum + pos.current_value, 0);
    const totalValue = fund.cash + positionsValue;
    const totalPnl = totalValue - 100000;
    const totalPnlPct = (totalPnl / 100000) * 100;
    const winRate = fund.total_trades > 0 ? (fund.winning_trades / fund.total_trades) * 100 : 0;

    // Group recent proposals by agent
    const agentStances = {};
    for (const t of (recentTrades || [])) {
      if (!agentStances[t.agent_id]) {
        agentStances[t.agent_id] = [];
      }
      if (agentStances[t.agent_id].length < 3) {
        agentStances[t.agent_id].push({
          action: t.action,
          symbol: t.symbol,
          reasoning: t.reasoning,
          conviction: t.portfolio_snapshot?.conviction,
          created_at: t.created_at,
        });
      }
    }

    const result = {
      fund: {
        cash: fund.cash,
        positions,
        positions_value: positionsValue,
        live_total_value: totalValue,
        total_value: fund.total_value,
        total_pnl: totalPnl,
        total_pnl_pct: totalPnlPct,
        total_trades: fund.total_trades || 0,
        winning_trades: fund.winning_trades || 0,
        win_rate: winRate,
        updated_at: fund.updated_at,
      },
      agent_stances: agentStances,
    };

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
    return res.status(200).json(result);
  } catch (err) {
    console.error('Portfolio API error:', err);
    return res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
}
