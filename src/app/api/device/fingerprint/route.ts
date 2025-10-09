import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';
import { generateDeviceFingerprint, extractDeviceInfoFromRequest } from '~/lib/device-fingerprint';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { deviceData } = body || {};
    
    if (!deviceData || typeof deviceData !== 'object') {
      return NextResponse.json(createErrorResponse('Missing device data', 'BAD_REQUEST'), { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const serverDeviceInfo = extractDeviceInfoFromRequest(req);
    
    const combinedDeviceData = {
      ...serverDeviceInfo,
      ...deviceData
    };

    const fingerprint = generateDeviceFingerprint(userAgent, combinedDeviceData);

    return NextResponse.json(createSuccessResponse({ fingerprint }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to generate fingerprint', 'INTERNAL_ERROR'), { status: 500 });
  }
};

export const GET = async (req: Request) => {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    const serverDeviceInfo = extractDeviceInfoFromRequest(req);
    
    const fingerprint = generateDeviceFingerprint(userAgent, serverDeviceInfo);

    return NextResponse.json(createSuccessResponse({ fingerprint }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to generate fingerprint', 'INTERNAL_ERROR'), { status: 500 });
  }
};
