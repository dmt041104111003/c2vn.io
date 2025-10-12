import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { prisma } from '~/lib/prisma';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { validateReferralCode } from '~/lib/referral-utils';
import { withOptionalAuth } from '~/lib/api-wrapper';

export const POST = withOptionalAuth(async (req, currentUser) => {
  try {
    const { referralCode, deviceData } = await req.json();

    if (!referralCode) {
      return NextResponse.json(createErrorResponse('Referral code is required', 'MISSING_REFERRAL_CODE'), { status: 400 });
    }

    const fingerprint = deviceData ? await generateDeviceFingerprint(deviceData.userAgent, deviceData) : undefined;

    if (referralCode.startsWith('CARDANO2VN') && referralCode.length === 15) {
      const specialCode = await prisma.specialReferralCode.findUnique({
        where: { code: referralCode }
      });
      
      if (!specialCode) {
        return NextResponse.json(createErrorResponse('Special referral code not found', 'REFERRAL_NOT_FOUND'), { status: 404 });
      }
      
      if (!specialCode.isActive) {
        return NextResponse.json(createErrorResponse('Special referral code is inactive', 'CODE_INACTIVE'), { status: 400 });
      }
      
      if (specialCode.expiresAt && new Date() > specialCode.expiresAt) {
        return NextResponse.json(createErrorResponse('Special referral code has expired', 'CODE_EXPIRED'), { status: 400 });
      }
      

      
      return NextResponse.json(createSuccessResponse({ 
        valid: true, 
        message: 'Special referral code is valid and can be used',
        isSpecial: true,
        code: specialCode.code,
        name: specialCode.name,
        email: specialCode.email,
        expiresAt: specialCode.expiresAt,
        fingerprint
      }));
    }

    if (!validateReferralCode(referralCode)) {
      return NextResponse.json(createErrorResponse('Invalid referral code format', 'INVALID_REFERRAL_CODE'), { status: 400 });
    }

    const referralUser = await prisma.user.findFirst({
      where: {
        referralCode: referralCode
      },
      select: {
        id: true,
        name: true,
        referralCode: true
      }
    });

    if (!referralUser) {
      return NextResponse.json(createErrorResponse('Referral code not found', 'REFERRAL_NOT_FOUND'), { status: 404 });
    }

    // Check if current user is trying to use their own referral code
    if (currentUser && currentUser.id === referralUser.id) {
      return NextResponse.json(createErrorResponse('You cannot use your own referral code', 'CANNOT_USE_OWN_CODE'), { status: 400 });
    }

    return NextResponse.json(createSuccessResponse({ 
      valid: true, 
      message: 'Referral code is valid and can be used',
      isSpecial: false,
      referrerName: referralUser.name,
      fingerprint
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to validate referral code', 'INTERNAL_ERROR'), { status: 500 });
  }
});
