import { NextResponse } from 'next/server';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { trackFailedAttempt } from '~/lib/device-attempt-utils';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const POST = async (req: Request) => {
  try {
    const { deviceData } = await req.json();

    if (!deviceData) {
      return NextResponse.json(createErrorResponse('Device data is required', 'MISSING_DEVICE_DATA'), { status: 400 });
    }

    const deviceFingerprint = await generateDeviceFingerprint(deviceData.userAgent, deviceData);    
    const result = await trackFailedAttempt(deviceFingerprint);

    if (result.shouldBan) {
      return NextResponse.json(createErrorResponse('Device banned due to multiple failed attempts', 'DEVICE_BANNED'), { status: 403 });
    }

    return NextResponse.json(createSuccessResponse({
      message: 'Failed attempt tracked',
      failedAttempts: result.failedAttempts,
      isBanned: result.isBanned
    }));

  } catch (error) {
    console.error('Error tracking failed attempt:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
};
