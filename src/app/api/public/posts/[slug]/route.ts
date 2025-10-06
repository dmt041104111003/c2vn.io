import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export async function GET(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const params = await context.params;
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        media: { select: { url: true, type: true, id: true } },
        tags: { select: { tag: { select: { id: true, name: true } } } },
        author: { select: { name: true } },
      }
    });

    if (!post || post.status !== 'PUBLISHED') {
      return NextResponse.json(createErrorResponse('Post not found', 'POST_NOT_FOUND'), { status: 404 });
    }

    const excerpt = post.content
      ? post.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + (post.content.length > 150 ? '...' : '')
      : '';

    const data = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      media: Array.isArray(post.media) ? post.media : [],
      tags: post.tags?.map((t: any) => t.tag) || [],
      author: post.author?.name || 'Admin',
    };

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}


