import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async (req) => {
  try {
    const id = req.nextUrl.pathname.split('/').slice(-2, -1)[0];
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing ID',
        code: 'MISSING_ID'
      }, { status: 400 });
    }
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: any = {
      specialReferralCodeId: id
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [submissions, totalCount] = await Promise.all([
      prisma.referralSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.referralSubmission.count({ where })
    ]);

    return NextResponse.json(createSuccessResponse({ submissions, count: totalCount, pagination: { page, limit, totalPages: Math.ceil(totalCount / limit), totalCount } }));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
