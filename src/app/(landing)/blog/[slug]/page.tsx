import { Metadata } from 'next';
import BlogDetailClient from '~/components/blog/BlogDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://c2vn-io.vercel.app';
  const origin = envSiteUrl.replace(/\/$/, '');

  let post: any = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    let res = await fetch(`${origin}/api/public/posts/${params.slug}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    if (!res.ok) {
      res = await fetch(`${origin}/api/admin/posts/${params.slug}?public=1`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        signal: controller.signal,
      });
    }
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      post = data?.data ?? null;
    }
  } catch {}

  const fallbackTitle = decodeURIComponent(params.slug)
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
  const fallbackDescription = `Xem chi tiết bài viết ${fallbackTitle} trên Cardano2vn.`;

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