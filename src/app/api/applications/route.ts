import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  const applications = db.getApplications();
  return NextResponse.json(applications);
}
