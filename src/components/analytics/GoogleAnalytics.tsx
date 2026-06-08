import Script from 'next/script'

/**
 * Google Analytics 4. Ativa só quando NEXT_PUBLIC_GA_ID está definido
 * (ex.: G-XXXXXXXXXX). Sem o ID, não renderiza nada.
 */
// Measurement ID é público (vai no HTML); env override opcional.
const DEFAULT_GA_ID = 'G-KKWJH951PZ'

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID
  if (!gaId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  )
}
