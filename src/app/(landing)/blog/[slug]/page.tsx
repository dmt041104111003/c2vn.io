import { Metadata } from 'next';
import { prisma } from '~/lib/prisma';
import BlogDetailClient from '~/components/blog/BlogDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const origin = envSiteUrl.replace(/\/$/, '');

  let post: any = null;
  try {
    const dbPost = await prisma.post.findUnique({
      where: { slug },
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
      },
    });
    if (dbPost && dbPost.status === 'PUBLISHED') {
      const excerpt = dbPost.content
        ? dbPost.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + (dbPost.content.length > 150 ? '...' : '')
        : '';
      post = {
        id: dbPost.id,
        title: dbPost.title,
        slug: dbPost.slug,
        excerpt,
        createdAt: dbPost.createdAt,
        updatedAt: dbPost.updatedAt,
        media: Array.isArray(dbPost.media) ? dbPost.media : [],
        tags: dbPost.tags?.map((t: any) => t.tag) || [],
        author: dbPost.author?.name || 'Admin',
        content: dbPost.content,
      };
    }
  } catch (err) {
  }

  const fallbackTitle = decodeURIComponent(slug)
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
  const fallbackDescription = `${fallbackTitle} Cardano2vn.`;

  const getYoutubeIdFromUrl = (url: string): string => {
    const patterns = [
      /(?:v=|vi=)([A-Za-z0-9_-]{11})/,
      /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m && m[1]) return m[1];
    }
    return '';
  };

  const pickImageUrl = (): string => {
    const mediaList: any[] = Array.isArray(post?.media) ? post!.media : [];
    const candidate = mediaList.find((m) => {
      const url: string = m?.url || '';
      const type: string = (m?.type || '').toString().toUpperCase();
      const isYouTube = type === 'YOUTUBE' || /youtube|youtu\.be/.test(url);
      const looksLikeImage = /(\.png|\.jpe?g|\.webp|\.gif)(\?|$)/i.test(url);
      return !isYouTube && (looksLikeImage || type === 'IMAGE');
    });
    if (candidate?.url) {
      return candidate.url.startsWith('http') ? candidate.url : `${origin}${candidate.url}`;
    }
    const yt = mediaList.find((m) => {
      const url: string = m?.url || '';
      const type: string = (m?.type || '').toString().toUpperCase();
      return type === 'YOUTUBE' || /youtube|youtu\.be/.test(url);
    });
    if (yt) {
      const url: string = yt.url || '';
      const id = (yt.id && String(yt.id).length === 11) ? yt.id : getYoutubeIdFromUrl(url);
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (post?.media?.[0]?.url) {
      return post.media[0].url.startsWith('http') ? post.media[0].url : `${origin}${post.media[0].url}`;
    }
    return `${origin}/images/og-image.png`;
  };
  const image = pickImageUrl();

  const title = post?.title || fallbackTitle || 'Blog Detail | Cardano2vn';
  const description = post?.excerpt || post?.content?.slice(0, 150) || fallbackDescription;

  try {
    return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: {
      canonical: `${origin}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [
        { url: image, width: 1200, height: 630, alt: title },
        { url: `${origin}/images/og-image.png`, width: 1200, height: 630, alt: `${title} (fallback)` },
      ],
      url: `${origin}/blog/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    }
  };
  } catch {
    return {
      metadataBase: new URL(origin),
      title: fallbackTitle || 'Blog Detail | Cardano2vn',
      description: fallbackDescription,
      alternates: { canonical: `${origin}/blog/${slug}` },
      openGraph: {
        type: 'article',
        url: `${origin}/blog/${slug}`,
        title: fallbackTitle || 'Blog Detail | Cardano2vn',
        description: fallbackDescription,
        images: [{ url: `${origin}/images/og-image.png`, width: 1200, height: 630, alt: fallbackTitle || 'Blog Detail | Cardano2vn' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle || 'Blog Detail | Cardano2vn',
        description: fallbackDescription,
        images: [`${origin}/images/og-image.png`],
      },
    };
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}