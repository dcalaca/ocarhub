"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigateToHome = useCallback(() => {
    console.log("🏠 Navegando para home...")

    // Limpar estados problemáticos
    if (typeof window !== "undefined") {
      sessionStorage.clear()

      // Limpar apenas chaves específicas do localStorage
      const keysToRemove = [
        "fromSearch",
        "autoRedirect",
        "lastSearch",
        "searchState",
        "navigationState",
        "redirectFlag",
        "searchFilters",
      ]
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    }

    // Se já estamos na home, apenas recarregar
    if (pathname === "/") {
      window.location.reload()
    } else {
      // Usar window.location para navegação mais direta
      window.location.href = "/"
    }
  }, [pathname])

  const navigateToSearch = useCallback(
    (filters?: Record<string, any>) => {
      // Verificar se há filtros válidos
      const hasValidFilters =
        filters && Object.values(filters).some((value) => value !== undefined && value !== null && value !== "")

      if (!hasValidFilters) {
        console.log("🚫 Busca cancelada: nenhum filtro válido")
        return
      }

      console.log("🔍 Navegando para busca com filtros:", filters)

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "relevancia") {
            params.set(key, value.toString())
          }
        })
      }

      const url = `/buscar${params.toString() ? `?${params.toString()}` : ""}`
      router.push(url)
    },
    [router],
  )

  const navigateToPath = useCallback(
    (path: string) => {
      console.log("🔄 Navegando para:", path)
      router.push(path)
    },
    [router],
  )

  return {
    navigateToHome,
    navigateToSearch,
    navigateToPath,
    currentPath: pathname,
  }
}
