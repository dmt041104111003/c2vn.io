import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { isDeviceBanned } from '~/lib/device-attempt-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/register', '/api/auth/signin', '/api/auth/signup'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
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
              error: 'Device is temporarily banned from authentication',
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

    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/signin',
    '/auth/signup',
    '/auth/register', 
    '/api/auth/signin',
    '/api/auth/signup'
  ]
};
