import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';
import { getUserReferralCode, findUserByReferralCode, createUniqueReferralCode } from '~/lib/referral-utils';

export const GET = withAuth(async (req, currentUser) => {
  try {
    if (!currentUser) {
      return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
    }

    const referralCode = await getUserReferralCode(currentUser.id);

    return NextResponse.json(createSuccessResponse({
      referralCode,
      shareUrl: referralCode ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}#contact&code=${referralCode}` : null
    }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const POST = withAuth(async (req, currentUser) => {
  try {
    const { referralCode, action } = await req.json();
    if (action === 'generate') {
      if (!currentUser) {
        return NextResponse.json(createErrorResponse('User not found', 'USER_NOT_FOUND'), { status: 404 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { referralCode: true }
      });

      if (existingUser?.referralCode) {
        return NextResponse.json(createErrorResponse('You already have a referral code!', 'ALREADY_HAS_CODE'), { status: 400 });
      }

      const newReferralCode = await createUniqueReferralCode(currentUser.id);
      
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { referralCode: newReferralCode }
      });

      return NextResponse.json(createSuccessResponse({
        referralCode: newReferralCode,
        shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}#contact&code=${newReferralCode}`
      }));
    }

    if (!referralCode) {
      return NextResponse.json(createErrorResponse('Missing referral code', 'MISSING_REFERRAL_CODE'), { status: 400 });
    }

    const user = await findUserByReferralCode(referralCode);

    if (!user) {
      return NextResponse.json(createErrorResponse('Referral code not found', 'CODE_NOT_FOUND'), { status: 404 });
    }

    return NextResponse.json(createSuccessResponse({
      user: {
        id: user.id,
        name: user.name,
        referralCode: user.referralCode,
        createdAt: user.createdAt
      }
    }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
