import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    status: 'saved',
    workspaceId: `WS-OFC360-${Date.now()}`,
    savedAt: new Date().toISOString(),
    data: body,
  });
}
