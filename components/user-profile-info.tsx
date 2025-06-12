"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Phone, CreditCard, Mail } from "lucide-react"

interface UserProfile {
  full_name?: string
  phone?: string
  cpf?: string
  phone_verified?: boolean
  cpf_verified?: boolean
}

export function UserProfileInfo() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()

      // Pegar dados do usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Pegar dados do perfil
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

        setProfile(profile)
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  if (loading) {
    return <div>Carregando perfil...</div>
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
          <Badge variant="secondary">Verificado</Badge>
        </div>

        {profile?.full_name && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{profile.full_name}</span>
          </div>
        )}

        {profile?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{profile.phone}</span>
            <Badge variant={profile.phone_verified ? "default" : "secondary"}>
              {profile.phone_verified ? "Verificado" : "Não verificado"}
            </Badge>
          </div>
        )}

        {profile?.cpf && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>{profile.cpf}</span>
            <Badge variant={profile.cpf_verified ? "default" : "secondary"}>
              {profile.cpf_verified ? "Verificado" : "Não verificado"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
