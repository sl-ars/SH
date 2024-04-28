import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Toaster } from 'sonner'

// Replace the current Inter font import with this more resilient approach
// Add fallback fonts and increase the timeout
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  preload: true,
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: "StudentHunter",
  description: "Connect students with dream opportunities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <ThemeProvider defaultTheme="system" storageKey="studenthunter-theme">
          <AuthProvider>
            <NotificationProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster
                position="top-right"
                richColors={true}
                closeButton={true}
              />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'