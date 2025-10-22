import { prisma } from '~/lib/prisma';

export interface DeviceAttemptResult {
  isBanned: boolean;
  shouldBan: boolean;
  failedAttempts: number;
  bannedUntil?: Date;
}

export async function trackFailedAttempt(deviceFingerprint: string): Promise<DeviceAttemptResult> {
  try {
    let deviceAttempt = await prisma.deviceAttempt.findUnique({
      where: { deviceFingerprint }
    });

    if (!deviceAttempt) {
      deviceAttempt = await prisma.deviceAttempt.create({
        data: {
          deviceFingerprint,
          failedAttempts: 1,
          lastAttemptAt: new Date()
        }
      });
    } else {
      if (deviceAttempt.isBanned && deviceAttempt.bannedUntil && deviceAttempt.bannedUntil < new Date()) {
        deviceAttempt = await prisma.deviceAttempt.update({
          where: { id: deviceAttempt.id },
          data: {
            isBanned: false,
            bannedAt: null,
            bannedUntil: null,
            failedAttempts: 1,
            lastAttemptAt: new Date()
          }
        });
      } else if (deviceAttempt.isBanned) {
        return {
          isBanned: true,
          shouldBan: false,
          failedAttempts: deviceAttempt.failedAttempts,
          bannedUntil: deviceAttempt.bannedUntil || undefined
        };
      } else {
        const newFailedAttempts = deviceAttempt.failedAttempts + 1;
        const shouldBan = newFailedAttempts >= 5;
        
        
        const bannedUntil = shouldBan ? new Date(Date.now() + 15 * 60 * 1000) : null; 
        
        deviceAttempt = await prisma.deviceAttempt.update({
          where: { id: deviceAttempt.id },
          data: {
            failedAttempts: newFailedAttempts,
            lastAttemptAt: new Date(),
            isBanned: shouldBan,
            bannedAt: shouldBan ? new Date() : null,
            bannedUntil
          }
        });

        return {
          isBanned: shouldBan,
          shouldBan,
          failedAttempts: newFailedAttempts,
          bannedUntil: bannedUntil || undefined
        };
      }
    }

    return {
      isBanned: false,
      shouldBan: false,
      failedAttempts: deviceAttempt.failedAttempts
    };

  } catch (error) {
    return {
      isBanned: false,
      shouldBan: false,
      failedAttempts: 0
    };
  }
}

const bannedCache = new Map<string, { isBanned: boolean; timestamp: number }>();
const BANNED_CACHE_DURATION = 2 * 60 * 1000; 

export async function isDeviceBanned(deviceFingerprint: string): Promise<boolean> {
  try {
    const cached = bannedCache.get(deviceFingerprint);
    if (cached && Date.now() - cached.timestamp < BANNED_CACHE_DURATION) {
      return cached.isBanned;
    }

    const deviceAttempt = await prisma.deviceAttempt.findUnique({
      where: { deviceFingerprint }
    });

    if (!deviceAttempt) {
      bannedCache.set(deviceFingerprint, { isBanned: false, timestamp: Date.now() });
      return false;
    }

    const now = new Date();
    let isBanned = deviceAttempt.isBanned;

    if (deviceAttempt.isBanned && deviceAttempt.bannedUntil && deviceAttempt.bannedUntil < now) {
      await prisma.deviceAttempt.update({
        where: { id: deviceAttempt.id },
        data: {
          isBanned: false,
          bannedAt: null,
          bannedUntil: null
        }
      });
      isBanned = false;
    }

    bannedCache.set(deviceFingerprint, { isBanned, timestamp: Date.now() });
    
    if (bannedCache.size > 50) {
      const cacheNow = Date.now();
      for (const [k, v] of bannedCache.entries()) {
        if (cacheNow - v.timestamp > BANNED_CACHE_DURATION) {
          bannedCache.delete(k);
        }
      }
    }

    return isBanned;
  } catch (error) {
    return false;
  }
}


export async function getDeviceAttemptDetails(deviceFingerprint: string) {
  try {
    const deviceAttempt = await prisma.deviceAttempt.findUnique({
      where: { deviceFingerprint }
    });

    if (!deviceAttempt) {
      return null;
    }

    if (deviceAttempt.isBanned && deviceAttempt.bannedUntil && deviceAttempt.bannedUntil < new Date()) {
      const updatedAttempt = await prisma.deviceAttempt.update({
        where: { id: deviceAttempt.id },
        data: {
          isBanned: false,
          bannedAt: null,
          bannedUntil: null
        }
      });
      return updatedAttempt;
    }

    return deviceAttempt;
  } catch (error) {
    return null;
  }
}


export async function resetDeviceAttempts(deviceFingerprint: string): Promise<boolean> {
  try {
    await prisma.deviceAttempt.update({
      where: { deviceFingerprint },
      data: {
        failedAttempts: 0,
        isBanned: false,
        bannedAt: null,
        bannedUntil: null,
        lastAttemptAt: new Date()
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}
