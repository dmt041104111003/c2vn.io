import { prisma } from './prisma';
export function generateReferralCode(userId: string): string {
  const last7Chars = userId.slice(-7);
  return `C2VN${last7Chars}`;
}

export async function createUniqueReferralCode(userId: string): Promise<string> {
  let referralCode = generateReferralCode(userId);
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await prisma.user.findUnique({
      where: { referralCode }
    });

    if (!existing) {
      return referralCode;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    referralCode = `C2VN${userId.slice(-4)}${randomSuffix}`;
    attempts++;
  }

  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `C2VN${randomSuffix}`;
}


export async function getUserReferralCode(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.referralCode;
}

export async function findUserByReferralCode(referralCode: string) {
  return await prisma.user.findUnique({
    where: { referralCode },
    select: {
      id: true,
      name: true,
      email: true,
      wallet: true,
      referralCode: true,
      createdAt: true
    }
  });
}

export function validateReferralCode(referralCode: string): boolean {
  const userPattern = /^C2VN[A-Za-z0-9]{4,}$/;
  const specialPattern = /^CARDANO2VN[A-Za-z0-9]{5}$/;
  return userPattern.test(referralCode) || specialPattern.test(referralCode);
}
