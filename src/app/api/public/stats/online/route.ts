import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

const NEXT_PUBLIC_WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4001';

export const revalidate = 0;

export const GET = async () => {
  try {
    const res = await fetch(`${NEXT_PUBLIC_WEBSOCKET_URL}/api/online-users`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Upstream status ${res.status}`);
    const data = await res.json();
    const total = data?.stats?.total ?? 0;
    const authenticated = data?.stats?.authenticated ?? 0;
    const anonymous = data?.stats?.anonymous ?? 0;
    return NextResponse.json(createSuccessResponse({ total, authenticated, anonymous }));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch online count', 'WEBSOCKET_ERROR'),
      { status: 500 }
    );
  }
};


