import { useFund } from '../../context/FundContext';
import { formatCoinPrice, formatUSDCompact, formatPct, pnlColor } from '../../lib/formatters';
import { MiniChart } from './MiniChart';

export function MarketGrid() {
  const { market } = useFund();

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Market Overview</h2>
        <span className="text-xs font-mono text-navy-400">TOP 20 BY MARKET CAP · COINGECKO</span>
      </div>

      <div className="bg-navy-900 border border-navy-700">
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_2rem_1fr_6rem_5rem_5rem_5rem_5rem_5rem_5rem] gap-2 p-3 border-b border-navy-700 text-[10px] font-mono text-navy-500">
          <div>#</div>
          <div></div>
          <div>NAME</div>
          <div className="text-right">PRICE</div>
          <div className="text-right">1H</div>
          <div className="text-right">24H</div>
          <div className="text-right">7D</div>
          <div className="text-right">MCAP</div>
          <div className="text-right">VOLUME</div>
          <div className="text-right">7D CHART</div>
        </div>

        {market.length === 0 ? (
          <div className="text-sm text-navy-500 text-center py-12">Loading market data...</div>
        ) : (
          market.map(coin => {
            const sparkColor = (coin.change_7d || 0) >= 0 ? '#00C853' : '#EF4444';
            return (
              <div
                key={coin.id}
                className="grid grid-cols-[2.5rem_2rem_1fr_6rem_5rem_5rem_5rem_5rem_5rem_5rem] gap-2 p-3 border-b border-navy-800 last:border-0 items-center hover:bg-navy-800/30 transition-colors"
              >
                <div className="text-xs font-mono text-navy-500">{coin.market_cap_rank}</div>
                <div>
                  <img src={coin.image} alt="" className="w-5 h-5" loading="lazy" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">{coin.name}</span>
                  <span className="text-xs font-mono text-navy-500 ml-1.5">{coin.symbol}</span>
                </div>
                <div className="text-right text-xs font-mono tabular-nums text-slate-200">
                  {formatCoinPrice(coin.price)}
                </div>
                <div className={`text-right text-xs font-mono tabular-nums ${pnlColor(coin.change_1h)}`}>
                  {formatPct(coin.change_1h)}
                </div>
                <div className={`text-right text-xs font-mono tabular-nums ${pnlColor(coin.change_24h)}`}>
                  {formatPct(coin.change_24h)}
                </div>
                <div className={`text-right text-xs font-mono tabular-nums ${pnlColor(coin.change_7d)}`}>
                  {formatPct(coin.change_7d)}
                </div>
                <div className="text-right text-xs font-mono tabular-nums text-slate-400">
                  {formatUSDCompact(coin.market_cap)}
                </div>
                <div className="text-right text-xs font-mono tabular-nums text-slate-400">
                  {formatUSDCompact(coin.volume_24h)}
                </div>
                <div className="text-right">
                  <MiniChart data={coin.sparkline} color={sparkColor} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
