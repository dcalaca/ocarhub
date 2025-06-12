import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardContentWrapper } from "@/components/dashboard-content-wrapper" // Importa o novo componente

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      {/* O DashboardContentWrapper agora é um filho do SidebarProvider */}
      <DashboardContentWrapper>{children}</DashboardContentWrapper>
    </SidebarProvider>
  )
}
