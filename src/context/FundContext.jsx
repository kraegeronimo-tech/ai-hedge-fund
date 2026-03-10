import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchPortfolios, fetchMarket, fetchStatus, fetchTrades } from '../lib/api';
import { POLL_INTERVALS } from '../lib/constants';

const FundContext = createContext(null);

export function FundProvider({ children }) {
  const [fund, setFund] = useState(null);
  const [agentStances, setAgentStances] = useState({});
  const [market, setMarket] = useState([]);
  const [trades, setTrades] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervals = useRef([]);

  const loadPortfolio = useCallback(async () => {
    try {
      const data = await fetchPortfolios();
      setFund(data.fund || null);
      setAgentStances(data.agent_stances || {});
    } catch (e) {
      console.error('Portfolio fetch error:', e);
    }
  }, []);

  const loadMarket = useCallback(async () => {
    try {
      const data = await fetchMarket();
      setMarket(data);
    } catch (e) {
      console.error('Market fetch error:', e);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchStatus();
      setStatus(data);
    } catch (e) {
      console.error('Status fetch error:', e);
    }
  }, []);

  const loadTrades = useCallback(async () => {
    try {
      const data = await fetchTrades({ limit: 50 });
      setTrades(data.trades || []);
    } catch (e) {
      console.error('Trades fetch error:', e);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPortfolio(), loadMarket(), loadStatus(), loadTrades()]);
    setLoading(false);
  }, [loadPortfolio, loadMarket, loadStatus, loadTrades]);

  useEffect(() => {
    loadAll();

    intervals.current = [
      setInterval(loadPortfolio, POLL_INTERVALS.PORTFOLIO),
      setInterval(loadMarket, POLL_INTERVALS.MARKET),
      setInterval(loadStatus, POLL_INTERVALS.STATUS),
      setInterval(loadTrades, POLL_INTERVALS.PORTFOLIO),
    ];

    return () => intervals.current.forEach(clearInterval);
  }, [loadAll, loadPortfolio, loadMarket, loadStatus, loadTrades]);

  const totalAUM = fund?.live_total_value || 100000;
  const totalPnL = fund?.total_pnl || 0;
  const totalPnLPct = fund?.total_pnl_pct || 0;

  return (
    <FundContext.Provider value={{
      fund,
      agentStances,
      market,
      trades,
      status,
      loading,
      totalAUM,
      totalPnL,
      totalPnLPct,
      refresh: loadAll,
    }}>
      {children}
    </FundContext.Provider>
  );
}

export function useFund() {
  const ctx = useContext(FundContext);
  if (!ctx) throw new Error('useFund must be used within FundProvider');
  return ctx;
}
