import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradeDesk',
  description: 'Plateforme privée de trading',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
