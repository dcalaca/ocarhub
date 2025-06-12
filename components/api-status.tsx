"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "active" | "inactive">("loading")
  const [apiType, setApiType] = useState<"real" | "simulada">("simulada")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Verifica se a API está configurada
        const response = await fetch("/api/check-api-status")
        const data = await response.json()

        setStatus(data.active ? "active" : "inactive")
        setApiType(data.type)
      } catch (error) {
        console.error("Erro ao verificar status da API:", error)
        setStatus("inactive")
      }
    }

    checkApiStatus()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Status da API</CardTitle>
        <CardDescription>Fonte de dados para consultas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : status === "active" ? (
              <div className="h-3 w-3 rounded-full bg-green-500" />
            ) : (
              <div className="h-3 w-3 rounded-full bg-red-500" />
            )}
            <span className="text-sm font-medium">API {apiType === "real" ? "Infosimples" : "Simulada"}</span>
          </div>

          <Badge variant={apiType === "real" ? "default" : "outline"}>
            {apiType === "real" ? "Produção" : "Desenvolvimento"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
