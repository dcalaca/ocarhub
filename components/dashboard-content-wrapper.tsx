"use client"

import type React from "react"
import { SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MobileBottomNavbar } from "@/components/mobile-bottom-navbar"

export function DashboardContentWrapper({ children }: { children: React.ReactNode }) {
  // Agora, useSidebar é chamado dentro do contexto do SidebarProvider
  const { isMobile } = useSidebar()

  return (
    <>
      {!isMobile && <AppSidebar />}
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-grow container mx-auto px-4 py-8 pb-20">{children}</main>
        <footer className="text-center py-4 border-t text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ocar. Todos os direitos reservados.
        </footer>
      </SidebarInset>
      {isMobile && <MobileBottomNavbar />}
    </>
  )
}
