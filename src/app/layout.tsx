import type { Metadata } from 'next'

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
    <html lang="zh">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%);
            color: #f8fafc;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
          }
          .gradient-text {
            background: linear-gradient(135deg, #00ff88, #00d4ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
