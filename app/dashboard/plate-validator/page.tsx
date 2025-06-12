"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, Loader2, Car } from "lucide-react"
import { getVehicleInfo } from "@/app/dashboard/actions" // Reutiliza a ação existente
import { useToast } from "@/components/ui/use-toast"

type VehicleData = {
  plate?: string
  chassis?: string
  model?: string
  brand?: string
  year?: number
  [key: string]: any // Para permitir outras propriedades da API simulada
}

export default function PlateValidatorPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!searchTerm.trim()) {
      setError("Por favor, insira uma placa para validar.")
      setVehicleData(null)
      return
    }
    setIsLoading(true)
    setError(null)
    setVehicleData(null)

    try {
      const result = await getVehicleInfo(searchTerm) // Reutiliza a função de consulta
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setVehicleData(result.data)
        toast({
          title: "Sucesso!",
          description: "Informações básicas da placa encontradas.",
        })
      } else {
        setError("Nenhum dado encontrado para a placa informada.")
      }
    } catch (e: any) {
      setError("Ocorreu um erro ao buscar as informações da placa.")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Validador de Placa</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" /> Validação Gratuita
          </CardTitle>
          <CardDescription>Digite a placa do veículo para obter a marca, modelo e ano gratuitamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Digite a placa (ex: ABC1D23)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="flex-grow"
              maxLength={7} // Limita para placas padrão
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Validar
            </Button>
          </form>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {vehicleData && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Resultados da Validação:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-muted/20 border-border">
                  <p className="text-sm font-medium text-muted-foreground">Placa</p>
                  <p className="text-lg font-semibold">{vehicleData.plate || "Não informado"}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/20 border-border">
                  <p className="text-sm font-medium text-muted-foreground">Marca</p>
                  <p className="text-lg font-semibold">{vehicleData.brand || "Não informado"}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/20 border-border">
                  <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                  <p className="text-lg font-semibold">{vehicleData.model || "Não informado"}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/20 border-border">
                  <p className="text-sm font-medium text-muted-foreground">Ano</p>
                  <p className="text-lg font-semibold">{vehicleData.year || "Não informado"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Para informações mais detalhadas, como histórico de leilão, débitos e sinistros, utilize a função
                "Consultar Veículo" na página inicial do dashboard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
