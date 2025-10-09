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
      deviceFingerprint = generateDeviceFingerprint(deviceData.userAgent, deviceData);
    }

    const existingSubmission = await prisma.referralSubmission.findUnique({
      where: { userId: currentUser.id }
    });

    if (existingSubmission) {
      return NextResponse.json(createErrorResponse('You have already submitted a referral form', 'ALREADY_SUBMITTED'), { status: 400 });
    }

    if (deviceFingerprint) {
      const existingDeviceUsage = await prisma.$queryRaw`
        SELECT id FROM "ReferralSubmission" 
        WHERE "deviceFingerprint" = ${deviceFingerprint}
        LIMIT 1
      `;

      if (Array.isArray(existingDeviceUsage) && existingDeviceUsage.length > 0) {
        return NextResponse.json(createErrorResponse('This device has already used a referral code', 'DEVICE_ALREADY_USED'), { status: 409 });
      }
    }

    const referrer = await findUserByReferralCode(referralCode);

    if (!referrer) {
      return NextResponse.json(createErrorResponse('Referral code not found', 'REFERRAL_CODE_NOT_FOUND'), { status: 404 });
    }

    if (referrer.id === currentUser.id) {
      return NextResponse.json(createErrorResponse('You cannot use your own referral code', 'CANNOT_USE_OWN_CODE'), { status: 400 });
    }


    const submission = await prisma.$queryRaw`
      INSERT INTO "ReferralSubmission" (
        "id", "userId", "referralCode", "referrerId", "email", "name", 
        "phone", "wallet", "course", "message", "deviceFingerprint", 
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${currentUser.id}, ${referralCode}, ${referrer.id}, 
        ${formData['your-email'] || ''}, ${formData['your-name'] || ''}, 
        ${formData['your-number'] || null}, ${formData['address-wallet'] || null}, 
        ${formData['your-course'] || null}, ${formData['message'] || null}, 
        ${deviceFingerprint}, NOW(), NOW()
      ) RETURNING *
    `;


    const submissionData = Array.isArray(submission) ? submission[0] : submission;

    await prisma.notification.create({
      data: {
        userId: referrer.id,
        type: 'referral',
        title: 'New Referral!',
        message: `${formData['your-name'] || 'Someone'} used your referral code`,
        data: {
          submissionId: submissionData.id,
          referrerName: formData['your-name'],
          referralCode: referralCode
        }
      }
    });

    return NextResponse.json(createSuccessResponse({
      message: 'Referral submission successful',
      submission: {
        id: submissionData.id,
        referralCode: submissionData.referralCode,
        referrerName: referrer.name
      }
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
