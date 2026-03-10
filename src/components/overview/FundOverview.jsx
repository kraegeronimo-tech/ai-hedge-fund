import { StatGrid } from './StatGrid';
import { PerformanceChart } from './PerformanceChart';
import { CycleRecap } from './CycleRecap';
import { useFund } from '../../context/FundContext';
import { AGENTS } from '../../lib/constants';
import { formatUSD, formatPct, pnlColor, timeAgo } from '../../lib/formatters';
import { Badge } from '../common/Badge';

function Positions() {
  const { fund, totalAUM } = useFund();
  const positions = fund?.positions || [];

  return (
    <div className="bg-navy-900 border border-navy-700 p-4">
      <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-3">
        FUND POSITIONS ({positions.length}/8)
      </h3>
      {positions.length > 0 ? (
        <div className="space-y-3">
          {positions.map(pos => {
            const allocPct = totalAUM > 0 ? (pos.current_value / totalAUM * 100) : 0;
            const isUp = pos.pnl >= 0;
            return (
              <div key={pos.coin_id} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center gap-2 w-16">
                    <span className={`w-2 h-2 rounded-full ${isUp ? 'bg-profit' : 'bg-loss'}`} />
                    <span className="font-mono font-semibold text-sm text-slate-200">{pos.symbol}</span>
                  </div>
                  <div className="flex-1 text-right font-mono tabular-nums text-xs text-slate-400">
                    {formatUSD(pos.current_value)}
                  </div>
                  <div className={`w-16 text-right font-mono tabular-nums text-xs font-semibold ${pnlColor(pos.pnl)} ${isUp ? 'glow-profit' : pos.pnl < 0 ? 'glow-loss' : ''}`}>
                    {formatPct(pos.pnl_pct)}
                  </div>
                  <div className={`w-20 text-right font-mono tabular-nums text-xs ${pnlColor(pos.pnl)}`}>
                    {pos.pnl >= 0 ? '+' : ''}{formatUSD(pos.pnl)}
                  </div>
                </div>
                {/* Allocation bar */}
                <div className="alloc-bar ml-6">
                  <div
                    className="alloc-bar-fill"
                    style={{
                      width: `${Math.min(allocPct, 100)}%`,
                      background: isUp ? 'var(--color-profit)' : 'var(--color-loss)',
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
            );
          })}
          {/* Total */}
          <div className="flex items-center gap-3 pt-2 border-t border-navy-700">
            <div className="w-16 text-[10px] font-mono text-navy-500">TOTAL</div>
            <div className="flex-1 text-right font-mono tabular-nums text-xs text-slate-300 font-semibold">
              {formatUSD(fund?.positions_value)}
            </div>
            <div className={`w-16 text-right font-mono tabular-nums text-xs font-semibold ${pnlColor(fund?.total_pnl)}`}>
              {formatPct(fund?.total_pnl_pct)}
            </div>
            <div className={`w-20 text-right font-mono tabular-nums text-xs font-semibold ${pnlColor(fund?.total_pnl)}`}>
              {fund?.total_pnl >= 0 ? '+' : ''}{formatUSD(fund?.total_pnl)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-navy-500 text-center py-6">
          No positions yet. Waiting for first trade cycle...
        </div>
      )}
    </div>
  );
}

function RecentActivity() {
  const { trades } = useFund();
  const recent = trades.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="bg-navy-900 border border-navy-700 p-4">
        <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-3">RECENT ACTIVITY</h3>
        <div className="text-sm text-navy-500 text-center py-6">
          No activity yet. Waiting for first cycle...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-900 border border-navy-700 p-4">
      <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-3">RECENT ACTIVITY</h3>
      <div className="space-y-0.5">
        {recent.map((t, i) => {
          const agent = AGENTS[t.agent_id];
          const isFund = t.agent_id === 'fund';
          const isRejected = t.portfolio_snapshot?.type === 'rejected';
          const voteCount = t.portfolio_snapshot?.vote_count;

          return (
            <div key={t.id || i} className={`flex items-center gap-2 text-xs py-2 border-b border-navy-800/50 last:border-0 ${isRejected ? 'opacity-40' : ''} ${isFund ? 'bg-profit/5 -mx-1 px-1' : ''}`}>
              <span
                className="font-mono font-bold w-14 text-[10px]"
                style={{ color: isFund ? '#00C853' : agent?.color }}
              >
                {isFund ? 'FUND' : t.agent_id?.toUpperCase()}
              </span>
              <Badge variant={t.action}>{t.action}</Badge>
              {voteCount && (
                <span className="text-[9px] font-mono text-navy-500">{voteCount}/4</span>
              )}
              <span className="text-slate-300 font-mono text-[11px]">{t.symbol}</span>
              <span className="text-navy-500 flex-1 truncate text-[10px]">
                {t.reasoning?.replace(/^\[.*?\]\s*/, '').slice(0, 60)}
              </span>
              <span className="text-navy-500 font-mono text-[9px] shrink-0">{timeAgo(t.created_at)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentPanel() {
  const { agentStances } = useFund();

  return (
    <div className="bg-navy-900 border border-navy-700 p-4">
      <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-3">AGENT COMMITTEE</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.values(AGENTS).map(agent => {
          const stances = agentStances[agent.id] || [];
          const lastStance = stances[0];
          return (
            <div
              key={agent.id}
              className="border border-navy-700 p-3 border-top-accent card-hover"
              style={{ borderTopColor: agent.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{agent.avatar}</span>
                <div>
                  <span className="text-xs font-bold" style={{ color: agent.color }}>{agent.name}</span>
                  <div className="text-[9px] text-navy-500">{agent.strategy}</div>
                </div>
              </div>
              {lastStance ? (
                <div className="text-[11px] text-navy-400 leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant={lastStance.action}>{lastStance.action}</Badge>
                    {lastStance.symbol && <span className="font-mono text-slate-300 text-[10px]">{lastStance.symbol}</span>}
                  </div>
                  <p className="line-clamp-2 text-[10px]">{lastStance.reasoning?.replace(/^\[.*?\]\s*/, '')}</p>
                </div>
              ) : (
                <div className="text-[10px] text-navy-500">No proposals yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FundOverview() {
  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Fund Overview</h2>
        <div className="text-xs font-mono text-navy-400">SHARED FUND · VOTING MODEL · $100K PAPER</div>
      </div>
      <StatGrid />
      <CycleRecap />
      <PerformanceChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Positions />
        <div className="space-y-4">
          <AgentPanel />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
