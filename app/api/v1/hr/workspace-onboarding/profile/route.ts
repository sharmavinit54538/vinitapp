import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    status: 'saved',
    adminId: `ADM-OFC360-${Date.now()}`,
    savedAt: new Date().toISOString(),
    data: body,
  });
}
