import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Agent Hunter - 自动狩猎平台',
  description: 'OKX AI 黑客松 - AI Agent 自动发现并执行链上 Alpha 机会',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <body>
        {children}
      </body>
    </html>
  )
}
