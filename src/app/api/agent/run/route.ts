import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agent/orchestrator';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, customInstruction } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const session = await orchestrator.executeJobPipeline(jobId, customInstruction, sessionUser.user.id);
    return NextResponse.json(session);
  } catch (err: unknown) {
    console.error('[Orchestrator Error]:', err);
    require('fs').writeFileSync('orchestrator-error.log', err instanceof Error ? err.stack : String(err));
    const message = err instanceof Error ? err.message : 'Failed to execute agent workflow';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
