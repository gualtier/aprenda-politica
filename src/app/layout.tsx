import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { RegisterSW } from '@/components/pwa/RegisterSW'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SITE = 'Aprenda Política'

export const metadata: Metadata = {
  applicationName: SITE,
  title: SITE,
  description: 'Entenda quem governa o Brasil. Dados reais. Linguagem simples.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: SITE,
    statusBarStyle: 'default',
    startupImage: [{ url: '/logos/splash.png' }],
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#00A859',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Navbar />
        {children}
        <Footer />
        <RegisterSW />
        <InstallPrompt />
      </body>
    </html>
  )
}
