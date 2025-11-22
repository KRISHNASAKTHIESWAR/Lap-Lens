import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LapLens - F1 Telemetry Dashboard',
  description: 'Real-time F1 Telemetry Analytics & Predictive Racing Intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Exo+2:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-exo">
        {children}
      </body>
    </html>
  )
}