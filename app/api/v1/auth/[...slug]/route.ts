import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const action = slug.join('/');

  return NextResponse.json(
    {
      detail: `Authentication service endpoint "/${action}" requires a live backend. Configure NEXT_PUBLIC_API_BASE_URL to connect your authentication provider.`,
      status: 'service_unavailable',
    },
    { status: 503 }
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const action = slug.join('/');

  return NextResponse.json(
    {
      detail: `Authentication service endpoint "/${action}" requires a live backend service. Please connect your authentication API via NEXT_PUBLIC_API_BASE_URL.`,
      status: 'service_unavailable',
    },
    { status: 503 }
  );
}
