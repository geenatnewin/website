import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-condensed',
})

export const metadata = {
  title: 'Navin Nguyen',
  description: 'Photography & Film',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebasNeue.variable}`}>
        {children}
      </body>
    </html>
  )
}
