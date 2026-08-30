import { NextResponse } from 'next/server';
import { graphSyncService } from '@/lib/graph/sync';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await graphSyncService.syncAll();
    return NextResponse.json({ success: true, message: 'Graph sync completed successfully.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error occurred during graph sync.';
    console.error('Graph sync failed:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
