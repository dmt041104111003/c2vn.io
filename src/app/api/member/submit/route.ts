import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { withAuth } from '~/lib/api-wrapper';
import { prisma } from '~/lib/prisma';

export const POST = withAuth(async (req: NextRequest, currentUser) => {
  try {
    if (!currentUser) {
      return NextResponse.json(
        createErrorResponse('You must be logged in to submit this form', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id }
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }

    if (!user.lastMemberContactDate || user.lastMemberContactDate < today) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          memberContactCount: 0,
          lastMemberContactDate: today
        }
      });
    }

    if (user.memberContactCount >= 5) {
      return NextResponse.json(
        createErrorResponse(
          'You have reached the daily limit of 5 submissions. Please try again tomorrow.',
          'DAILY_LIMIT_EXCEEDED'
        ),
        { status: 429 }
      );
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

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        memberContactCount: { increment: 1 },
        lastMemberContactDate: today
      }
    });

    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to submit contact', 'INTERNAL_ERROR'), { status: 500 });
  }
});
