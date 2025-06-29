import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Data Alchemist: AI-Powered Resource Configurator',
  description: 'Upload, validate, and configure resource data with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gradient-to-br from-blue-50 via-white to-purple-100 min-h-screen"}>
        <main className="flex flex-col min-h-screen items-center justify-center">
          <div className="w-full max-w-6xl p-6 rounded-2xl shadow-xl bg-white/80 border border-gray-200 mt-8 mb-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}