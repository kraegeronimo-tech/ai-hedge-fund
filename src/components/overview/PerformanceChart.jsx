import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function PerformanceChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('performance_snapshots')
      .select('*')
      .eq('agent_id', 'fund')
      .order('timestamp', { ascending: true })
      .then(({ data }) => {
        if (data) setSnapshots(data);
      });
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    let cancelled = false;
    import('lightweight-charts').then(({ createChart, LineSeries }) => {
      if (cancelled || !chartRef.current) return;

      if (chartInstance.current) {
        chartInstance.current.remove();
      }

      const chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 280,
        layout: {
          background: { color: 'transparent' },
          textColor: '#4A5A80',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: '#1A2035' },
          horzLines: { color: '#1A2035' },
        },
        crosshair: {
          vertLine: { color: '#374463', width: 1, style: 2 },
          horzLine: { color: '#374463', width: 1, style: 2 },
        },
        timeScale: {
          borderColor: '#1A2035',
          timeVisible: true,
        },
        rightPriceScale: {
          borderColor: '#1A2035',
        },
      });
      chartInstance.current = chart;

      // Fund total value line
      const series = chart.addSeries(LineSeries, {
        color: '#00C853',
        lineWidth: 2,
        priceLineVisible: true,
        lastValueVisible: true,
        title: 'FUND VALUE',
      });

      const fundSnaps = snapshots.map(s => ({
        time: Math.floor(new Date(s.timestamp).getTime() / 1000),
        value: s.total_value,
      }));

      if (fundSnaps.length > 0) {
        series.setData(fundSnaps);
      } else {
        const now = Math.floor(Date.now() / 1000);
        series.setData([
          { time: now - 86400, value: 100000 },
          { time: now, value: 100000 },
        ]);
      }

      // Add baseline at $100K
      const baseline = chart.addSeries(LineSeries, {
        color: '#374463',
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const firstTime = fundSnaps.length > 0 ? fundSnaps[0].time : Math.floor(Date.now() / 1000) - 86400;
      const lastTime = fundSnaps.length > 0 ? fundSnaps[fundSnaps.length - 1].time : Math.floor(Date.now() / 1000);
      baseline.setData([
        { time: firstTime, value: 100000 },
        { time: lastTime, value: 100000 },
      ]);

      chart.timeScale().fitContent();

      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      });
      ro.observe(chartRef.current);

      return () => ro.disconnect();
    });

    return () => {
      cancelled = true;
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, [snapshots]);

  return (
    <div className="bg-navy-900 border border-navy-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-navy-400 tracking-wider">FUND PERFORMANCE</h3>
        <div className="flex items-center gap-3 text-[10px] font-mono text-navy-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-profit inline-block" />
            Fund Value
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-navy-500 inline-block" style={{ borderTop: '1px dashed #374463' }} />
            $100K Baseline
          </span>
        </div>
      </div>
      <div ref={chartRef} />
    </div>
  );
}
