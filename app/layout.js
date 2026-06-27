import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-condensed',
})

export const metadata = {
  title: 'Navin Nguyen',
  description: 'Photography & Film',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${barlowCondensed.variable}`}>
        {children}
      </body>
    </html>
  )
}
