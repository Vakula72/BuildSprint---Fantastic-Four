import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agent/orchestrator';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workflowId, customRecipientEmail } = body;

    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
    }

    const application = await orchestrator.approveAction(workflowId, customRecipientEmail, session.user.id);
    return NextResponse.json({ success: true, application });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve workflow action';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
