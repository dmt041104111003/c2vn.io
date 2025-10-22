import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { prisma } from '~/lib/prisma';

export const POST = async (req: Request) => {
  try {
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL_1 ;
    if (!scriptUrl) {
      return NextResponse.json(
        createErrorResponse('Google Script URL not configured', 'CONFIG_ERROR'),
        { status: 500 }
      );
    }

    const body = await req.json();
    const { formData, captchaText, captchaAnswer, deviceData } = body || {};
    
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(createErrorResponse('Missing formData', 'BAD_REQUEST'), { status: 400 });
    }

    if (!deviceData) {
      return NextResponse.json(createErrorResponse('Device data is required', 'MISSING_DEVICE_DATA'), { status: 400 });
    }
    const deviceFingerprint = await generateDeviceFingerprint(deviceData.userAgent, deviceData);
    
    let attempt = await prisma.deviceAttempt.findUnique({ where: { deviceFingerprint } });
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    if (!attempt) {
      attempt = await prisma.deviceAttempt.create({ data: { deviceFingerprint, failedAttempts: 0, lastAttemptAt: now } });
    }
    
    // Reset attempts if last attempt was more than 15 minutes ago
    if (!attempt.lastAttemptAt || attempt.lastAttemptAt < fifteenMinutesAgo) {
      attempt = await prisma.deviceAttempt.update({ 
        where: { id: attempt.id }, 
        data: { 
          failedAttempts: 0, 
          lastAttemptAt: now, 
          isBanned: false, 
          bannedAt: null, 
          bannedUntil: null 
        } 
      });
    }
    if (attempt.isBanned && attempt.bannedUntil && attempt.bannedUntil > new Date()) {
      return NextResponse.json(createErrorResponse('This device is temporarily banned', 'DEVICE_BANNED'), { status: 403 });
    }
  const fullName = (formData?.["your-name"] || "").trim();
  if (!fullName) {
    return NextResponse.json(createErrorResponse('Full name is required', 'INVALID_NAME'), { status: 400 });
  }

  const email = (formData?.["your-email"] || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(createErrorResponse('Valid email is required', 'INVALID_EMAIL'), { status: 400 });
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

    // Count this successful submission; ban if now >= 5 in 15 minutes
    const updated = await prisma.deviceAttempt.update({
      where: { id: attempt.id },
      data: { failedAttempts: { increment: 1 }, lastAttemptAt: now }
    });
    if (updated.failedAttempts >= 5) {
      await prisma.deviceAttempt.update({
        where: { id: updated.id },
        data: { isBanned: true, bannedAt: new Date(), bannedUntil: new Date(Date.now() + 15 * 60 * 1000) }
      });
    }

    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to submit contact', 'INTERNAL_ERROR'), { status: 500 });
  }
};


