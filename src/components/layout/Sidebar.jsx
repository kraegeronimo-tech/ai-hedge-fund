import { useState, useEffect } from 'react';
import { VIEWS } from '../../lib/constants';
import { useFund } from '../../context/FundContext';
import { formatUSDCompact, formatPct, pnlColor } from '../../lib/formatters';

const NAV_ITEMS = [
  { id: VIEWS.OVERVIEW, label: 'Overview', icon: '◉' },
  { id: VIEWS.AGENTS, label: 'Agents', icon: '◈' },
  { id: VIEWS.TRADES, label: 'Trades', icon: '⇄' },
  { id: VIEWS.MARKET, label: 'Market', icon: '◫' },
];

function Countdown({ targetDate }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    function update() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Running...');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return null;

  return (
    <div className="text-xs font-mono tabular-nums text-cyan-400">
      {remaining}
    </div>
  );
}

export function Sidebar({ activeView, onViewChange }) {
  const { totalAUM, totalPnL, totalPnLPct, fund, status } = useFund();

  return (
    <aside className="w-56 bg-navy-900 border-r border-navy-700 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <span className="text-cyan-400 font-mono font-bold text-sm">AI</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">HEDGE FUND</div>
            <div className="text-[10px] font-mono text-navy-400">4-AGENT COMMITTEE</div>
          </div>
        </div>
      </div>

      {/* Fund Summary */}
      <div className="p-4 border-b border-navy-700 space-y-2">
        <div className="text-[10px] font-mono text-navy-400 tracking-wider">TOTAL AUM</div>
        <div className="text-lg font-mono font-bold text-slate-200 tabular-nums">
          {formatUSDCompact(totalAUM)}
        </div>
        <div className={`text-xs font-mono tabular-nums ${pnlColor(totalPnL)}`}>
          {formatPct(totalPnLPct)} P&L
        </div>
        <div className="text-[10px] font-mono text-navy-500">
          {fund?.positions?.length || 0}/8 positions · {fund?.total_trades || 0} trades
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
              activeView === item.id
                ? 'bg-navy-700 text-slate-200 nav-active'
                : 'text-navy-400 hover:text-slate-300 hover:bg-navy-800'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Voting Info */}
      <div className="p-4 border-t border-navy-700 space-y-2">
        <div className="text-[10px] font-mono text-navy-400 tracking-wider">VOTING RULES</div>
        <div className="text-[10px] text-navy-500 leading-relaxed">
          4 agents propose trades. Needs 2+ votes to execute. Majority rules.
        </div>
      </div>

      {/* Status & Countdown */}
      <div className="p-4 border-t border-navy-700 space-y-2">
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <span className="w-2 h-2 rounded-full bg-profit pulse-glow" />
          <span className="font-mono">
            {status?.total_cycles || 0} cycles
          </span>
        </div>
        {status?.next_run && (
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-navy-500">NEXT CYCLE IN</div>
            <Countdown targetDate={status.next_run} />
          </div>
        )}
        {status?.last_run && (
          <div className="text-[10px] font-mono text-navy-500">
            Last: {new Date(status.last_run).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
            {new Date(status.last_run).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        )}
      </div>
    </aside>
  );
}
