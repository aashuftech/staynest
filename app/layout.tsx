import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import StayNestChatWidget from '@/components/ai/StayNestChatWidget'

export const metadata: Metadata = {
  title: 'StayNest – Find Your Perfect Apartment with Zero Stress',
  description: 'Curated, verified residences and effortless booking for considered stays.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <StayNestChatWidget />
        </Providers>
      </body>
    </html>
  )
}
