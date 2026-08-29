import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  const profile = db.getProfile();
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  try {
    const updatedProfile = await req.json();
    const saved = db.updateProfile(updatedProfile);
    return NextResponse.json(saved);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update candidate profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
