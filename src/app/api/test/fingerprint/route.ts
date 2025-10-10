import { NextResponse } from 'next/server';
import { createSuccessResponse } from '~/lib/api-response';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';
import { prisma } from '~/lib/prisma';

export const POST = async (req: Request) => {
  try {
    const { deviceData, fingerprint: inputFingerprint } = await req.json();

    let fingerprint: string | undefined = inputFingerprint;
    if (!fingerprint && deviceData) {
      try {
        fingerprint = await generateDeviceFingerprint(deviceData);
      } catch (e) {
      }
    }

    if (!fingerprint) {
      return NextResponse.json(createSuccessResponse({
        error: 'Missing device data or fingerprint'
      }));
    }

    // Optional reverse lookup of existing device record
    const deviceRecord = await prisma.deviceAttempt.findUnique({
      where: { deviceFingerprint: fingerprint },
      include: { referralSubmissions: true },
    });

    return NextResponse.json(createSuccessResponse({
      timestamp: new Date().toISOString(),
      fingerprint,
      deviceData: deviceData ?? null,
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
            referralCount: deviceRecord.referralSubmissions.length,
          }
        : null,
    }));
    
  } catch (error) {
    return NextResponse.json(createSuccessResponse({
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
};
