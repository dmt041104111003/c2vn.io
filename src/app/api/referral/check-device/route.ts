import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { prisma } from '~/lib/prisma';
import { generateDeviceFingerprint, extractDeviceInfoFromRequest } from '~/lib/device-fingerprint';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { referralCode, deviceData } = body || {};
    
    if (!referralCode || !deviceData) {
      return NextResponse.json(createErrorResponse('Missing referral code or device data', 'BAD_REQUEST'), { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const serverDeviceInfo = extractDeviceInfoFromRequest(req);
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    const combinedDeviceData = {
      ...serverDeviceInfo,
      ...deviceData
    };

    const fingerprint = generateDeviceFingerprint(userAgent, combinedDeviceData);

    const existingUsage = await prisma.referralDeviceUsage.findFirst({
      where: {
        deviceFingerprint: {
          fingerprint: fingerprint
        },
        referralCode: referralCode
      },
      include: {
        deviceFingerprint: true
      }
    });

    if (existingUsage) {
      return NextResponse.json(createErrorResponse('This device has already used this referral code', 'DEVICE_ALREADY_USED'), { status: 409 });
    }

    const referralUser = await prisma.user.findFirst({
      where: {
        referralCode: referralCode
      }
    });

    if (!referralUser) {
      return NextResponse.json(createErrorResponse('Referral code not found', 'REFERRAL_NOT_FOUND'), { status: 404 });
    }

    let deviceFingerprintRecord = await prisma.deviceFingerprint.findUnique({
      where: {
        fingerprint: fingerprint
      }
    });

    if (!deviceFingerprintRecord) {
      deviceFingerprintRecord = await prisma.deviceFingerprint.create({
        data: {
          fingerprint: fingerprint,
          userAgent: userAgent,
          language: combinedDeviceData.language,
          platform: combinedDeviceData.platform,
          screenResolution: combinedDeviceData.screenResolution,
          timezone: combinedDeviceData.timezone,
          cookieEnabled: combinedDeviceData.cookieEnabled,
          doNotTrack: combinedDeviceData.doNotTrack,
          hardwareConcurrency: combinedDeviceData.hardwareConcurrency,
          maxTouchPoints: combinedDeviceData.maxTouchPoints,
          colorDepth: combinedDeviceData.colorDepth,
          pixelRatio: combinedDeviceData.pixelRatio,
          canvasFingerprint: combinedDeviceData.canvasFingerprint
        }
      });
    }

    await prisma.referralDeviceUsage.create({
      data: {
        deviceFingerprintId: deviceFingerprintRecord.id,
        referralCode: referralCode,
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    });

    return NextResponse.json(createSuccessResponse({ 
      canUse: true, 
      fingerprint: fingerprint,
      message: 'Device can use this referral code'
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to check device usage', 'INTERNAL_ERROR'), { status: 500 });
  }
};
