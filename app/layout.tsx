import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Manohar Reddy — AI Engineer',
  description: 'Senior AI/ML Engineer. Recommendation systems, fraud detection, real-time ML pipelines.',
  keywords: ['AI Engineer', 'ML Engineer', 'Recommendation Systems', 'MLOps', 'Python', 'AWS', 'GCP'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
