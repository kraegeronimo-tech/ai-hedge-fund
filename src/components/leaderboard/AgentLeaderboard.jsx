import { useFund } from '../../context/FundContext';
import { AGENTS } from '../../lib/constants';
import { formatUSD, formatPct, pnlColor } from '../../lib/formatters';

export function AgentLeaderboard() {
  const { portfolios } = useFund();

  const ranked = [...portfolios]
    .sort((a, b) => (b.total_pnl || 0) - (a.total_pnl || 0))
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-200">Agent Leaderboard</h2>

      <div className="bg-navy-900 border border-navy-700">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 p-3 border-b border-navy-700 text-[10px] font-mono text-navy-500">
          <div>#</div>
          <div className="col-span-2">AGENT</div>
          <div className="text-right">VALUE</div>
          <div className="text-right">P&L</div>
          <div className="text-right">P&L %</div>
          <div className="text-right">WIN RATE</div>
          <div className="text-right">TRADES</div>
        </div>

        {ranked.length === 0 ? (
          <div className="text-sm text-navy-500 text-center py-12">
            No data yet. Waiting for first cycle...
          </div>
        ) : (
          ranked.map(p => {
            const agent = AGENTS[p.agent_id];
            if (!agent) return null;
            return (
              <div
                key={p.agent_id}
                className="grid grid-cols-8 gap-2 p-3 border-b border-navy-800 last:border-0 items-center hover:bg-navy-800/50 transition-colors"
              >
                <div className="text-lg font-mono font-bold text-navy-500">
                  {p.rank}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-lg">{agent.avatar}</span>
                  <div>
                    <span className="text-sm font-bold" style={{ color: agent.color }}>
                      {agent.name}
                    </span>
                    <div className="text-[10px] font-mono text-navy-500">{agent.strategy}</div>
                  </div>
                </div>
                <div className="text-right text-sm font-mono font-bold text-slate-200 tabular-nums">
                  {formatUSD(p.live_total_value || 25000)}
                </div>
                <div className={`text-right text-sm font-mono font-bold tabular-nums ${pnlColor(p.total_pnl)}`}>
                  {formatUSD(p.total_pnl || 0)}
                </div>
                <div className={`text-right text-sm font-mono tabular-nums ${pnlColor(p.total_pnl)}`}>
                  {formatPct(p.total_pnl_pct || 0)}
                </div>
                <div className="text-right text-sm font-mono tabular-nums text-slate-300">
                  {(p.win_rate || 0).toFixed(0)}%
                </div>
                <div className="text-right text-sm font-mono tabular-nums text-slate-400">
                  {p.total_trades || 0}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stat Comparison */}
      {ranked.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ranked.map(p => {
            const agent = AGENTS[p.agent_id];
            if (!agent) return null;
            const cashPct = ((p.cash || 0) / (p.live_total_value || 25000) * 100);
            return (
              <div key={p.agent_id} className="bg-navy-900 border border-navy-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span>{agent.avatar}</span>
                  <span className="text-sm font-bold" style={{ color: agent.color }}>{agent.name}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-navy-400">Cash</span>
                    <span className="font-mono tabular-nums text-slate-300">{formatUSD(p.cash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-400">Invested</span>
                    <span className="font-mono tabular-nums text-slate-300">{(100 - cashPct).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-400">Positions</span>
                    <span className="font-mono tabular-nums text-slate-300">{p.positions?.length || 0}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-400">W/L</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {p.winning_trades || 0}/{(p.total_trades || 0) - (p.winning_trades || 0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
