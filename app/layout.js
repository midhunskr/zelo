import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata = {
    title: 'Zelo - Real-time Chat Platform',
    description: 'A modern real-time communication platform',
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full bg-white">
            <body className={`h-full ${poppins.className}`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
} 