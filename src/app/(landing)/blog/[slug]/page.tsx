import { Metadata } from 'next';
import BlogDetailClient from '~/components/blog/BlogDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://website-sigma-ebon-96.vercel.app';
  const origin = envSiteUrl.replace(/\/$/, '');

  let post: any = null;
  try {
    const res = await fetch(`/api/admin/posts/${params.slug}?public=1`, { cache: 'no-store', next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      post = data?.data ?? null;
    }
  } catch {
  }

  let image = post?.media?.[0]?.url
    ? (post.media[0].url.startsWith('http') ? post.media[0].url : `${origin}${post.media[0].url}`)
    : `${origin}/images/common/loading.png`;


  const fallbackTitle = decodeURIComponent(params.slug)
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
  const fallbackDescription = 'Read this article on Cardano2vn.';

  return {
    metadataBase: new URL(origin),
    title: post?.title || fallbackTitle || 'Blog Detail | Cardano2vn',
    description: post?.excerpt || post?.content?.slice(0, 150) || fallbackDescription,
    alternates: {
      canonical: `${origin}/blog/${params.slug}`,
    },
    openGraph: {
      title: post?.title || fallbackTitle || 'Blog Detail | Cardano2vn',
      description: post?.excerpt || post?.content?.slice(0, 150) || fallbackDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post?.title || fallbackTitle || 'Blog Detail | Cardano2vn',
        },
      ],
      url: `${origin}/blog/${params.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post?.title || fallbackTitle || 'Blog Detail | Cardano2vn',
      description: post?.excerpt || post?.content?.slice(0, 150) || fallbackDescription,
      images: [image],
    }
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <BlogDetailClient slug={params.slug} />;
} 