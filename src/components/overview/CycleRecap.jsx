import { useFund } from '../../context/FundContext';
import { AGENTS } from '../../lib/constants';
import { Badge } from '../common/Badge';
import { formatUSD, formatDateTime } from '../../lib/formatters';

function reconstructVotes(cycle) {
  const agents = cycle.agents_processed || {};
  const allProposals = [];

  for (const [agentId, data] of Object.entries(agents)) {
    if (data.raw) {
      for (const p of data.raw) {
        allProposals.push({ ...p, agent_id: agentId });
      }
    }
  }

  const buckets = {};
  const holds = [];

  for (const p of allProposals) {
    if (p.action === 'HOLD') {
      holds.push(p);
      continue;
    }
    const key = `${p.action}:${p.coin_id}`;
    if (!buckets[key]) {
      buckets[key] = {
        action: p.action,
        coin_id: p.coin_id,
        symbol: p.symbol,
        voters: [],
        amounts: [],
        reasonings: [],
      };
    }
    buckets[key].voters.push(p.agent_id);
    buckets[key].amounts.push(p.amount_usd || 0);
    buckets[key].reasonings.push({ agent: p.agent_id, text: p.reasoning });
  }

  const approved = [];
  const rejected = [];

  for (const bucket of Object.values(buckets)) {
    const avgAmount = bucket.action === 'BUY'
      ? bucket.amounts.reduce((a, b) => a + b, 0) / bucket.voters.length
      : 0;

    if (bucket.voters.length >= 2) {
      approved.push({ ...bucket, avg_amount: avgAmount });
    } else {
      rejected.push(bucket);
    }
  }

  approved.sort((a, b) => b.voters.length - a.voters.length);

  return { approved, rejected, holds, totalProposals: allProposals.length };
}

export function CycleRecap() {
  const { status } = useFund();
  const cycle = status?.last_cycle;

  if (!cycle) {
    return (
      <div className="bg-navy-900 border border-navy-700 p-4">
        <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-3">LATEST CYCLE</h3>
        <div className="text-sm text-navy-500 text-center py-4">
          No cycles yet. First trade cycle coming soon...
        </div>
      </div>
    );
  }

  const { approved, rejected, holds, totalProposals } = reconstructVotes(cycle);

  return (
    <div className="bg-navy-900 border border-navy-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-mono text-navy-400 tracking-wider">
            CYCLE #{cycle.cycle_number}
          </h3>
          <span className="text-[10px] font-mono text-navy-500">
            {formatDateTime(cycle.completed_at)}
          </span>
        </div>
        <div className="text-[10px] font-mono text-navy-500">
          {totalProposals} proposals &rarr; {approved.length} executed &middot; {rejected.length} rejected
        </div>
      </div>

      {/* Executed trades */}
      {approved.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-mono text-profit tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-profit rounded-full" />
            EXECUTED
          </div>
          <div className="space-y-2">
            {approved.map((trade, i) => (
              <div key={i} className="border-l-2 border-l-profit pl-3 py-2 bg-profit/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant={trade.action}>{trade.action}</Badge>
                  <span className="text-sm font-mono font-semibold text-slate-200">{trade.symbol}</span>
                  {trade.action === 'BUY' && (
                    <span className="text-xs font-mono text-slate-400">
                      {formatUSD(trade.avg_amount)}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-navy-400 ml-auto">
                    {trade.voters.length}/4 votes
                  </span>
                  <div className="flex gap-1.5">
                    {trade.voters.map(v => (
                      <span key={v} className="text-[10px] font-mono font-bold" style={{ color: AGENTS[v]?.color }}>
                        {AGENTS[v]?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  {trade.reasonings.map((r, j) => (
                    <div key={j} className="flex gap-2 text-[11px] leading-relaxed">
                      <span className="font-mono font-semibold shrink-0" style={{ color: AGENTS[r.agent]?.color }}>
                        {AGENTS[r.agent]?.avatar}
                      </span>
                      <span className="text-navy-400">{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected trades */}
      {rejected.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-navy-500 tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-navy-500 rounded-full" />
            REJECTED
          </div>
          <div className="space-y-1">
            {rejected.map((trade, i) => (
              <div key={i} className="flex items-center gap-2 py-1 pl-3 border-l border-navy-700 opacity-60">
                <Badge variant={trade.action}>{trade.action}</Badge>
                <span className="text-xs font-mono text-navy-400">{trade.symbol}</span>
                <span className="text-[10px] font-mono text-navy-500">
                  {trade.voters.length}/4 &mdash; only {trade.voters.map(v => AGENTS[v]?.name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
