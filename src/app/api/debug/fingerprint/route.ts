import { NextResponse } from 'next/server';
import { createSuccessResponse } from '~/lib/api-response';
import { prisma } from '~/lib/prisma';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';

export const POST = async (req: Request) => {
  try {
    const { deviceData, fingerprint } = await req.json();
    
    console.log('=== FINGERPRINT DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    if (deviceData) {
      console.log('Raw deviceData:', JSON.stringify(deviceData, null, 2));
    }
    
    const fields = [
      'userAgent',
      'language', 
      'platform',
      'screenResolution',
      'timezone',
      'cookieEnabled',
      'doNotTrack',
      'hardwareConcurrency',
      'maxTouchPoints',
      'colorDepth',
      'pixelRatio'
    ];
    
    const fieldValues: Record<string, any> = {};
    if (deviceData) {
      fields.forEach(field => {
        fieldValues[field] = deviceData[field];
        console.log(`${field}:`, deviceData[field]);
      });
    }
    
    // Reverse lookup logic by fingerprint (direct or computed from deviceData)
    let resolvedFingerprint: string | undefined = fingerprint;
    if (!resolvedFingerprint && deviceData) {
      try {
        resolvedFingerprint = await generateDeviceFingerprint(deviceData);
      } catch (e) {
        console.warn('Failed to compute fingerprint from deviceData:', e);
      }
    }
    
    let deviceRecord: any = null;
    let referralCount: number | null = null;
    if (resolvedFingerprint) {
      console.log('Lookup fingerprint:', resolvedFingerprint);
      deviceRecord = await prisma.deviceAttempt.findUnique({
        where: { deviceFingerprint: resolvedFingerprint },
        include: { referralSubmissions: true },
      });
      if (deviceRecord) {
        referralCount = deviceRecord.referralSubmissions.length;
      }
    }
    
    console.log('=== END DEBUG ===');
    
    return NextResponse.json(createSuccessResponse({
      timestamp: new Date().toISOString(),
      fieldValues,
      rawData: deviceData,
      fingerprint: resolvedFingerprint,
      deviceRecord: deviceRecord
        ? {
            id: deviceRecord.id,
            deviceFingerprint: deviceRecord.deviceFingerprint,
            failedAttempts: deviceRecord.failedAttempts,
            lastAttemptAt: deviceRecord.lastAttemptAt,
            isBanned: deviceRecord.isBanned,
            bannedUntil: deviceRecord.bannedUntil,
            createdAt: deviceRecord.createdAt,
            updatedAt: deviceRecord.updatedAt,
          }
        : null,
      referralCount,
    }));
    
  } catch (error) {
    return NextResponse.json(createSuccessResponse({
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
};
