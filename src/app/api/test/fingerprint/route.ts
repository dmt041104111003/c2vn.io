import { NextResponse } from 'next/server';
import { createSuccessResponse } from '~/lib/api-response';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';

export const POST = async (req: Request) => {
  try {
    const { deviceData } = await req.json();
    
    if (!deviceData) {
      return NextResponse.json(createSuccessResponse({
        error: 'Missing device data'
      }));
    }

    const fingerprint = await generateDeviceFingerprint(deviceData.userAgent, deviceData);
    
    return NextResponse.json(createSuccessResponse({
      timestamp: new Date().toISOString(),
      fingerprint: fingerprint,
      deviceData: deviceData
    }));
    
  } catch (error) {
    return NextResponse.json(createSuccessResponse({
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
};