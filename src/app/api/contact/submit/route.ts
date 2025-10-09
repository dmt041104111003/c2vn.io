import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import crypto from 'crypto';

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
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL_1;
    if (!secret || !scriptUrl) {
      return NextResponse.json(
        createErrorResponse('Server config missing', 'CONFIG_ERROR'),
        { status: 500 }
      );
    }

    const body = await req.json();
    const { formData, captchaToken, captchaAnswer } = body || {};
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(createErrorResponse('Missing formData', 'BAD_REQUEST'), { status: 400 });
    }
    if (!captchaToken || typeof captchaAnswer !== 'string') {
      return NextResponse.json(createErrorResponse('Missing captcha', 'BAD_REQUEST'), { status: 400 });
    }

    const [payloadB64, sig] = String(captchaToken).split('.');
    if (!payloadB64 || !sig) {
      return NextResponse.json(createErrorResponse('Invalid token', 'INVALID_TOKEN'), { status: 400 });
    }
    const expected = sign(payloadB64, secret);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return NextResponse.json(createErrorResponse('Invalid token signature', 'INVALID_TOKEN'), { status: 400 });
    }
    const payloadStr = base64urlDecode(payloadB64);
    const payload = JSON.parse(payloadStr) as { t: string; exp: number };
    if (Date.now() > payload.exp) {
      return NextResponse.json(createErrorResponse('Captcha expired', 'EXPIRED'), { status: 400 });
    }
    if (String(captchaAnswer).toUpperCase() !== payload.t) {
      return NextResponse.json(createErrorResponse('Wrong captcha', 'WRONG'), { status: 400 });
    }

    const fd = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      fd.append(key, String(value ?? ''));
    }

    const upstream = await fetch(scriptUrl, { method: 'POST', body: fd });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json(createErrorResponse(`Upstream error: ${text || upstream.statusText}`, 'UPSTREAM_ERROR'), { status: 502 });
    }

    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to submit contact', 'INTERNAL_ERROR'), { status: 500 });
  }
};


