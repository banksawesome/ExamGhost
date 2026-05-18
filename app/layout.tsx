import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SidebarProvider } from '@/components/exam-ghost/sidebar-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'ExamGhost - AI-Powered Exam Simulator',
    template: `%s | ExamGhost`,
  },
  description: 'Transform your study materials into realistic timed exams with AI-generated questions. Upload PDFs, notes, or slides and practice with voice-enabled exams. Perfect for test preparation and knowledge retention.',
  keywords: ['AI exam generator', 'exam simulator', 'test preparation', 'AI questions', 'exam practice', 'study tool', 'timed exam', 'voice exam', 'PDF to exam'],
  authors: [{ name: 'ExamGhost' }],
  creator: 'ExamGhost',
  publisher: 'ExamGhost',
  metadataBase: new URL('https://exam-ghost.vercel.app/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://exam-ghost.vercel.app/',
    title: 'ExamGhost - AI-Powered Exam Simulator',
    description: 'Transform your study materials into realistic timed exams with AI-generated questions. Upload PDFs, notes, or slides and practice with voice-enabled exams.',
    siteName: 'ExamGhost',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ExamGhost - AI-Powered Exam Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExamGhost - AI-Powered Exam Simulator',
    description: 'Transform your study materials into realistic timed exams with AI-generated questions.',
    creator: '@examghost',
    images: ['/og-image.png'],
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
    google: 'google-site-verification-token',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'ExamGhost',
              description: 'Transform your study materials into realistic timed exams with AI-generated questions',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'All',
              url: 'https://exam-ghost.vercel.app/',
              logo: 'https://exam-ghost.vercel.app//icon.svg',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'AI-generated exam questions',
                'PDF to exam conversion',
                'Timed exam simulation',
                'Voice interaction support',
                'Performance analytics',
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            {children}
          </SidebarProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}