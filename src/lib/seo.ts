import { Metadata } from 'next'

interface SEOConfig {
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
}

const defaultConfig = {
  title: 'Cardano2VN - Blockchain Innovation Hub',
  description: 'Cardano2VN is a leading blockchain innovation hub in Vietnam, specializing in Cardano ecosystem development, smart contracts, and decentralized applications.',
  keywords: ['Cardano', 'blockchain', 'Vietnam', 'smart contracts', 'DeFi', 'cryptocurrency', 'ADA', 'web3'],
  image: '/images/og-image.png',
  url: 'https://cardano2vn.io',
  type: 'website' as const,
  author: 'Cardano2VN Team',
}

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title = defaultConfig.title,
    description = defaultConfig.description,
    keywords = defaultConfig.keywords,
    image = defaultConfig.image,
    url = defaultConfig.url,
    type = defaultConfig.type,
    publishedTime,
    modifiedTime,
    author = defaultConfig.author,
    section,
    tags = [],
  } = config

  const fullTitle = title.includes('Cardano2VN') ? title : `${title} | Cardano2VN`
  const fullUrl = url.startsWith('http') ? url : `https://cardano2vn.io${url}`
  const imageUrl = image.startsWith('http') ? image : `https://cardano2vn.io${image}`

  const metadata: Metadata = {
    title: {
      default: fullTitle,
      template: '%s | Cardano2VN',
    },
    description,
    keywords: [...keywords, ...tags],
    authors: [{ name: author }],
    creator: 'Cardano2VN',
    publisher: 'Cardano2VN',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://cardano2vn.io'),
    alternates: {
      canonical: fullUrl,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: 'Cardano2VN',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@cardano2vn',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID || '####',
    },
    other: {
      'theme-color': '#0033cc',
      'msapplication-TileColor': '#0033cc',
    },
  }

  return metadata
}

export function generateStructuredData(config: SEOConfig = {}) {
  const {
    title = defaultConfig.title,
    description = defaultConfig.description,
    url = defaultConfig.url,
    type = defaultConfig.type,
    publishedTime,
    modifiedTime,
    author = defaultConfig.author,
  } = config

  const fullUrl = url.startsWith('http') ? url : `https://cardano2vn.io${url}`

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cardano2VN',
    alternateName: 'Cardano2VN',
    url: 'https://cardano2vn.io',
    logo: 'https://cardano2vn.io/images/logo.png',
    description: 'Vietnam\'s premier blockchain innovation hub specializing in Cardano ecosystem development',
    foundingDate: '2020',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      addressRegion: 'Ho Chi Minh City',
    },
    sameAs: [
      'https://twitter.com/cardano2vn',
      'https://github.com/cardano2vn',
      'https://linkedin.com/company/cardano2vn',
    ],
  }

  if (type === 'article' && title && description) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      url: fullUrl,
      author: {
        '@type': 'Organization',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Cardano2VN',
        logo: {
          '@type': 'ImageObject',
          url: 'https://cardano2vn.io/images/logo.png',
        },
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
    }
  }

  if (type === 'website') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: title,
      description,
      url: fullUrl,
      publisher: baseStructuredData,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cardano2vn.io/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    }
  }

  return baseStructuredData
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://cardano2vn.io${item.url}`,
    })),
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
