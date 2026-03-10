const BASE = '/api';

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${path}: ${res.status} — ${text}`);
  }
  return res.json();
}

export function fetchPortfolios() {
  return fetchJSON('/portfolio');
}

export function fetchMarket() {
  return fetchJSON('/market');
}

export function fetchTrades(params = {}) {
  const query = new URLSearchParams();
  if (params.agent) query.set('agent', params.agent);
  if (params.action) query.set('action', params.action);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));
  const qs = query.toString();
  return fetchJSON(`/history${qs ? `?${qs}` : ''}`);
}

export function fetchStatus() {
  return fetchJSON('/status');
}

export function triggerTrade() {
  return fetchJSON('/trade', { method: 'POST' });
}
