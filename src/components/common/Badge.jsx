const VARIANTS = {
  BUY: 'bg-profit/20 text-profit border-profit/30',
  SELL: 'bg-loss/20 text-loss border-loss/30',
  HOLD: 'bg-navy-600/30 text-navy-400 border-navy-600/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  default: 'bg-navy-700/50 text-navy-400 border-navy-600/30',
};

export function Badge({ children, variant = 'default', className = '' }) {
  const styles = VARIANTS[variant] || VARIANTS.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-semibold border ${styles} ${className}`}>
      {children}
    </span>
  );
}
