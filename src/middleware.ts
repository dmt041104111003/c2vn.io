import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateDeviceFingerprint, generateDeviceFingerprintSync } from '~/lib/device-fingerprint';
import { isDeviceBanned } from '~/lib/device-attempt-utils';

// Simple cache for device fingerprints to avoid repeated crypto operations
const fingerprintCache = new Map<string, { fingerprint: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedFingerprint(userAgent: string, deviceData: any): string | null {
  const key = `${userAgent}-${JSON.stringify(deviceData)}`;
  const cached = fingerprintCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.fingerprint;
  }
  
  return null;
}

function setCachedFingerprint(userAgent: string, deviceData: any, fingerprint: string): void {
  const key = `${userAgent}-${JSON.stringify(deviceData)}`;
  fingerprintCache.set(key, { fingerprint, timestamp: Date.now() });
  
  // Clean old cache entries
  if (fingerprintCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of fingerprintCache.entries()) {
      if (now - v.timestamp > CACHE_DURATION) {
        fingerprintCache.delete(k);
      }
    }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip check for banned page itself and static assets
  if (pathname === '/auth/banned' || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots') ||
      pathname.startsWith('/sitemap') ||
      pathname.includes('_next_hmr') ||
      pathname.includes('__nextjs_original-stack-frames')) {
    return NextResponse.next();
  }

  try {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    
    const deviceData = {
      userAgent,
      acceptLanguage,
      acceptEncoding,
      platform: request.headers.get('sec-ch-ua-platform') || '',
      screenResolution: request.headers.get('sec-ch-ua') || ''
    };

    let deviceFingerprint = getCachedFingerprint(userAgent, deviceData);
    
    if (!deviceFingerprint) {
      deviceFingerprint = generateDeviceFingerprintSync(userAgent, deviceData);
      setCachedFingerprint(userAgent, deviceData, deviceFingerprint);
    }

    const banned = await isDeviceBanned(deviceFingerprint);

    if (banned) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Device is temporarily banned',
            code: 'DEVICE_BANNED'
          },
          { status: 403 }
        );
      } else {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/banned';
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error('Error in middleware:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [

    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
};
