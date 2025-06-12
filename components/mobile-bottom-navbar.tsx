"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { navItems } from "@/lib/nav-items" // Importa os itens de navegação

export function MobileBottomNavbar() {
  const pathname = usePathname()

  // Seleciona os 5 itens mais relevantes para a barra de rodapé móvel
  const mobileNavItems = navItems
    .filter((item) =>
      [
        "/dashboard", // Consultar Veículo
        "/dashboard/financing-simulator", // Simulador de Financiamento (novo na barra móvel)
        "/dashboard/wallet", // Minha Conta
        "/dashboard/my-queries", // Minhas Consultas
        "/dashboard/settings", // Configurações
      ].includes(item.url),
    )
    .sort((a, b) => {
      // Garante uma ordem específica para os itens no mobile
      const order = {
        "/dashboard": 1,
        "/dashboard/financing-simulator": 2, // Nova posição
        "/dashboard/wallet": 3,
        "/dashboard/my-queries": 4,
        "/dashboard/settings": 5,
      }
      return (order[a.url as keyof typeof order] || 99) - (order[b.url as keyof typeof order] || 99)
    })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-gray-700 md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        {mobileNavItems.map((item) => (
          <Button
            key={item.url}
            asChild
            variant="ghost"
            className={`flex flex-col gap-1 text-xs h-full w-full rounded-none ${
              pathname === item.url ? "text-primary" : "text-gray-400 hover:text-white"
            }`}
          >
            <Link href={item.url}>
              <item.icon className="h-5 w-5" />
              <span className="mt-1">{item.title.split(" ")[0]}</span> {/* Exibe apenas a primeira palavra */}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  )
}
