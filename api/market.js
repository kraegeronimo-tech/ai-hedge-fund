// CoinGecko proxy — cached at edge for 120s
let cache = { data: null, ts: 0 };
const TTL = 120_000;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now = Date.now();
    if (cache.data && now - cache.ts < TTL) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cache.data);
    }

    const url = 'https://api.coingecko.com/api/v3/coins/markets?' + new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '20',
      page: '1',
      sparkline: 'true',
      price_change_percentage: '1h,24h,7d,30d',
    });

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API: ${response.status}`);
    }

    const coins = await response.json();

    const data = coins.map(c => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      market_cap: c.market_cap,
      market_cap_rank: c.market_cap_rank,
      volume_24h: c.total_volume,
      change_1h: c.price_change_percentage_1h_in_currency,
      change_24h: c.price_change_percentage_24h_in_currency,
      change_7d: c.price_change_percentage_7d_in_currency,
      change_30d: c.price_change_percentage_30d_in_currency,
      high_24h: c.high_24h,
      low_24h: c.low_24h,
      ath: c.ath,
      ath_change: c.ath_change_percentage,
      sparkline: c.sparkline_in_7d?.price || [],
    }));

    cache = { data, ts: now };
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Market API error:', err);
    if (cache.data) {
      res.setHeader('X-Cache', 'STALE');
      return res.status(200).json(cache.data);
    }
    return res.status(502).json({ error: 'Failed to fetch market data' });
  }
}
