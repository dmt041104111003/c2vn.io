import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';
import { findUserByReferralCode, validateReferralCode } from '~/lib/referral-utils';
import { generateDeviceFingerprint, extractDeviceInfoFromRequest } from '~/lib/device-fingerprint';

export const POST = withAuth(async (req, currentUser) => {
  try {
    if (!currentUser) {
      return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
    }

    const { referralCode, formData, deviceData } = await req.json();

    if (!referralCode || !validateReferralCode(referralCode)) {
      return NextResponse.json(createErrorResponse('Invalid referral code format', 'INVALID_REFERRAL_CODE'), { status: 400 });
    }

    let deviceFingerprint = null;
    if (deviceData) {
      const userAgent = req.headers.get('user-agent') || '';
      const serverDeviceInfo = extractDeviceInfoFromRequest(req);
      const combinedDeviceData = { ...serverDeviceInfo, ...deviceData };
      deviceFingerprint = generateDeviceFingerprint(userAgent, combinedDeviceData);

    }

    const existingSubmission = await prisma.referralSubmission.findUnique({
      where: { userId: currentUser.id }
    });

    if (existingSubmission) {
      return NextResponse.json(createErrorResponse('You have already submitted a referral form', 'ALREADY_SUBMITTED'), { status: 400 });
    }

    const referrer = await findUserByReferralCode(referralCode);

    if (!referrer) {
      return NextResponse.json(createErrorResponse('Referral code not found', 'REFERRAL_CODE_NOT_FOUND'), { status: 404 });
    }

    if (referrer.id === currentUser.id) {
      return NextResponse.json(createErrorResponse('You cannot use your own referral code', 'CANNOT_USE_OWN_CODE'), { status: 400 });
    }


    const submission = await prisma.referralSubmission.create({
      data: {
        userId: currentUser.id,
        referralCode: referralCode,
        referrerId: referrer.id,
        email: formData['your-email'] || '',
        name: formData['your-name'] || '',
        phone: formData['your-number'] || null,
        wallet: formData['address-wallet'] || null,
        course: formData['your-course'] || null,
        message: formData['message'] || null,
        deviceFingerprint: deviceFingerprint,
      }
    });

    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        referralCount: {
          increment: 1
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: referrer.id,
        type: 'referral',
        title: 'New Referral!',
        message: `${formData['your-name'] || 'Someone'} used your referral code`,
        data: {
          submissionId: submission.id,
          referrerName: formData['your-name'],
          referralCode: referralCode
        }
      }
    });

    return NextResponse.json(createSuccessResponse({
      message: 'Referral submission successful',
      submission: {
        id: submission.id,
        referralCode: submission.referralCode,
        referrerName: referrer.name
      }
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
