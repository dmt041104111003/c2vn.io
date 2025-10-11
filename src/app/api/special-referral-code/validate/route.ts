import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const POST = async (req: Request) => {
  try {
    const { code } = await req.json();
    
    if (!code) {
      return NextResponse.json(createErrorResponse('Referral code is required', 'MISSING_CODE'), { status: 400 });
    }
    
    if (code.startsWith('C2VN') && code.length === 9) {
      const specialCode = await prisma.specialReferralCode.findUnique({
        where: { code }
      });
      
      if (!specialCode) {
        return NextResponse.json(createErrorResponse('Special referral code not found', 'CODE_NOT_FOUND'), { status: 404 });
      }
      
      if (!specialCode.isActive) {
        return NextResponse.json(createErrorResponse('Special referral code is inactive', 'CODE_INACTIVE'), { status: 400 });
      }
      
      if (specialCode.expiresAt && new Date() > specialCode.expiresAt) {
        return NextResponse.json(createErrorResponse('Special referral code has expired', 'CODE_EXPIRED'), { status: 400 });
      }
      
      return NextResponse.json(createSuccessResponse({
        isValid: true,
        isSpecial: true,
        code: specialCode.code,
        expiresAt: specialCode.expiresAt
      }));
    }
    
    const user = await prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        name: true,
        referralCode: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json(createErrorResponse('Referral code not found', 'CODE_NOT_FOUND'), { status: 404 });
    }
    
    return NextResponse.json(createSuccessResponse({
      isValid: true,
      isSpecial: false,
      code: user.referralCode,
      user: {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt
      }
    }));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
};
