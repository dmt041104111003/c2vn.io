import { Metadata } from 'next';
import { headers } from 'next/headers';
import BlogDetailClient from '~/components/blog/BlogDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const hdrs = await headers();
  const forwardedHost = hdrs.get('x-forwarded-host') || hdrs.get('host');
  const forwardedProto = hdrs.get('x-forwarded-proto') || 'https';
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = envSiteUrl && /^https?:\/\//.test(envSiteUrl)
    ? envSiteUrl.replace(/\/$/, '')
    : `${forwardedProto}://${(forwardedHost || 'localhost:3000')}`;

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

  try {
    const headResp = await fetch(image, { method: 'HEAD', cache: 'no-store' });
    if (!headResp.ok) {
      image = `${origin}/images/og-image.png`;
    }
  } catch {
    image = `${origin}/images/og-image.png`;
  }

  return {
    metadataBase: new URL(origin),
    title: post?.title || 'Blog Detail | Cardano2vn',
    description: post?.excerpt || post?.content?.slice(0, 150) || '',
    alternates: {
      canonical: `${origin}/blog/${params.slug}`,
    },
    openGraph: {
      title: post?.title || 'Blog Detail | Cardano2vn',
      description: post?.excerpt || post?.content?.slice(0, 150) || '',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post?.title || 'Blog Detail | Cardano2vn',
        },
      ],
      url: `${origin}/blog/${params.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post?.title || 'Blog Detail | Cardano2vn',
      description: post?.excerpt || post?.content?.slice(0, 150) || '',
      images: [image],
    }
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <BlogDetailClient slug={params.slug} />;
} 