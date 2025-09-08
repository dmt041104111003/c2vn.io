import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAuth(async (req, currentUser) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        referralCode: true,
        referralCount: true
      } as any
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
    }

    const referrals = await (prisma as any).referralSubmission.findMany({
      where: { referrerId: currentUser.id },
      select: {
        id: true,
        userId: true,
        referralCode: true,
        email: true,
        name: true,
        phone: true,
        wallet: true,
        course: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true,
            provider: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(createSuccessResponse({
      user,
      referrals,
      totalReferrals: referrals.length
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
