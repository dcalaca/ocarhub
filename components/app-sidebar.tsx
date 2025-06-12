"use client"

import { SidebarHeader } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { navItems } from "@/lib/nav-items" // Importa os itens de navegação

export function AppSidebar() {
  // Garante que o componente é exportado
  const { toggleSidebar, state, setOpen, isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      onMouseLeave={() => {
        if (!isMobile && state === "expanded") {
          setOpen(false)
        }
      }}
    >
      <SidebarHeader className="p-2">
        <Link href="/dashboard" className="flex items-center gap-2 text-2xl font-bold">
          <Image
            src="/logo-ocar-final.png"
            alt="OcarHub Logo"
            width={40}
            height={40}
            className="rounded-lg object-contain"
          />
          <span className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
            <span className="text-blue-500">Ocar</span>
            <span className="text-white">Hub</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} onClick={toggleSidebar}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
