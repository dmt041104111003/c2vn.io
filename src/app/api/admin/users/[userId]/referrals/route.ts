import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async (req, currentUser) => {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 2]; // Get userId from URL path

    if (!userId) {
      return NextResponse.json(createErrorResponse('User ID is required', 'MISSING_USER_ID'), { status: 400 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Get all referrals for this user
    const referrals = await (prisma as any).referralSubmission.findMany({
      where: { referrerId: userId },
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

    // Only count regular referrals, exclude special referral codes
    const referralCount = await (prisma as any).referralSubmission.count({
      where: { 
        referrerId: userId,
        specialReferralCodeId: null  // Exclude special referral codes
      }
    });

    return NextResponse.json(createSuccessResponse({
      user,
      referrals,
      totalReferrals: referrals.length,
      referralCount
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
