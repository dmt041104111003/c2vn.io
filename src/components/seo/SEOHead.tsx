"use client";

import Head from "next/head";
import { generateStructuredData } from "~/lib/seo";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEOHead({
  title = "Cardano2VN - Blockchain Innovation Hub",
  description = "Cardano2VN is a leading blockchain innovation hub in Vietnam, specializing in Cardano ecosystem development, smart contracts, and decentralized applications.",
  keywords = ["Cardano", "blockchain", "Vietnam", "smart contracts", "DeFi", "cryptocurrency", "ADA", "web3"],
  ogImage = "/images/og-image.png",
  ogUrl = "https://cardano2vn.io",
  canonical,
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Cardano2VN Team",
  section,
  tags = [],
  noindex = false,
  nofollow = false,
}: SEOHeadProps) {
  const fullTitle = title.includes("Cardano2VN") ? title : `${title} | Cardano2VN`;
  const fullUrl = canonical ? `${ogUrl}${canonical}` : ogUrl;
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${ogUrl}${ogImage}`;

  const structuredData = generateStructuredData({
    title,
    description,
    url: canonical,
    type,
    publishedTime,
    modifiedTime,
    author,
  });

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      {tags.length > 0 && <meta name="tags" content={tags.join(", ")} />}
      
      {canonical && <link rel="canonical" href={fullUrl} />}
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Cardano2VN" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {tags.length > 0 && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@cardano2vn" />
      <meta name="twitter:site" content="@cardano2vn" />
      
      <meta name="robots" content={`${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`} />
      <meta name="googlebot" content={`${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`} />
      
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="msapplication-TileColor" content="#0033cc" />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  );
}
