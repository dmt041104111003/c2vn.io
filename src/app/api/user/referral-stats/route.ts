import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAuth(async (req, currentUser) => {
  try {
    if (!currentUser) {
      return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        referralCount: true,
        referralCode: true
      }
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
    }

    const recentReferrals = await prisma.referralSubmission.findMany({
      where: { referrerId: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        course: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json(createSuccessResponse({
      referralCount: user.referralCount,
      referralCode: user.referralCode,
      recentReferrals
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
