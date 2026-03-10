import { useFund } from '../../context/FundContext';
import { formatCoinPrice, formatPct } from '../../lib/formatters';

export function Ticker() {
  const { market } = useFund();

  if (!market.length) return null;

  const items = [...market, ...market];

  return (
    <div className="bg-navy-900 border-b border-navy-700 overflow-hidden h-8 flex items-center">
      <div className="ticker-animate flex items-center gap-4 whitespace-nowrap px-4">
        {items.map((coin, i) => (
          <span key={`${coin.id}-${i}`} className="flex items-center gap-1.5 text-xs font-mono ticker-coin px-1.5 py-0.5 transition-colors">
            <span className="text-slate-300 font-semibold">{coin.symbol}</span>
            <span className="text-slate-200">{formatCoinPrice(coin.price)}</span>
            <span className={`font-semibold ${coin.change_24h >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPct(coin.change_24h)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
