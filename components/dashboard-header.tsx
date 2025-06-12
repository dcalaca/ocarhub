"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2, Car } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { getUserWallet } from "@/app/dashboard/wallet/actions"

export function DashboardHeader() {
  const router = useRouter()
  const [user, setUser] = React.useState<SupabaseUser | null>(null)
  const [walletBalance, setWalletBalance] = React.useState<number | null>(null)
  const [loadingUser, setLoadingUser] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()

    const checkSessionAndLoadData = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Erro ao verificar sessão no header:", error)
          return
        }
        if (data.session) {
          setUser(data.session.user)
          const userWallet = await getUserWallet(data.session.user.id)
          setWalletBalance(userWallet.balance)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário no header:", error)
      } finally {
        setLoadingUser(false)
      }
    }

    checkSessionAndLoadData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        setWalletBalance(null)
      } else if (session?.user) {
        setUser(session.user)
        getUserWallet(session.user.id).then((wallet) => setWalletBalance(wallet.balance))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      router.push("/auth/login")
    }
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-black text-white">
      {/* Logo para mobile - visível apenas em telas pequenas */}
      <div className="md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo-ocar-final.png" alt="OcarHub Logo" width={28} height={28} className="object-contain" />
          <span className="text-xl font-bold">
            <span className="text-blue-500">Ocar</span>
            <span className="text-white">Hub</span>
          </span>
        </Link>
      </div>
      <div className="flex-grow" /> {/* Empurra o conteúdo para a direita */}
      {loadingUser ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-gray-700">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">R$ {walletBalance?.toFixed(2) || "0,00"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.user_metadata?.full_name || "Usuário OcarHub"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="flex items-center">
              <Avatar className="mr-2 h-4 w-4">
                <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
              </Avatar>
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/my-vehicles")} className="flex items-center">
              <Car className="mr-2 h-4 w-4" />
              Meus Veículos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-500">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-sm text-muted-foreground">Visitante</span>
      )}
    </header>
  )
}
