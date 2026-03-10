import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data: lastCycle } = await supabase
      .from('trade_cycles')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    const { count } = await supabase
      .from('trade_cycles')
      .select('*', { count: 'exact', head: true });

    const lastRun = lastCycle?.completed_at || null;
    const nextRun = lastRun
      ? new Date(new Date(lastRun).getTime() + 4 * 60 * 60 * 1000).toISOString()
      : null;

    return res.status(200).json({
      last_cycle: lastCycle || null,
      last_run: lastRun,
      next_run: nextRun,
      total_cycles: count || 0,
    });
  } catch (err) {
    console.error('Status API error:', err);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}
