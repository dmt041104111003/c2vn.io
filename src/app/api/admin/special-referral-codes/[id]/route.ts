import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async (req) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
    }
    
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

export const PUT = withAdmin(async (req) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
    }
    
    const { name, email, isActive, expiresAt } = await req.json();
    
    const existingCode = await prisma.specialReferralCode.findUnique({
      where: { id }
    });
    
    if (!existingCode) {
      return NextResponse.json(createErrorResponse('Special referral code not found', 'NOT_FOUND'), { status: 404 });
    }
    
    const updatedCode = await prisma.specialReferralCode.update({
      where: { id },
      data: {
        name: name !== undefined ? (name.trim() || null) : existingCode.name,
        email: email !== undefined ? (email.trim() || null) : existingCode.email,
        isActive: isActive !== undefined ? isActive : existingCode.isActive,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existingCode.expiresAt
      }
    });
    
    return NextResponse.json(createSuccessResponse(updatedCode));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const DELETE = withAdmin(async (req) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
    }
    
    const existingCode = await prisma.specialReferralCode.findUnique({
      where: { id }
    });
    
    if (!existingCode) {
      return NextResponse.json(createErrorResponse('Special referral code not found', 'NOT_FOUND'), { status: 404 });
    }
    
    const submissionCount = await prisma.referralSubmission.count({
      where: { specialReferralCodeId: id }
    });
    
    await prisma.specialReferralCode.delete({
      where: { id }
    });
    
    const message = submissionCount > 0 
      ? `Special referral code deleted successfully. WARNING: This code had ${submissionCount} submission(s) which have also been deleted.`
      : 'Special referral code deleted successfully';
    
    return NextResponse.json(createSuccessResponse({ 
      message,
      warning: submissionCount > 0 ? `Deleted ${submissionCount} related submission(s)` : null
    }));
    
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});
