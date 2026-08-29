import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agent/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, customInstruction } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const session = await orchestrator.executeJobPipeline(jobId, customInstruction);
    return NextResponse.json(session);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to execute agent workflow';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
