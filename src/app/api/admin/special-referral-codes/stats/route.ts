import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async () => {
  try {
    const [
      totalCodes,
      activeCodes,
      inactiveCodes,
      totalSubmissions,
      codesWithSubmissions
    ] = await Promise.all([
      prisma.specialReferralCode.count(),
      prisma.specialReferralCode.count({ where: { isActive: true } }),
      prisma.specialReferralCode.count({ where: { isActive: false } }),
      prisma.referralSubmission.count({ where: { specialReferralCodeId: { not: null } } }),
      prisma.specialReferralCode.count({ 
        where: { 
          referralSubmissions: { some: {} } 
        } 
      })
    ]);

    const expiredCodes = await prisma.specialReferralCode.count({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    const stats = {
      totalCodes,
      activeCodes,
      inactiveCodes,
      expiredCodes,
      totalSubmissions,
      codesWithSubmissions,
      codesWithoutSubmissions: totalCodes - codesWithSubmissions
    };

    return NextResponse.json(createSuccessResponse(stats));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Failed to fetch stats', 'INTERNAL_ERROR'), { status: 500 });
  }
});