import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth, withOptionalAuth } from '~/lib/api-wrapper';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

export const POST = withAuth(async (req, user) => {
  try {
    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json(createErrorResponse('Missing postId', 'MISSING_POST_ID'), { status: 400 });
    }
    await (prisma as any).postView.upsert({
      where: { userId_postId: { userId: user!.id, postId } },
      create: { userId: user!.id, postId },
      update: { viewedAt: new Date() },
    });
    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (e) {
    return NextResponse.json(createErrorResponse('Failed to mark seen', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const GET = withOptionalAuth(async (req, user) => {
  try {
    const postId = req.nextUrl.searchParams.get('postId');
    if (!postId) {
      return NextResponse.json(createErrorResponse('Missing postId', 'MISSING_POST_ID'), { status: 400 });
    }
    const [view, total] = await Promise.all([
      user ? (prisma as any).postView.findUnique({ where: { userId_postId: { userId: user.id, postId } } }) : Promise.resolve(null),
      (prisma as any).postView.count({ where: { postId } }),
    ]);
    return NextResponse.json(createSuccessResponse({ seen: !!view, totalViews: total }));
  } catch (e) {
    return NextResponse.json(createErrorResponse('Failed to get seen', 'INTERNAL_ERROR'), { status: 500 });
  }
});


