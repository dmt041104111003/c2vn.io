import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

function base64urlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) input += '='.repeat(4 - pad);
  return Buffer.from(input, 'base64').toString('utf8');
}

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

export const POST = async (req: Request) => {
  try {
    const secret = process.env.CAPTCHA_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        createErrorResponse('Captcha secret not configured', 'CONFIG_ERROR'),
        { status: 500 }
      );
    }

    const { token, answer } = await req.json();
    if (!token || typeof token !== 'string' || typeof answer !== 'string') {
      return NextResponse.json(
        createErrorResponse('Missing token or answer', 'BAD_REQUEST'),
        { status: 400 }
      );
    }

    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) {
      return NextResponse.json(createErrorResponse('Invalid token', 'INVALID_TOKEN'), { status: 400 });
    }
    const expected = sign(payloadB64, secret);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return NextResponse.json(createErrorResponse('Invalid signature', 'INVALID_TOKEN'), { status: 400 });
    }
    const payloadStr = base64urlDecode(payloadB64);
    const payload = JSON.parse(payloadStr) as { t: string; exp: number };
    if (Date.now() > payload.exp) {
      return NextResponse.json(createErrorResponse('Captcha expired', 'EXPIRED'), { status: 400 });
    }
    if (answer.toUpperCase() !== payload.t) {
      return NextResponse.json(createErrorResponse('Wrong answer', 'WRONG'), { status: 400 });
    }

    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to verify captcha', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


