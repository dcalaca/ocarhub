"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { formatCPF, validateCPF } from "@/lib/utils/cpf"

export function UpdateProfileForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        // Carregar dados do perfil
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

        if (profile) {
          setName(profile.full_name || "")
          setPhone(profile.phone || "")
          setCpf(profile.cpf || "")
        }
      }
    }

    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !cpf) {
      toast({
        title: "Erro",
        description: "Telefone e CPF são obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (!validateCPF(cpf)) {
      toast({
        title: "Erro",
        description: "CPF inválido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: name,
        phone: phone,
        cpf: cpf,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualizar Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
