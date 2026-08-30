import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = db.getProfile(session.user.id);
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedProfile = await req.json();
    const saved = db.updateProfile(updatedProfile, session.user.id);
    return NextResponse.json(saved);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update candidate profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
