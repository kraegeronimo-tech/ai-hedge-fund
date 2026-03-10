import { useState, useEffect } from 'react';
import { AGENTS } from '../../lib/constants';
import { useFund } from '../../context/FundContext';
import { fetchTrades } from '../../lib/api';
import { Badge } from '../common/Badge';
import { timeAgo } from '../../lib/formatters';

export function AgentCard({ agentId, onSelect }) {
  const agent = AGENTS[agentId];
  const { agentStances } = useFund();
  const stances = agentStances[agentId] || [];
  const [tradeCount, setTradeCount] = useState(0);

  useEffect(() => {
    fetchTrades({ agent: agentId, limit: 1 }).then(data => {
      setTradeCount(data.total || 0);
    }).catch(() => {});
  }, [agentId]);

  if (!agent) return null;

  // Deduplicate stances by action+symbol+reasoning (strip [REJECTED...] prefix first)
  const seen = new Set();
  const uniqueStances = stances.filter(s => {
    const cleanReasoning = s.reasoning?.replace(/^\[.*?\]\s*/, '').slice(0, 50);
    const key = `${s.action}:${s.symbol}:${cleanReasoning}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div
      className="bg-navy-900 border border-navy-700 card-hover cursor-pointer border-top-accent"
      style={{ borderTopColor: agent.color }}
      onClick={() => onSelect?.(agentId)}
    >
      {/* Header */}
      <div className="p-4 border-b border-navy-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center text-xl"
              style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
            >
              {agent.avatar}
            </div>
            <div>
              <span className="text-sm font-bold" style={{ color: agent.color }}>{agent.name}</span>
              <div className="text-[10px] font-mono text-navy-500">{agent.strategy}</div>
            </div>
          </div>
          <Badge variant={agent.risk.toLowerCase()}>{agent.risk} RISK</Badge>
        </div>
        <p className="text-xs text-navy-400 leading-relaxed">{agent.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 border-b border-navy-800">
        <div className="p-3 border-r border-navy-800">
          <div className="text-[10px] font-mono text-navy-500">PROPOSALS</div>
          <div className="text-lg font-mono font-bold text-slate-200 tabular-nums">{tradeCount}</div>
        </div>
        <div className="p-3">
          <div className="text-[10px] font-mono text-navy-500">PERSONALITY</div>
          <div className="text-[11px] text-navy-400 line-clamp-2 leading-relaxed">{agent.personality}</div>
        </div>
      </div>

      {/* Recent Stances */}
      <div className="p-4">
        <div className="text-[10px] font-mono text-navy-500 mb-2">LATEST PROPOSALS</div>
        {uniqueStances.length > 0 ? (
          <div className="space-y-2.5">
            {uniqueStances.slice(0, 3).map((s, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant={s.action}>{s.action}</Badge>
                  {s.symbol && <span className="font-mono text-slate-300">{s.symbol}</span>}
                  {s.conviction && (
                    <Badge variant={s.conviction.toLowerCase()} className="text-[9px]">{s.conviction}</Badge>
                  )}
                  <span className="text-[10px] font-mono text-navy-500 ml-auto">{timeAgo(s.created_at)}</span>
                </div>
                <p className="text-navy-400 line-clamp-2 leading-relaxed text-[11px]">
                  {s.reasoning?.replace(/^\[.*?\]\s*/, '')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-navy-500 text-center py-2">No proposals yet</div>
        )}
      </div>
    </div>
  );
}
