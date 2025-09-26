import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    template: '%s | MicroSaaS',
    default: 'MicroSaaS Platform'
  },
  description: 'A modern MicroSaaS platform built with Next.js and AWS Amplify Gen 2',
  keywords: ['SaaS', 'Next.js', 'AWS Amplify', 'React', 'TypeScript'],
  authors: [{ name: 'MicroSaaS Team' }],
  creator: 'MicroSaaS',
  publisher: 'MicroSaaS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'MicroSaaS Platform',
    description: 'A modern MicroSaaS platform built with Next.js and AWS Amplify Gen 2',
    type: 'website',
    locale: 'en_US',
    siteName: 'MicroSaaS'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MicroSaaS Platform',
    description: 'A modern MicroSaaS platform built with Next.js and AWS Amplify Gen 2'
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <div id="root" className="relative flex min-h-screen flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}