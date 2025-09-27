'use client'

import Head from 'next/head'
import { generateStructuredData, generateBreadcrumbStructuredData, generateFAQStructuredData } from '~/lib/seo'

interface SEOProviderProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  breadcrumbs?: Array<{ name: string; url: string }>
  faqs?: Array<{ question: string; answer: string }>
  noindex?: boolean
  nofollow?: boolean
}

export default function SEOProvider({
  title,
  description,
  keywords = [],
  image = '/images/og-image.png',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Cardano2VN Team',
  section,
  tags = [],
  breadcrumbs,
  faqs,
  noindex = false,
  nofollow = false,
}: SEOProviderProps) {
  const fullTitle = title?.includes('Cardano2VN') ? title : `${title} | Cardano2VN`
  const fullUrl = url?.startsWith('http') ? url : `https://cardano2vn.io${url || ''}`
  const imageUrl = image.startsWith('http') ? image : `https://cardano2vn.io${image}`

  const structuredData = generateStructuredData({
    title,
    description,
    url,
    type,
    publishedTime,
    modifiedTime,
    author,
  })

  const breadcrumbData = breadcrumbs ? generateBreadcrumbStructuredData(breadcrumbs) : null
  const faqData = faqs ? generateFAQStructuredData(faqs) : null

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {tags.length > 0 && <meta name="tags" content={tags.join(', ')} />}
      
      {url && <link rel="canonical" href={fullUrl} />}
      
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
      
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      <meta name="googlebot" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="msapplication-TileColor" content="#0033cc" />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />
      )}
      
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqData),
          }}
        />
      )}
    </Head>
  )
}
