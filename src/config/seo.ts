export const seoConfig = {
  site: {
    name: 'Cardano2VN',
    fullName: 'Cardano2VN - Blockchain Innovation Hub',
    description: 'Vietnam\'s premier blockchain innovation hub specializing in Cardano ecosystem development, smart contracts, and DeFi solutions',
    url: 'https://cardano2vn.io',
    logo: '/images/logo.png',
    ogImage: '/images/og-image.png',
    twitterHandle: '@cardano2vn',
    author: 'Cardano2VN Team',
  },

  defaults: {
    title: 'Cardano2VN - Blockchain Innovation Hub',
    description: 'Cardano2VN is a leading blockchain innovation hub in Vietnam, specializing in Cardano ecosystem development, smart contracts, and decentralized applications.',
    keywords: [
      'Cardano',
      'blockchain',
      'Vietnam',
      'smart contracts',
      'DeFi',
      'cryptocurrency',
      'ADA',
      'web3',
      'blockchain development',
      'Cardano ecosystem',
      'Vietnam blockchain',
      'Cardano Vietnam',
      'blockchain innovation',
      'decentralized applications',
      'dApps',
      'Cardano development',
      'blockchain consulting',
      'crypto Vietnam',
    ],
    image: '/images/og-image.png',
    type: 'website' as const,
  },

  pages: {
    home: {
      title: 'Cardano2VN - Blockchain Innovation Hub',
      description: 'Leading blockchain innovation hub in Vietnam specializing in Cardano ecosystem development, smart contracts, and DeFi solutions.',
      keywords: ['Cardano Vietnam', 'blockchain hub', 'DeFi development', 'smart contracts Vietnam'],
    },
    about: {
      title: 'About Cardano2VN',
      description: 'Learn about Cardano2VN\'s mission to advance blockchain technology in Vietnam and the Cardano ecosystem.',
      keywords: ['about Cardano2VN', 'blockchain mission', 'Vietnam blockchain', 'Cardano community'],
    },
    services: {
      title: 'Blockchain Services',
      description: 'Comprehensive blockchain development services including smart contracts, dApps, and DeFi solutions.',
      keywords: ['blockchain services', 'smart contract development', 'dApp development', 'DeFi solutions'],
    },
    projects: {
      title: 'Blockchain Projects',
      description: 'Explore our portfolio of innovative blockchain projects and Cardano ecosystem contributions.',
      keywords: ['blockchain projects', 'Cardano projects', 'portfolio', 'blockchain solutions'],
    },
    blog: {
      title: 'Blockchain Blog',
      description: 'Latest insights on blockchain technology, Cardano ecosystem, and cryptocurrency trends.',
      keywords: ['blockchain blog', 'Cardano news', 'cryptocurrency insights', 'blockchain trends'],
    },
    docs: {
      title: 'Documentation',
      description: 'Comprehensive documentation for Cardano development, blockchain tutorials, and technical guides.',
      keywords: ['Cardano documentation', 'blockchain tutorials', 'development guides', 'technical resources'],
    },
  },

  social: {
    twitter: {
      handle: '@cardano2vn',
      site: '@cardano2vn',
    },
    linkedin: {
      company: 'cardano2vn',
    },
    github: {
      organization: 'cardano2vn',
    },
  },


  technical: {
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
    sitemap: {
      changefreq: {
        home: 'daily',
        pages: 'weekly',
        blog: 'weekly',
        docs: 'monthly',
      },
      priority: {
        home: 1.0,
        pages: 0.8,
        blog: 0.8,
        docs: 0.6,
      },
    },
  },

  structuredData: {
    organization: {
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
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Cardano2VN',
      url: 'https://cardano2vn.io',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cardano2vn.io/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  },

  performance: {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://res.cloudinary.com',
    ],
    dnsPrefetch: [
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
    ],
  },

  content: {
    maxTitleLength: 60,
    maxDescriptionLength: 160,
    maxKeywordsCount: 10,
    imageDimensions: {
      og: { width: 1200, height: 630 },
      twitter: { width: 1200, height: 630 },
      favicon: { width: 32, height: 32 },
    },
  },
}

export type SEOConfig = typeof seoConfig
export type PageSEO = typeof seoConfig.pages
export type SocialConfig = typeof seoConfig.social
