import { useState, useEffect } from 'react';
import { AGENTS } from '../../lib/constants';
import { useFund } from '../../context/FundContext';
import { formatUSD } from '../../lib/formatters';
import { fetchTrades } from '../../lib/api';
import { Badge } from '../common/Badge';
import { ReasoningBlock } from './ReasoningBlock';

export function AgentDetail({ agentId, onBack }) {
  const agent = AGENTS[agentId];
  const { fund } = useFund();
  const [agentTrades, setAgentTrades] = useState([]);

  useEffect(() => {
    fetchTrades({ agent: agentId, limit: 30 }).then(data => {
      setAgentTrades(data.trades || []);
    }).catch(() => {});
  }, [agentId]);

  if (!agent) return null;

  const proposals = agentTrades.length;
  const buys = agentTrades.filter(t => t.action === 'BUY').length;
  const sells = agentTrades.filter(t => t.action === 'SELL').length;
  const holds = agentTrades.filter(t => t.action === 'HOLD').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-navy-400 hover:text-slate-300 text-sm">← Back</button>
        <span className="text-2xl">{agent.avatar}</span>
        <div>
          <h2 className="text-lg font-bold" style={{ color: agent.color }}>{agent.name}</h2>
          <div className="text-xs font-mono text-navy-400">{agent.strategy}</div>
        </div>
        <Badge variant={agent.risk.toLowerCase()} className="ml-auto">{agent.risk} RISK</Badge>
      </div>

      {/* Agent Info */}
      <div className="bg-navy-900 border border-navy-700 p-4">
        <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-2">PERSONALITY</h3>
        <p className="text-sm text-slate-300">{agent.personality}</p>
        <p className="text-xs text-navy-400 mt-2">{agent.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'TOTAL PROPOSALS', value: proposals },
          { label: 'BUY PROPOSALS', value: buys },
          { label: 'SELL PROPOSALS', value: sells },
          { label: 'HOLD CALLS', value: holds },
        ].map(s => (
          <div key={s.label} className="bg-navy-900 border border-navy-700 p-3">
            <div className="text-[10px] font-mono text-navy-500">{s.label}</div>
            <div className="text-sm font-mono font-bold text-slate-200">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Shared Fund Status */}
      <div className="bg-navy-900 border border-navy-700 p-4">
        <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-2">SHARED FUND STATUS</h3>
        <div className="flex gap-6 text-xs">
          <div>
            <span className="text-navy-500">Cash: </span>
            <span className="font-mono text-slate-300">{formatUSD(fund?.cash || 100000)}</span>
          </div>
          <div>
            <span className="text-navy-500">Positions: </span>
            <span className="font-mono text-slate-300">{fund?.positions?.length || 0}/8</span>
          </div>
          <div>
            <span className="text-navy-500">Fund Value: </span>
            <span className="font-mono text-slate-300">{formatUSD(fund?.live_total_value || 100000)}</span>
          </div>
        </div>
      </div>

      {/* Proposal History */}
      <div className="bg-navy-900 border border-navy-700 p-4">
        <h3 className="text-xs font-mono text-navy-400 tracking-wider mb-3">PROPOSAL HISTORY</h3>
        {agentTrades.length > 0 ? (
          <div className="space-y-2">
            {agentTrades.map((t, i) => (
              <ReasoningBlock key={t.id || i} trade={t} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-navy-500 text-center py-6">No proposals yet</div>
        )}
      </div>
    </div>
  );
}
