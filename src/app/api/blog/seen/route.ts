import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAuth, withOptionalAuth } from '~/lib/api-wrapper';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

export const POST = withAuth(async (req, user) => {
  try {
    const { postId: postIdOrSlug } = await req.json();
    if (!postIdOrSlug) {
      return NextResponse.json(createErrorResponse('Missing postId', 'MISSING_POST_ID'), { status: 400 });
    }
    const post = await (prisma as any).post.findFirst({
      where: {
        OR: [
          { id: postIdOrSlug },
          { slug: postIdOrSlug },
        ],
      },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json(createErrorResponse('Post not found', 'POST_NOT_FOUND'), { status: 404 });
    }
    await (prisma as any).postView.upsert({
      where: { userId_postId: { userId: user!.id, postId: post.id } },
      create: { userId: user!.id, postId: post.id },
      update: { viewedAt: new Date() },
    });
    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (e) {
    return NextResponse.json(createErrorResponse('Failed to mark seen', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const GET = withOptionalAuth(async (req, user) => {
  try {
    const postIdOrSlug = req.nextUrl.searchParams.get('postId');
    if (!postIdOrSlug) {
      return NextResponse.json(createErrorResponse('Missing postId', 'MISSING_POST_ID'), { status: 400 });
    }
    const post = await (prisma as any).post.findFirst({
      where: {
        OR: [
          { id: postIdOrSlug },
          { slug: postIdOrSlug },
        ],
      },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json(createErrorResponse('Post not found', 'POST_NOT_FOUND'), { status: 404 });
    }
    const [view, total] = await Promise.all([
      user ? (prisma as any).postView.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } } }) : Promise.resolve(null),
      (prisma as any).postView.count({ where: { postId: post.id } }),
    ]);
    return NextResponse.json(createSuccessResponse({ seen: !!view, totalViews: total }));
  } catch (e) {
    return NextResponse.json(createErrorResponse('Failed to get seen', 'INTERNAL_ERROR'), { status: 500 });
  }
});


