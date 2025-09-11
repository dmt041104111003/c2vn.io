import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = async () => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });
    return NextResponse.json(createSuccessResponse(tags));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


