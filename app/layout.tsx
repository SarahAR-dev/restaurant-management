import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant App",
  description: "Interface de gestion de restaurant",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <div className="flex h-screen">
          <Sidebar />

          <main className="flex-1 md:ml-64 overflow-auto">
            <header className="sticky top-0 right-0 bg-background border-b border-border p-4 flex justify-end">
              <ThemeToggle />
            </header>

            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
