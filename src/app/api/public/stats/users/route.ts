import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const revalidate = 0;

export const GET = async () => {
  try {
    const total = await prisma.user.count();
    return NextResponse.json(createSuccessResponse({ total }));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch users count', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


