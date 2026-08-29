import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  const traces = db.getTraces();
  return NextResponse.json(traces);
}
