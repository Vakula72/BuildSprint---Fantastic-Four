import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = db.getJobs();
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newJob = await req.json();
    if (!newJob.title || !newJob.company) {
      return NextResponse.json({ error: 'Title and company are required' }, { status: 400 });
    }
    const saved = db.addJob({
      ...newJob,
      id: `job_${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      requirements: newJob.requirements || []
    });
    return NextResponse.json(saved, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
