import { NextRequest } from 'next/server';

export function getClientIP(req: NextRequest): string {
  const realIP = req.headers.get('X-Real-IP');
  if (realIP) {
    return realIP.trim();
  }
  
  const xForwardedFor = req.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    const clientIP = xForwardedFor.split(',')[0].trim();
    return clientIP;
  }
  
  const remoteAddr = req.headers.get('X-Forwarded-For') || 
                    req.headers.get('X-Real-IP') || 
                    'unknown';
  
  return remoteAddr;
}

export function getUserAgent(req: NextRequest): string {
  return req.headers.get('User-Agent') || 'unknown';
}

export function getClientInfo(req: NextRequest): {
  ip: string;
  userAgent: string;
} {
  return {
    ip: getClientIP(req),
    userAgent: getUserAgent(req)
  };
}
