import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { prisma } from '~/lib/prisma';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { validateReferralCode } from '~/lib/referral-utils';

export const POST = async (req: Request) => {
  try {
    const { referralCode, deviceData } = await req.json();

    if (!referralCode || !validateReferralCode(referralCode)) {
      return NextResponse.json(createErrorResponse('Invalid referral code format', 'INVALID_REFERRAL_CODE'), { status: 400 });
    }


    const fingerprint = deviceData ? await generateDeviceFingerprint(deviceData.userAgent, deviceData) : undefined;

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

    return NextResponse.json(createSuccessResponse({ 
      valid: true, 
      message: 'Referral code is valid and can be used',
      referrerName: referralUser.name,
      fingerprint
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to validate referral code', 'INTERNAL_ERROR'), { status: 500 });
  }
};
