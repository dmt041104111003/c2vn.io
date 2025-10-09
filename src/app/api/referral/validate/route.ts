import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { prisma } from '~/lib/prisma';
import { generateDeviceFingerprint, extractDeviceInfoFromRequest } from '~/lib/device-fingerprint';
import { validateReferralCode } from '~/lib/referral-utils';
import { trackFailedAttempt, isDeviceBanned } from '~/lib/device-attempt-utils';

export const POST = async (req: Request) => {
  try {
    const { referralCode, deviceData } = await req.json();

    if (!referralCode || !validateReferralCode(referralCode)) {
      return NextResponse.json(createErrorResponse('Invalid referral code format', 'INVALID_REFERRAL_CODE'), { status: 400 });
    }

    if (!deviceData) {
      return NextResponse.json(createErrorResponse('Device data is required', 'MISSING_DEVICE_DATA'), { status: 400 });
    }

    const fingerprint = generateDeviceFingerprint(deviceData.userAgent, deviceData);

    if (await isDeviceBanned(fingerprint)) {
      return NextResponse.json(createErrorResponse('This device has been temporarily banned due to multiple failed attempts', 'DEVICE_BANNED'), { status: 403 });
    }

    const existingDeviceUsage = await prisma.referralSubmission.findFirst({
      where: {
        deviceAttempt: {
          deviceFingerprint: fingerprint
        }
      }
    });

    if (existingDeviceUsage) {
      return NextResponse.json(createErrorResponse('This device has already used a referral code', 'DEVICE_ALREADY_USED'), { status: 409 });
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
      const attemptResult = await trackFailedAttempt(fingerprint);
      
      if (attemptResult.shouldBan) {
        return NextResponse.json(createErrorResponse('Device banned due to multiple failed attempts', 'DEVICE_BANNED'), { status: 403 });
      }

      return NextResponse.json(createErrorResponse('Referral code not found', 'REFERRAL_NOT_FOUND'), { status: 404 });
    }

    return NextResponse.json(createSuccessResponse({ 
      valid: true, 
      message: 'Referral code is valid and can be used',
      referrerName: referralUser.name,
      fingerprint: fingerprint 
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to validate referral code', 'INTERNAL_ERROR'), { status: 500 });
  }
};
