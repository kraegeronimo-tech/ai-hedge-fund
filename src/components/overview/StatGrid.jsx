import { useFund } from '../../context/FundContext';
import { formatUSD, formatPct, pnlColor } from '../../lib/formatters';

function StatCard({ label, value, sub, subColor, accent, large }) {
  return (
    <div className={`bg-navy-900 border border-navy-700 p-4 ${accent ? 'border-top-accent' : ''}`}
      style={accent ? { borderTopColor: accent } : undefined}
    >
      <div className="text-[10px] font-mono text-navy-400 tracking-wider mb-1">{label}</div>
      <div className={`font-mono font-bold text-slate-200 tabular-nums ${large ? 'text-2xl' : 'text-xl'}`}>
        {value}
      </div>
      {sub && (
        <div className={`text-xs font-mono mt-1 tabular-nums ${subColor || 'text-navy-400'}`}>{sub}</div>
      )}
    </div>
  );
}

export function StatGrid() {
  const { fund, totalAUM, totalPnL, totalPnLPct, status } = useFund();

  const totalTrades = fund?.total_trades || 0;
  const totalWins = fund?.winning_trades || 0;
  const winRate = totalTrades > 0 ? (totalWins / totalTrades * 100) : 0;
  const posCount = fund?.positions?.length || 0;

  const pnlGlow = totalPnL > 0 ? 'glow-profit' : totalPnL < 0 ? 'glow-loss' : '';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 fade-in-stagger">
      <StatCard
        label="TOTAL AUM"
        value={formatUSD(totalAUM)}
        sub={`${formatPct(totalPnLPct)} all-time`}
        subColor={pnlColor(totalPnL)}
        accent="#06B6D4"
        large
      />
      <StatCard
        label="TOTAL P&L"
        value={<span className={pnlGlow}>{formatUSD(totalPnL)}</span>}
        sub="from $100,000 initial"
        subColor={pnlColor(totalPnL)}
        accent={totalPnL >= 0 ? '#00C853' : '#EF4444'}
      />
      <StatCard
        label="CASH"
        value={formatUSD(fund?.cash || 100000)}
        sub={`${((fund?.cash || 100000) / totalAUM * 100).toFixed(0)}% of fund`}
      />
      <StatCard
        label="WIN RATE"
        value={`${winRate.toFixed(1)}%`}
        sub={`${totalWins}/${totalTrades} closed`}
      />
      <StatCard
        label="POSITIONS"
        value={`${posCount}/8`}
        sub={`${status?.total_cycles || 0} cycles completed`}
      />
    </div>
  );
}
