const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const pctFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
});

export function formatUSD(n) {
  if (n == null || isNaN(n)) return '$0.00';
  return usdFormat.format(n);
}

export function formatUSDCompact(n) {
  if (n == null || isNaN(n)) return '$0';
  return usdCompact.format(n);
}

export function formatPct(n) {
  if (n == null || isNaN(n)) return '+0.00%';
  return pctFormat.format(n / 100);
}

export function formatNumber(n, decimals = 2) {
  if (n == null || isNaN(n)) return '0';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCoinPrice(price) {
  if (price == null) return '$0.00';
  if (price >= 1) return formatUSD(price);
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function pnlColor(value) {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return 'text-navy-400';
}

export function pnlBg(value) {
  if (value > 0) return 'bg-profit/10';
  if (value < 0) return 'bg-loss/10';
  return 'bg-navy-700';
}
