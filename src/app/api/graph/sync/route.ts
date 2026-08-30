import { NextResponse } from 'next/server';
import { graphSync } from '@/lib/graph/sync';

export async function POST(req: Request) {
  try {
    // Simple authentication check for the hackathon
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'sync-secret-key'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger full sync
    const success = await graphSync.syncAll();

    if (success) {
      return NextResponse.json({ message: 'Graph sync completed successfully' });
    } else {
      return NextResponse.json({ error: 'Graph sync failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/graph/sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
