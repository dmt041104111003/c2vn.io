import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const revalidate = 300;

function getYoutubeIdFromUrl(url: string) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/#\s]{11})/);
  return match ? match[1] : '';
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const titleQuery = searchParams.get('title') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const tags = searchParams.getAll('tags');
  const exclude = searchParams.get('exclude');

  try {
    let where: any = {
      status: 'PUBLISHED' 
    };

    if (titleQuery) {
      where.title = {
        contains: titleQuery,
        mode: 'insensitive',
      };
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: tags
            }
          }
        }
      };
    }

    if (exclude) {
      where.NOT = {
        OR: [
          { id: exclude },
          { slug: exclude }
        ]
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          shares: true,
          createdAt: true,
          updatedAt: true,
          _count: { 
            select: { 
              comments_rel: true,
              postViews: true,
              reactions: true
            } as any 
          },
          author: { select: { name: true } },
          tags: { select: { tag: { select: { id: true, name: true } } } },
          media: { select: { url: true, type: true, id: true } },
        },
      }),
      prisma.post.count({ where })
    ]);

    const mapped = posts.map(post => {
      const excerpt = post.content 
        ? post.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + (post.content.length > 150 ? '...' : '')
        : '';

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        excerpt,
        shares: post.shares,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        comments: (post as any)._count?.comments_rel || 0,
        reactions: (post as any)._count?.reactions || 0,
        media: Array.isArray(post.media)
          ? post.media.map((m: { url: string; type: string; id: string }) =>
              m.type === 'YOUTUBE'
                ? { ...m, id: m.id && m.id.length === 11 ? m.id : getYoutubeIdFromUrl(m.url) }
                : m
            )
          : [],
        author: post.author?.name || 'Admin',
        tags: post.tags?.map((t: any) => t.tag) || [],
        totalViews: (post as any)._count?.postViews || 0,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return NextResponse.json(createSuccessResponse(mapped, pagination));
  } catch (error) {
    console.error('Error fetching public posts:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
