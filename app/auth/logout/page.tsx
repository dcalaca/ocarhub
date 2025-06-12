"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient, clearClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()

        // Limpa a instância do cliente
        clearClient()

        setTimeout(() => router.push("/auth/login"), 1000)
      } catch (error) {
        console.error("Erro no logout:", error)
        router.push("/auth/login")
      }
    }
    signOut()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Saindo...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-center">Fazendo logout...</p>
        </CardContent>
      </Card>
    </div>
  )
}
