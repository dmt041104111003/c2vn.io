import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

const NEXT_PUBLIC_WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4001';

export const revalidate = 0;

let cachedPayload: { total: number; authenticated: number; anonymous: number } | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5_000; // 5 seconds

type WindowHits = { timestamps: number[] };
const ipWindows = new Map<string, WindowHits>();
const WINDOW_MS = 60_000; 
const MAX_REQ_PER_WINDOW = 60; // 60 req/ip/min

function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip) ?? { timestamps: [] };
  // drop old timestamps
  entry.timestamps = entry.timestamps.filter(t => now - t <= WINDOW_MS);
  if (entry.timestamps.length >= MAX_REQ_PER_WINDOW) {
    ipWindows.set(ip, entry);
    return true;
  }
  entry.timestamps.push(now);
  ipWindows.set(ip, entry);
  return false;
}

export const GET = async (req: Request) => {
  try {
    const ip = getIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        createErrorResponse('Too many requests', 'RATE_LIMITED'),
        { status: 429 }
      );
    }

    const now = Date.now();
    if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
      return NextResponse.json(createSuccessResponse(cachedPayload));
    }

    const res = await fetch(`${NEXT_PUBLIC_WEBSOCKET_URL}/api/online-users`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Upstream status ${res.status}`);
    const data = await res.json();
    const total = data?.stats?.total ?? 0;
    const authenticated = data?.stats?.authenticated ?? 0;
    const anonymous = data?.stats?.anonymous ?? 0;
    cachedPayload = { total, authenticated, anonymous };
    cachedAt = now;
    return NextResponse.json(createSuccessResponse(cachedPayload));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch online count', 'WEBSOCKET_ERROR'),
      { status: 500 }
    );
  }
};


