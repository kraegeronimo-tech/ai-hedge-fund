import { AGENTS } from '../../lib/constants';

export function TradeFilters({ filters, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={filters.agent || ''}
        onChange={e => onChange({ ...filters, agent: e.target.value || undefined })}
        className="bg-navy-800 border border-navy-700 text-slate-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-navy-500"
      >
        <option value="">All Agents</option>
        <option value="fund">FUND (Executed)</option>
        {Object.values(AGENTS).map(a => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <select
        value={filters.action || ''}
        onChange={e => onChange({ ...filters, action: e.target.value || undefined })}
        className="bg-navy-800 border border-navy-700 text-slate-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-navy-500"
      >
        <option value="">All Actions</option>
        <option value="BUY">BUY</option>
        <option value="SELL">SELL</option>
        <option value="HOLD">HOLD</option>
      </select>
    </div>
  );
}
