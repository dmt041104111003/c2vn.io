import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { isDeviceBanned } from '~/lib/device-attempt-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip check for banned page itself and static assets
  if (pathname === '/auth/banned' || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots') ||
      pathname.startsWith('/sitemap')) {
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

    const deviceFingerprint = generateDeviceFingerprint(userAgent, deviceData);
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
        // Redirect to banned page for all other routes
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
