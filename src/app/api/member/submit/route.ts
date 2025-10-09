import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

export const POST = async (req: Request) => {
  try {
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL_2;
    if (!scriptUrl) {
      return NextResponse.json(
        createErrorResponse('Google Script URL not configured', 'CONFIG_ERROR'),
        { status: 500 }
      );
    }

    const body = await req.json();
    const { formData, captchaText, captchaAnswer } = body || {};
    
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(createErrorResponse('Missing formData', 'BAD_REQUEST'), { status: 400 });
    }
    
    if (!captchaText || !captchaAnswer) {
      return NextResponse.json(createErrorResponse('Missing captcha', 'BAD_REQUEST'), { status: 400 });
    }

    if (captchaAnswer.toUpperCase() !== captchaText.toUpperCase()) {
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
