import { AGENTS } from '../../lib/constants';
import { formatUSD, pnlColor, timeAgo } from '../../lib/formatters';
import { Badge } from '../common/Badge';

export function TradeRow({ trade }) {
  const agent = AGENTS[trade.agent_id];
  const isFund = trade.agent_id === 'fund';
  const isRejected = trade.portfolio_snapshot?.type === 'rejected';
  const voteCount = trade.portfolio_snapshot?.vote_count;
  const conviction = trade.portfolio_snapshot?.conviction;
  const voters = trade.portfolio_snapshot?.votes || [];

  // Clean reasoning - strip vote metadata prefix
  const cleanReasoning = trade.reasoning?.replace(/^\[.*?\]\s*/, '') || '';

  // Visual styling based on trade type
  const borderClass = isFund
    ? 'border-l-2 border-l-profit bg-profit/5'
    : isRejected
      ? 'border-l-2 border-l-loss/30 opacity-50'
      : 'border-l border-l-navy-700';

  return (
    <div className={`py-3 border-b border-navy-800 last:border-0 pl-3 ${borderClass}`}>
      {/* Top row: agent, action, coin, value, time */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-xs font-mono font-bold w-14"
          style={{ color: isFund ? '#00C853' : agent?.color }}
        >
          {isFund ? 'FUND' : trade.agent_id?.toUpperCase()}
        </span>
        <Badge variant={trade.action}>{trade.action}</Badge>
        <span className="text-xs font-mono font-semibold text-slate-300">{trade.symbol}</span>

        {/* Vote count for fund/rejected */}
        {voteCount && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 ${
            isFund ? 'bg-profit/15 text-profit' : 'bg-loss/10 text-loss/70'
          }`}>
            {voteCount}/4 votes
          </span>
        )}

        {/* Conviction badge for proposals */}
        {conviction && !isFund && !isRejected && (
          <Badge variant={conviction.toLowerCase()}>{conviction}</Badge>
        )}

        {/* Voter avatars for fund trades */}
        {isFund && voters.length > 0 && (
          <div className="flex gap-1 ml-1">
            {voters.map(v => (
              <span key={v} className="text-[10px] font-mono font-bold" style={{ color: AGENTS[v]?.color }}>
                {AGENTS[v]?.name}
              </span>
            ))}
          </div>
        )}

        {/* Value and time pushed right */}
        <div className="ml-auto flex items-center gap-3">
          {trade.action !== 'HOLD' && trade.value > 0 && (
            <span className="text-xs font-mono tabular-nums text-slate-300">
              {formatUSD(trade.value)}
            </span>
          )}
          {trade.pnl !== 0 && (
            <span className={`text-xs font-mono tabular-nums font-semibold ${pnlColor(trade.pnl)}`}>
              {trade.pnl > 0 ? '+' : ''}{formatUSD(trade.pnl)}
            </span>
          )}
          <span className="text-[10px] font-mono text-navy-500 w-14 text-right">
            {timeAgo(trade.created_at)}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div className={`text-[11px] leading-relaxed pl-14 ${isFund ? 'text-navy-400' : 'text-navy-500'}`}>
        {isFund ? (
          <div className="space-y-1">
            {cleanReasoning.split(' | ').map((segment, i) => {
              const colonIdx = segment.indexOf(':');
              if (colonIdx > 0 && colonIdx < 12) {
                const agentName = segment.slice(0, colonIdx).trim();
                const agentKey = agentName.toLowerCase();
                const text = segment.slice(colonIdx + 1).trim();
                return (
                  <div key={i} className="flex gap-2">
                    <span className="font-mono font-semibold shrink-0 text-[10px]" style={{ color: AGENTS[agentKey]?.color }}>
                      {AGENTS[agentKey]?.avatar || agentName}
                    </span>
                    <span>{text}</span>
                  </div>
                );
              }
              return <span key={i}>{segment}</span>;
            })}
          </div>
        ) : (
          <span className="line-clamp-2">{cleanReasoning}</span>
        )}
      </div>
    </div>
  );
}
