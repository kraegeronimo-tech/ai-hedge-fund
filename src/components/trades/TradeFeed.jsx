import { useState, useEffect, useCallback } from 'react';
import { fetchTrades } from '../../lib/api';
import { TradeRow } from './TradeRow';
import { TradeFilters } from './TradeFilters';

export function TradeFeed() {
  const [trades, setTrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 30;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrades({ ...filters, limit, offset });
      setTrades(data.trades || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters, offset]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setOffset(0);
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">Trade Feed</h2>
          <div className="text-[10px] font-mono text-navy-400 mt-0.5">
            All proposals, votes, and executions
          </div>
        </div>
        <TradeFilters filters={filters} onChange={handleFilterChange} />
      </div>

      <div className="bg-navy-900 border border-navy-700 p-4">
        {loading && trades.length === 0 ? (
          <div className="text-sm text-navy-500 text-center py-12">Loading trades...</div>
        ) : trades.length === 0 ? (
          <div className="text-sm text-navy-500 text-center py-12">
            No trades found. Waiting for first cycle...
          </div>
        ) : (
          trades.map((t, i) => <TradeRow key={t.id || i} trade={t} />)
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-navy-700">
            <span className="text-xs font-mono text-navy-500">
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="text-xs font-mono px-2 py-1 bg-navy-800 border border-navy-700 text-navy-400 hover:text-slate-300 disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
                className="text-xs font-mono px-2 py-1 bg-navy-800 border border-navy-700 text-navy-400 hover:text-slate-300 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
