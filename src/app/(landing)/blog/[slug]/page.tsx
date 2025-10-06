import { Metadata } from 'next';
import { headers } from 'next/headers';
import BlogDetailClient from '~/components/blog/BlogDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const hdrs = await headers();
  const forwardedHost = hdrs.get('x-forwarded-host') || hdrs.get('host');
  const forwardedProto = hdrs.get('x-forwarded-proto') || 'https';
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const envHost = envSiteUrl ? envSiteUrl.replace(/^https?:\/\//, '') : undefined;
  const host = forwardedHost || envHost || 'localhost:3000';
  const origin = `${forwardedProto}://${host}`;

  const res = await fetch(`${origin}/api/admin/posts/${params.slug}?public=1`, { cache: 'no-store' });
  const data = await res.json();
  const post = data.data;

  const image = post?.media?.[0]?.url
    ? (post.media[0].url.startsWith('http') ? post.media[0].url : `${origin}${post.media[0].url}`)
    : `${origin}/images/common/loading.png`;

  return {
    metadataBase: new URL(origin),
    title: post?.title || 'Blog Detail | Cardano2vn',
    description: post?.excerpt || post?.content?.slice(0, 150) || '',
    openGraph: {
      title: post?.title || 'Blog Detail | Cardano2vn',
      description: post?.excerpt || post?.content?.slice(0, 150) || '',
      images: [image],
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