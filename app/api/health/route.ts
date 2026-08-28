import { getDatabase } from '@/db/runtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const database = await getDatabase();
    const [positions, events, monitor] = await database.batch([
      database.prepare('SELECT COUNT(*) AS count FROM current_positions'),
      database.prepare('SELECT COUNT(*) AS count FROM trade_events'),
      database.prepare('SELECT completed_at, status FROM monitor_runs ORDER BY COALESCE(completed_at, started_at) DESC LIMIT 1'),
    ]);
    return Response.json({
      ok: true,
      positions: Number((positions.results?.[0] as { count?: number } | undefined)?.count ?? 0),
      events: Number((events.results?.[0] as { count?: number } | undefined)?.count ?? 0),
      monitor: monitor.results?.[0] ?? null,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Health check failed.' }, { status: 500 });
  }
}
