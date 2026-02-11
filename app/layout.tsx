import './globals.css'
import { DM_Sans } from 'next/font/google'
import { ClientLayoutContent as LayoutContent } from '../components/ClientLayoutContent'
// Configurazione del Font DM Sans
const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

export const metadata = {
  title: 'OneMorePill',
  description: 'Track your international romances',
  manifest: '/manifest.json',
  icons: {
      apple: "/icon-512.png",
    },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} bg-white m-0 p-0 antialiased`}>
        {/* Usiamo il componente Client per gestire la navigazione */}
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}