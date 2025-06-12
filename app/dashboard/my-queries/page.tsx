"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Car, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getMyQueries, type VehicleQuery } from "../actions" // Importar a função de ações

export default function MyQueriesPage() {
  const [queries, setQueries] = useState<VehicleQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQueries = async () => {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setError("Usuário não autenticado. Por favor, faça login novamente.")
          setLoading(false)
          return
        }

        const result = await getMyQueries(user.id)
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setQueries(result.data)
        } else {
          setQueries([])
        }
      } catch (e: any) {
        setError("Ocorreu um erro ao carregar suas consultas: " + e.message)
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadQueries()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando suas consultas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Minhas Consultas</h1>
      <p className="text-muted-foreground">Aqui você encontra o histórico de todas as suas consultas de veículos.</p>

      {queries.length === 0 ? (
        <Card className="text-center py-12 bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-semibold text-muted-foreground">Nenhuma consulta encontrada.</p>
            <p className="text-sm text-muted-foreground">Faça sua primeira consulta na página inicial do dashboard!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queries.map((query) => (
            <Card key={query.id} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> {query.plateOrChassis}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(query.timestamp).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(query.timestamp).toLocaleTimeString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Modelo: {query.model} ({query.year})
                </p>
                <p className={`text-sm font-medium ${query.status === "Regular" ? "text-green-500" : "text-red-500"}`}>
                  Status: {query.status}
                </p>
                {/* Adicionar um botão para ver detalhes da consulta, se necessário */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
