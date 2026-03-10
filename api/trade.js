import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AGENTS = {
  apex: {
    personality: `You are APEX, a brash momentum trader on a 4-agent hedge fund committee. You chase winners and cut losers at -8%. You love volatile coins breaking out. Speak in short, punchy sentences. Use sports metaphors. You're confident, almost cocky.`,
    strategy: 'momentum',
  },
  oracle: {
    personality: `You are ORACLE, a measured value investor on a 4-agent hedge fund committee. You buy dips in high-cap coins and hold long-term. Speak in measured, academic paragraphs with financial jargon. You are patient and dismissive of short-term noise.`,
    strategy: 'value',
  },
  shadow: {
    personality: `You are SHADOW, a sardonic contrarian on a 4-agent hedge fund committee. You buy what everyone is selling and sell what everyone is buying. Speak with dark humor, skepticism, and irony. Mock herd mentality.`,
    strategy: 'contrarian',
  },
  cipher: {
    personality: `You are CIPHER, a quantitative trader on a 4-agent hedge fund committee. Speak in data points, numbers, and technical indicators. Reference RSI, moving averages, volume patterns. Be robotic and clinical. No emotions — only data.`,
    strategy: 'quant',
  },
};

const INITIAL_FUND = 100000;

function buildPrompt(agentId, agent, portfolio, marketData) {
  const positionsStr = portfolio.positions.length > 0
    ? portfolio.positions.map(p => {
        const coin = marketData.find(c => c.id === p.coin_id);
        const livePrice = coin?.current_price || p.price;
        const pnlPct = ((livePrice - p.avg_price) / p.avg_price * 100).toFixed(2);
        return `  - ${p.symbol}: ${p.amount.toFixed(6)} units @ avg $${p.avg_price.toFixed(2)}, now $${livePrice.toFixed(2)} (${pnlPct}%)`;
      }).join('\n')
    : '  (no positions)';

  const marketStr = marketData.slice(0, 20).map(c =>
    `  ${c.id} (${c.symbol.toUpperCase()}): $${c.current_price.toFixed(2)} | 1h: ${(c.price_change_percentage_1h_in_currency || 0).toFixed(2)}% | 24h: ${(c.price_change_percentage_24h_in_currency || 0).toFixed(2)}% | 7d: ${(c.price_change_percentage_7d_in_currency || 0).toFixed(2)}% | 30d: ${(c.price_change_percentage_30d_in_currency || 0).toFixed(2)}% | Vol: $${(c.total_volume / 1e6).toFixed(0)}M | MCap: $${(c.market_cap / 1e9).toFixed(1)}B`
  ).join('\n');

  return `${agent.personality}

You are one of 4 AI agents managing a shared $100,000 crypto hedge fund. Each cycle, all 4 agents propose trades independently. Proposals that get 2+ votes (agreement from multiple agents) are executed. Your vote matters — argue your case.

RULES:
- You can only trade coins from the top 20 by market cap (listed below)
- The fund can hold max 8 positions total
- Each trade should be 5-15% of total fund value ($5K-$15K per trade)
- You must provide compelling reasoning for every proposal
- Cut losses: propose SELL for any position below -10%
- You get to propose 1-3 actions per cycle

SHARED FUND PORTFOLIO:
  Cash: $${portfolio.cash.toFixed(2)}
  Total Value: $${portfolio.total_value.toFixed(2)}
  Positions:
${positionsStr}

MARKET DATA (Top 20 by Market Cap):
${marketStr}

Respond with a JSON array of proposals. Each proposal:
{
  "action": "BUY" | "SELL" | "HOLD",
  "coin_id": "bitcoin",
  "symbol": "BTC",
  "amount_usd": 10000,
  "conviction": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "Your reasoning in character (2-3 sentences)"
}

CRITICAL: The "coin_id" MUST be the exact ID shown before the parentheses in the market data above (e.g., "bitcoin", "ethereum", "solana", "hyperliquid", "cardano"). NOT the ticker symbol.

Rules:
- BUY: specify amount_usd (5-15% of fund value). Must have enough cash. Max 8 positions.
- SELL: sells entire position. Set amount_usd to 0.
- HOLD: commentary only. Set amount_usd to 0.
- Include 1-3 proposals per cycle. Quality over quantity.
- HIGH conviction = you really want this trade. MEDIUM = worth considering. LOW = minor preference.

Respond ONLY with a valid JSON array. No markdown, no backticks.`;
}

function parseAgentResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
}

function tallyVotes(allProposals) {
  // Group proposals by action+coin_id
  const buckets = {};

  for (const proposal of allProposals) {
    if (proposal.action === 'HOLD') continue; // HOLDs don't go to vote
    const key = `${proposal.action}:${proposal.coin_id}`;
    if (!buckets[key]) {
      buckets[key] = {
        action: proposal.action,
        coin_id: proposal.coin_id,
        symbol: proposal.symbol,
        votes: [],
        total_amount: 0,
        max_conviction: 'LOW',
      };
    }
    buckets[key].votes.push({
      agent_id: proposal.agent_id,
      amount_usd: proposal.amount_usd,
      conviction: proposal.conviction,
      reasoning: proposal.reasoning,
    });
    buckets[key].total_amount += proposal.amount_usd || 0;

    const convictionRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if ((convictionRank[proposal.conviction] || 0) > (convictionRank[buckets[key].max_conviction] || 0)) {
      buckets[key].max_conviction = proposal.conviction;
    }
  }

  // Only execute trades with 2+ votes (majority)
  const approved = [];
  const rejected = [];

  for (const [key, bucket] of Object.entries(buckets)) {
    if (bucket.votes.length >= 2) {
      // Use average amount for BUY trades
      const avgAmount = bucket.action === 'BUY'
        ? bucket.total_amount / bucket.votes.length
        : 0;
      approved.push({
        ...bucket,
        amount_usd: avgAmount,
        vote_count: bucket.votes.length,
      });
    } else {
      rejected.push({
        ...bucket,
        vote_count: bucket.votes.length,
        reason: 'Insufficient votes (needs 2+)',
      });
    }
  }

  // Sort by vote count descending, then conviction
  approved.sort((a, b) => {
    if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
    const cr = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (cr[b.max_conviction] || 0) - (cr[a.max_conviction] || 0);
  });

  return { approved, rejected };
}

function executeTrade(decision, portfolio, marketData) {
  const { action, coin_id, symbol, amount_usd, votes } = decision;
  // Try exact match first, then fallback to symbol match
  let coin = marketData.find(c => c.id === coin_id);
  if (!coin && symbol) {
    coin = marketData.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
  }
  const price = coin?.current_price || 0;
  // Use the canonical coin_id from CoinGecko
  const canonicalId = coin?.id || coin_id;

  if (action === 'BUY') {
    const actualAmount = Math.min(amount_usd, portfolio.cash);
    if (actualAmount < 1000) return null; // Skip if too small

    const coinAmount = actualAmount / price;
    const existing = portfolio.positions.find(p => p.coin_id === canonicalId);
    if (existing) {
      const totalCoinAmount = existing.amount + coinAmount;
      const totalCost = (existing.amount * existing.avg_price) + actualAmount;
      existing.avg_price = totalCost / totalCoinAmount;
      existing.amount = totalCoinAmount;
      existing.price = price;
    } else {
      portfolio.positions.push({
        coin_id: canonicalId,
        symbol: coin?.symbol?.toUpperCase() || symbol,
        amount: coinAmount,
        avg_price: price,
        price,
        bought_at: new Date().toISOString(),
      });
    }
    portfolio.cash -= actualAmount;

    return {
      action: 'BUY',
      coin_id: canonicalId,
      symbol: coin?.symbol?.toUpperCase() || symbol,
      amount: coinAmount,
      price,
      value: actualAmount,
      pnl: 0,
    };
  }

  if (action === 'SELL') {
    const posIndex = portfolio.positions.findIndex(p => p.coin_id === canonicalId);
    if (posIndex === -1) return null;

    const pos = portfolio.positions[posIndex];
    const value = pos.amount * price;
    const costBasis = pos.amount * pos.avg_price;
    const pnl = value - costBasis;

    portfolio.cash += value;
    portfolio.positions.splice(posIndex, 1);

    return {
      action: 'SELL',
      coin_id: canonicalId,
      symbol: coin?.symbol?.toUpperCase() || symbol,
      amount: pos.amount,
      price,
      value,
      pnl,
    };
  }

  return null;
}

async function ensureFundPortfolio() {
  const { data } = await supabase
    .from('agent_portfolios')
    .select('*')
    .eq('agent_id', 'fund')
    .single();

  if (!data) {
    await supabase.from('agent_portfolios').upsert({
      agent_id: 'fund',
      cash: INITIAL_FUND,
      positions: [],
      total_value: INITIAL_FUND,
      total_trades: 0,
      winning_trades: 0,
    });
    return {
      agent_id: 'fund',
      cash: INITIAL_FUND,
      positions: [],
      total_value: INITIAL_FUND,
      total_trades: 0,
      winning_trades: 0,
    };
  }
  return data;
}

export default async function handler(req, res) {
  // Auth check
  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch market data
    const marketUrl = 'https://api.coingecko.com/api/v3/coins/markets?' + new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '20',
      page: '1',
      sparkline: 'true',
      price_change_percentage: '1h,24h,7d,30d',
    });

    const marketRes = await fetch(marketUrl);
    if (!marketRes.ok) throw new Error(`CoinGecko: ${marketRes.status}`);
    const marketData = await marketRes.json();

    const cycleStart = new Date().toISOString();

    // Get shared fund portfolio
    let portfolio = await ensureFundPortfolio();
    portfolio.positions = portfolio.positions || [];
    portfolio.winning_trades = portfolio.winning_trades || 0;
    portfolio.total_trades = portfolio.total_trades || 0;

    // Collect all agent proposals
    const allProposals = [];
    const agentResults = {};

    for (const [agentId, agent] of Object.entries(AGENTS)) {
      try {
        const prompt = buildPrompt(agentId, agent, portfolio, marketData);
        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          temperature: 0.3,
          messages: [{ role: 'user', content: prompt }],
        });

        const responseText = message.content[0].text;
        const decisions = parseAgentResponse(responseText);

        const proposals = decisions.map(d => ({
          ...d,
          agent_id: agentId,
        }));

        allProposals.push(...proposals);
        agentResults[agentId] = { proposals: proposals.length, raw: proposals };

        // Log all proposals (including HOLDs) as individual trades
        for (const p of proposals) {
          await supabase.from('trades').insert({
            agent_id: agentId,
            action: p.action,
            coin_id: p.coin_id || null,
            symbol: p.symbol || null,
            amount: 0,
            price: marketData.find(c => c.id === p.coin_id)?.current_price || 0,
            value: p.amount_usd || 0,
            pnl: 0,
            reasoning: p.reasoning,
            portfolio_snapshot: {
              type: 'proposal',
              conviction: p.conviction || 'MEDIUM',
              vote_status: 'pending',
            },
            created_at: new Date().toISOString(),
          });
        }
      } catch (agentErr) {
        console.error(`Error with agent ${agentId}:`, agentErr);
        agentResults[agentId] = { error: agentErr.message };
      }
    }

    // Tally votes
    const { approved, rejected } = tallyVotes(allProposals);

    // Execute approved trades
    const executedTrades = [];
    for (const trade of approved) {
      // Validate
      if (trade.action === 'BUY') {
        if (trade.amount_usd > portfolio.cash) continue;
        if (!portfolio.positions.find(p => p.coin_id === trade.coin_id) && portfolio.positions.length >= 8) continue;
      }
      if (trade.action === 'SELL') {
        if (!portfolio.positions.find(p => p.coin_id === trade.coin_id)) continue;
      }

      const result = executeTrade(trade, portfolio, marketData);
      if (result) {
        if (result.action === 'SELL') {
          portfolio.total_trades++;
          if (result.pnl > 0) portfolio.winning_trades++;
        }

        // Log executed trade with vote details
        await supabase.from('trades').insert({
          agent_id: 'fund',
          action: result.action,
          coin_id: result.coin_id,
          symbol: result.symbol,
          amount: result.amount,
          price: result.price,
          value: result.value,
          pnl: result.pnl,
          reasoning: `[${trade.vote_count}/4 votes, ${trade.max_conviction} conviction] ` +
            trade.votes.map(v => `${v.agent_id.toUpperCase()}: ${v.reasoning}`).join(' | '),
          portfolio_snapshot: {
            type: 'executed',
            votes: trade.votes.map(v => v.agent_id),
            vote_count: trade.vote_count,
            conviction: trade.max_conviction,
            cash_after: portfolio.cash,
          },
          created_at: new Date().toISOString(),
        });

        executedTrades.push({ ...result, vote_count: trade.vote_count });
      }
    }

    // Log rejected trades
    for (const trade of rejected) {
      await supabase.from('trades').insert({
        agent_id: trade.votes[0]?.agent_id || 'unknown',
        action: trade.action,
        coin_id: trade.coin_id,
        symbol: trade.symbol,
        amount: 0,
        price: marketData.find(c => c.id === trade.coin_id)?.current_price || 0,
        value: trade.votes[0]?.amount_usd || 0,
        pnl: 0,
        reasoning: `[REJECTED - ${trade.vote_count}/4 votes] ${trade.votes[0]?.reasoning || ''}`,
        portfolio_snapshot: {
          type: 'rejected',
          votes: trade.votes.map(v => v.agent_id),
          vote_count: trade.vote_count,
          reason: trade.reason,
        },
        created_at: new Date().toISOString(),
      });
    }

    // Calculate total value
    const positionsValue = portfolio.positions.reduce((sum, p) => {
      const coin = marketData.find(c => c.id === p.coin_id);
      return sum + (p.amount * (coin?.current_price || p.price));
    }, 0);
    portfolio.total_value = portfolio.cash + positionsValue;

    // Update fund portfolio — use update instead of upsert for reliability
    const fundUpdate = {
      cash: Number(portfolio.cash),
      positions: JSON.parse(JSON.stringify(portfolio.positions)),
      total_value: Number(portfolio.total_value),
      total_trades: Number(portfolio.total_trades),
      winning_trades: Number(portfolio.winning_trades),
      updated_at: new Date().toISOString(),
    };
    console.log('Saving fund portfolio:', JSON.stringify({ cash: fundUpdate.cash, posCount: fundUpdate.positions.length, total: fundUpdate.total_value }));

    const { error: fundError } = await supabase
      .from('agent_portfolios')
      .update(fundUpdate)
      .eq('agent_id', 'fund');

    if (fundError) {
      console.error('Fund portfolio update error:', fundError);
      // Fallback: try upsert
      const { error: upsertError } = await supabase.from('agent_portfolios').upsert({
        agent_id: 'fund',
        ...fundUpdate,
      });
      if (upsertError) console.error('Fund upsert fallback error:', upsertError);
    }

    // Performance snapshot
    await supabase.from('performance_snapshots').insert({
      agent_id: 'fund',
      total_value: portfolio.total_value,
      cash: portfolio.cash,
      positions_value: positionsValue,
      timestamp: new Date().toISOString(),
    });

    // Record trade cycle
    const { count: cycleCount } = await supabase
      .from('trade_cycles')
      .select('*', { count: 'exact', head: true });

    await supabase.from('trade_cycles').insert({
      cycle_number: (cycleCount || 0) + 1,
      market_snapshot: marketData.slice(0, 5).map(c => ({
        id: c.id,
        symbol: c.symbol,
        price: c.current_price,
        change_24h: c.price_change_percentage_24h_in_currency,
      })),
      agents_processed: agentResults,
      total_fund_value: portfolio.total_value,
      started_at: cycleStart,
      completed_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      cycle: (cycleCount || 0) + 1,
      total_fund_value: portfolio.total_value,
      proposals_total: allProposals.length,
      approved: approved.length,
      rejected: rejected.length,
      trades_executed: executedTrades.length,
      agents: agentResults,
    });
  } catch (err) {
    console.error('Trade cycle error:', err);
    return res.status(500).json({ error: err.message });
  }
}
