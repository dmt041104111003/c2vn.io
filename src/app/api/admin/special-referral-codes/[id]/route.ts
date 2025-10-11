import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async (req, currentUser, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    const specialCode = await prisma.specialReferralCode.findUnique({
      where: { id },
      include: {
        referralSubmissions: {
          select: {
            id: true,
            name: true,
            email: true,
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
                wallet: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!specialCode) {
      return NextResponse.json(createErrorResponse('Special referral code not found', 'NOT_FOUND'), { status: 404 });
    }
    
    return NextResponse.json(createSuccessResponse(specialCode));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const PUT = withAdmin(async (req, currentUser, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const { isActive, expiresAt } = await req.json();
    
    const existingCode = await prisma.specialReferralCode.findUnique({
      where: { id }
    });
    
    if (!existingCode) {
      return NextResponse.json(createErrorResponse('Special referral code not found', 'NOT_FOUND'), { status: 404 });
    }
    
    const updatedCode = await prisma.specialReferralCode.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : existingCode.isActive,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existingCode.expiresAt
      }
    });
    
    return NextResponse.json(createSuccessResponse(updatedCode));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const DELETE = withAdmin(async (req, currentUser, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    const existingCode = await prisma.specialReferralCode.findUnique({
      where: { id }
    });
    
    if (!existingCode) {
      return NextResponse.json(createErrorResponse('Special referral code not found', 'NOT_FOUND'), { status: 404 });
    }
    
    // Check if code has been used by counting submissions
    const submissionCount = await prisma.referralSubmission.count({
      where: { specialReferralCodeId: id }
    });
    
    if (submissionCount > 0) {
      return NextResponse.json(createErrorResponse('Cannot delete code that has been used', 'CODE_IN_USE'), { status: 400 });
    }
    
    await prisma.specialReferralCode.delete({
      where: { id }
    });
    
    return NextResponse.json(createSuccessResponse({ message: 'Special referral code deleted successfully' }));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
