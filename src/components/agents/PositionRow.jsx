import { formatUSD, formatCoinPrice, formatPct, pnlColor, formatNumber } from '../../lib/formatters';

export function PositionRow({ position }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-navy-800 last:border-0 text-xs">
      <div className="w-24">
        <div className="font-mono font-semibold text-slate-200">{position.symbol}</div>
        <div className="text-navy-500 text-[10px]">{position.coin_id}</div>
      </div>
      <div className="w-20 text-right font-mono tabular-nums text-slate-300">
        {formatNumber(position.amount, 4)}
      </div>
      <div className="w-24 text-right font-mono tabular-nums text-slate-300">
        {formatCoinPrice(position.avg_price)}
      </div>
      <div className="w-24 text-right font-mono tabular-nums text-slate-200">
        {formatCoinPrice(position.live_price)}
      </div>
      <div className="w-24 text-right font-mono tabular-nums text-slate-200">
        {formatUSD(position.current_value)}
      </div>
      <div className={`w-20 text-right font-mono tabular-nums font-semibold ${pnlColor(position.pnl)}`}>
        {formatPct(position.pnl_pct)}
      </div>
      <div className={`flex-1 text-right font-mono tabular-nums ${pnlColor(position.pnl)}`}>
        {formatUSD(position.pnl)}
      </div>
    </div>
  );
}
