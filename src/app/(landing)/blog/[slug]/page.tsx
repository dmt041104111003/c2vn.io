import { Metadata } from 'next';
import { prisma } from '~/lib/prisma';
import BlogDetailClient from '~/components/blog/BlogDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const origin = envSiteUrl.replace(/\/$/, '');

  let post: any = null;
  try {
    const dbPost = await prisma.post.findUnique({
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

  const fallbackTitle = decodeURIComponent(params.slug)
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
  const fallbackDescription = `${fallbackTitle} Cardano2vn.`;

  const image = post?.media?.[0]?.url
    ? (post.media[0].url.startsWith('http') ? post.media[0].url : `${origin}${post.media[0].url}`)
    : `${origin}/images/og-image.png`;

  const title = post?.title || fallbackTitle || 'Blog Detail | Cardano2vn';
  const description = post?.excerpt || post?.content?.slice(0, 150) || fallbackDescription;

  try {
    return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: {
      canonical: `${origin}/blog/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      images: [
        { url: image, width: 1200, height: 630, alt: title },
      ],
      url: `${origin}/blog/${params.slug}`,
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
      alternates: { canonical: `${origin}/blog/${params.slug}` },
      openGraph: {
        type: 'article',
        url: `${origin}/blog/${params.slug}`,
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

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <BlogDetailClient slug={params.slug} />;
} 