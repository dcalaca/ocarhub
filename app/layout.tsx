import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
// SidebarProvider, SidebarInset e AppSidebar foram removidos daqui
// para que a barra lateral só apareça em rotas protegidas.

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ocar - Consulta Veicular",
  description: "Consulte informações de veículos de forma rápida e segura.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        {children} {/* O conteúdo da página será renderizado aqui */}
        <Toaster />
      </body>
    </html>
  )
}
