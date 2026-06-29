import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

const kabisat = localFont({
  src: '../public/fonts/KabisatDemo-ItalicTall.ttf',
  variable: '--font-kabisat',
})

export const metadata = {
  title: 'Navin Nguyen',
  description: 'Photography & Film',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${kabisat.variable}`}>
        {children}
      </body>
    </html>
  )
}
