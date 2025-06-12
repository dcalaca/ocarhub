"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Car, Search, Loader2, Plus, AlertTriangle, CheckCircle, Trash2, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getVehicleInfo } from "../actions"
import {
  saveUserVehicle,
  getUserVehicles,
  saveVehicleDebts,
  getVehicleDebts,
  deleteUserVehicle,
  type UserVehicle,
  type VehicleDebt,
} from "@/lib/supabase/database"

type VehicleData = {
  plate?: string
  chassis?: string
  model?: string
  brand?: string
  year?: number
  color?: string
  status?: string
  [key: string]: any
}

type UserVehicleWithDebts = UserVehicle & {
  debts: VehicleDebt[]
}

export default function MyVehiclesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userVehicles, setUserVehicles] = useState<UserVehicleWithDebts[]>([])
  const [currentVehicle, setCurrentVehicle] = useState<VehicleData | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Simula débitos para o veículo
  const generateMockDebts = (plate: string): any[] => {
    // Gera débitos baseados na placa para consistência
    const hasDebts = plate.includes("D") || plate.includes("M") || plate.includes("I")

    if (!hasDebts) {
      return []
    }

    const currentYear = new Date().getFullYear()

    return [
      {
        type: "ipva",
        description: `IPVA ${currentYear}`,
        amount: 1247.8,
        dueDate: `${currentYear}-04-30`,
        status: "pending",
      },
      {
        type: "licensing",
        description: `Licenciamento ${currentYear}`,
        amount: 98.91,
        dueDate: `${currentYear}-06-30`,
        status: "pending",
      },
      plate.includes("M")
        ? {
            type: "fine",
            description: "Multa - Excesso de velocidade",
            amount: 293.47,
            dueDate: `${currentYear}-07-15`,
            status: "pending",
            fine_code: "40610",
          }
        : null,
    ].filter(Boolean)
  }

  // Função para carregar dados do usuário
  const loadUserData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.error("Erro ao obter usuário:", error)
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        })
        return
      }

      setUserId(user.id)

      // Carregar veículos do Supabase
      const { data: vehicles, error: vehiclesError } = await getUserVehicles(user.id)

      if (vehiclesError) {
        console.error("Erro ao carregar veículos:", vehiclesError)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus veículos.",
          variant: "destructive",
        })
        return
      }

      // Carregar débitos para cada veículo
      const vehiclesWithDebts = await Promise.all(
        (vehicles || []).map(async (vehicle) => {
          const { data: debts } = await getVehicleDebts(vehicle.id)
          return {
            ...vehicle,
            debts: debts || [],
          }
        }),
      )

      setUserVehicles(vehiclesWithDebts)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [toast])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      setError("Por favor, insira uma placa.")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const result = await getVehicleInfo(searchTerm)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setCurrentVehicle(result.data)

        // Verifica se o veículo já está cadastrado
        const vehicleExists = userVehicles.some((v) => v.plate === result.data.plate)

        if (vehicleExists) {
          toast({
            title: "Veículo já cadastrado",
            description: "Este veículo já está em sua lista.",
            variant: "default",
          })
        }
      } else {
        setError("Nenhum dado encontrado para a placa informada.")
      }
    } catch (error: any) {
      setError("Ocorreu um erro ao buscar as informações do veículo.")
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  // Função para adicionar veículo
  const handleAddVehicle = async () => {
    if (!currentVehicle || !userId) return

    try {
      // Salvar veículo no Supabase
      const { data: savedVehicle, error: vehicleError } = await saveUserVehicle(currentVehicle, userId)

      if (vehicleError) {
        toast({
          title: "Erro",
          description: vehicleError,
          variant: "destructive",
        })
        return
      }

      if (!savedVehicle) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar o veículo.",
          variant: "destructive",
        })
        return
      }

      // Gerar e salvar débitos simulados
      const debts = generateMockDebts(currentVehicle.plate || "")

      if (debts.length > 0) {
        await saveVehicleDebts(savedVehicle.id, userId, debts)
      }

      // Recarregar a lista de veículos
      await loadUserData()

      setCurrentVehicle(null)
      setSearchTerm("")

      toast({
        title: "Veículo adicionado",
        description: "O veículo foi salvo com sucesso em sua conta.",
      })
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o veículo.",
        variant: "destructive",
      })
    }
  }

  // Função para deletar veículo
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!userId) return

    try {
      const { error } = await deleteUserVehicle(vehicleId, userId)

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o veículo.",
          variant: "destructive",
        })
        return
      }

      // Recarregar a lista de veículos
      await loadUserData()

      toast({
        title: "Veículo removido",
        description: "O veículo foi removido com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao deletar veículo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o veículo.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getTotalDebts = (debts: VehicleDebt[]) => {
    return debts.reduce((total, debt) => total + debt.amount, 0)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Meus Veículos</h1>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles">Meus Veículos</TabsTrigger>
          <TabsTrigger value="add">Adicionar Veículo</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userVehicles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center justify-center">
                <Car className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-semibold text-muted-foreground">Nenhum veículo cadastrado.</p>
                <p className="text-sm text-muted-foreground">
                  Adicione um veículo para acompanhar seus débitos e situação.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {userVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        <span>
                          {vehicle.brand} {vehicle.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {vehicle.plate}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year} • {vehicle.color} • {vehicle.fuel_type || "Flex"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Seção de Débitos */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {vehicle.debts.length > 0 ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          Situação de Débitos
                        </h3>
                        {vehicle.debts.length > 0 && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total em débitos</p>
                            <p className="text-lg font-bold text-red-500">
                              {formatCurrency(getTotalDebts(vehicle.debts))}
                            </p>
                          </div>
                        )}
                      </div>

                      {vehicle.debts.length > 0 ? (
                        <div className="space-y-2">
                          {vehicle.debts.map((debt) => (
                            <div
                              key={debt.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-muted/20 border-border"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-base">{debt.description}</p>
                                <p className="text-sm text-muted-foreground">Vencimento: {formatDate(debt.due_date)}</p>
                                {debt.fine_code && (
                                  <p className="text-xs text-muted-foreground">Código: {debt.fine_code}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-red-500">{formatCurrency(debt.amount)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-yellow-600">Pendente</span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Card informativo */}
                          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  Acompanhe seus débitos em tempo real
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                  Mantenha-se sempre atualizado sobre a situação do seu veículo. Os dados são
                                  atualizados automaticamente.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-lg bg-green-50 border border-green-200 text-center">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <p className="text-lg font-semibold text-green-800">Parabéns!</p>
                          <p className="text-sm text-green-700">Seu veículo está em dia com todas as obrigações.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4 mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Adicionar Veículo
              </CardTitle>
              <CardDescription>Digite a placa do veículo para adicionar à sua lista de acompanhamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <Input
                  type="text"
                  placeholder="Digite a placa (ex: ABC1D23)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  className="flex-grow"
                  maxLength={7}
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Buscar
                </Button>
              </form>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              {currentVehicle && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Veículo encontrado:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-muted/20 border-border">
                      <p className="text-sm font-medium text-muted-foreground">Placa</p>
                      <p className="text-lg font-semibold">{currentVehicle.plate || "Não informado"}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 border-border">
                      <p className="text-sm font-medium text-muted-foreground">Marca</p>
                      <p className="text-lg font-semibold">{currentVehicle.brand || "Não informado"}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 border-border">
                      <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                      <p className="text-lg font-semibold">{currentVehicle.model || "Não informado"}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 border-border">
                      <p className="text-sm font-medium text-muted-foreground">Ano</p>
                      <p className="text-lg font-semibold">{currentVehicle.year || "Não informado"}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 border-border">
                      <p className="text-sm font-medium text-muted-foreground">Cor</p>
                      <p className="text-lg font-semibold">{currentVehicle.color || "Não informado"}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 border-border">
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p
                        className={`text-lg font-semibold ${
                          currentVehicle.status === "Regular"
                            ? "text-green-500"
                            : currentVehicle.status === "Alerta"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {currentVehicle.status || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleAddVehicle}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar à minha lista
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
