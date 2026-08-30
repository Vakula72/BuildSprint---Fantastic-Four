import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const skillGaps = db.getSkillGaps(session.user.id);
  return NextResponse.json(skillGaps);
}
