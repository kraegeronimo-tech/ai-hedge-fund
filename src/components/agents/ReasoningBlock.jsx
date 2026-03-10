import { AGENTS } from '../../lib/constants';
import { timeAgo } from '../../lib/formatters';
import { Badge } from '../common/Badge';

export function ReasoningBlock({ trade }) {
  const agent = AGENTS[trade.agent_id];
  return (
    <div className="bg-navy-800/50 border-l-2 p-3 text-xs" style={{ borderColor: agent?.color || '#4A5A80' }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Badge variant={trade.action}>{trade.action}</Badge>
        {trade.symbol && <span className="font-mono text-slate-300">{trade.symbol}</span>}
        <span className="text-navy-500 font-mono ml-auto">{timeAgo(trade.created_at)}</span>
      </div>
      <p className="text-slate-400 leading-relaxed">{trade.reasoning}</p>
    </div>
  );
}
