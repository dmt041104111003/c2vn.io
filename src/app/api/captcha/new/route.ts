import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(payload: string, secret: string) {
  const h = crypto.createHmac('sha256', secret);
  h.update(payload);
  return base64url(h.digest());
}

export const GET = async () => {
  try {
    const secret = process.env.CAPTCHA_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        createErrorResponse('Captcha secret not configured', 'CONFIG_ERROR'),
        { status: 500 }
      );
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes
    const payloadObj = { t: text, exp: expiresAt } as const;
    const payload = JSON.stringify(payloadObj);
    const payloadB64 = base64url(payload);
    const sig = sign(payloadB64, secret);
    const token = `${payloadB64}.${sig}`;

    return NextResponse.json(
      createSuccessResponse({ token, text, expiresAt })
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to create captcha', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


