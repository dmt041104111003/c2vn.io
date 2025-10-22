import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAuth(async (req, currentUser) => {
  try {
    if (!currentUser) {
      return NextResponse.json(createErrorResponse('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }
    const url = new URL(req.url);
    const includeStats = url.searchParams.get('includeStats') === 'true';
    const limit = url.searchParams.get('limit');

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        referralCode: true
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
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit) })
    });

    // Only count regular referrals, exclude special referral codes
    const referralCount = await (prisma as any).referralSubmission.count({
      where: { 
        referrerId: currentUser.id,
        specialReferralCodeId: null  // Exclude special referral codes
      }
    });

    const response: any = {
      user,
      referrals,
      totalReferrals: referrals.length,
      referralCount
    };

    if (includeStats) {
      response.referralCode = user.referralCode;
      response.recentReferrals = referrals.slice(0, 10);
    }

    return NextResponse.json(createSuccessResponse(response));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
