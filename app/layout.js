import { Inter } from 'next/font/google'
import './globals.css'
import OwnerAccess from './components/OwnerAccess'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Navin Nguyen',
  description: 'Photography & Film',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
        <OwnerAccess />
      </body>
    </html>
  )
}
