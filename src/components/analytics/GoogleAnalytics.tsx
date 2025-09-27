'use client'

import Script from 'next/script'
import { useEffect } from 'react'

interface GoogleAnalyticsProps {
  gaId: string
  gtmId?: string
}

export default function GoogleAnalytics({ gaId, gtmId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && gaId) {
      window.gtag = window.gtag || function() {
        (window.gtag as any).q = (window.gtag as any).q || []
        ;(window.gtag as any).q.push(arguments)
      }
      
      window.gtag('js', new Date())
      window.gtag('config', gaId, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [gaId])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      {gtmId && (
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}
    </>
  )
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
