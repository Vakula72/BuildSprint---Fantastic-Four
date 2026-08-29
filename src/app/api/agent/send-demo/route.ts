import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agent/orchestrator';
import { db } from '@/lib/db/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required', status: 'FAILED' }, { status: 400 });
    }

    // Human Approval Gate Check: Must be approved before sending
    const existingApp = db.getApplicationByJobId(jobId);
    if (!existingApp || (existingApp.status !== 'APPROVED' && existingApp.status !== 'SENT' && existingApp.status !== 'QUEUED')) {
      return NextResponse.json(
        {
          error: 'Explicit human approval is required before outreach email can be sent.',
          status: 'PENDING_APPROVAL'
        },
        { status: 403 }
      );
    }

    // Execute server-side Nodemailer email transport
    const application = await orchestrator.sendDemoEmail(jobId);

    const isSuccess = application.status === 'SENT';

    return NextResponse.json({
      success: isSuccess,
      status: application.status,
      application,
      timestamp: application.demoSentAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outreachId: `outreach_${jobId}`,
      message: application.actionLog || (isSuccess ? 'Outreach email sent successfully.' : 'Unable to send email. Please try again.')
    }, { status: isSuccess ? 200 : 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Unable to send email. Please try again.', status: 'FAILED', success: false }, { status: 500 });
  }
}
