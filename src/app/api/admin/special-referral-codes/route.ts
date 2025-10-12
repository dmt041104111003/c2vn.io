import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

function generateSpecialReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CARDANO2VN';
  
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export const GET = withAdmin(async (req, currentUser) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const isActive = url.searchParams.get('isActive');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const [codes, total] = await Promise.all([
      prisma.specialReferralCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          referralSubmissions: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.specialReferralCode.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json(createSuccessResponse({
      codes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const POST = withAdmin(async (req, currentUser) => {
  try {
    const { expiresAt, name, email } = await req.json();
    
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      code = generateSpecialReferralCode();
      const existing = await prisma.specialReferralCode.findUnique({
        where: { code }
      });
      
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      return NextResponse.json(createErrorResponse('Failed to generate unique code', 'CODE_GENERATION_FAILED'), { status: 500 });
    }
    
    const specialCode = await prisma.specialReferralCode.create({
      data: {
        code,
        name: name || null,
        email: email || null,
        createdBy: currentUser.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    
    return NextResponse.json(createSuccessResponse(specialCode), { status: 201 });
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
