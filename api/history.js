import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { agent, action, limit = '50', offset = '0' } = req.query;

    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (agent) query = query.eq('agent_id', agent);
    if (action) query = query.eq('action', action);

    const { data, count, error } = await query;
    if (error) throw error;

    return res.status(200).json({ trades: data || [], total: count || 0 });
  } catch (err) {
    console.error('History API error:', err);
    return res.status(500).json({ error: 'Failed to fetch trade history' });
  }
}
