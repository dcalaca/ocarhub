"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinanceAuth } from "@/hooks/use-finance-auth"
import { useFinanceCalculations } from "@/hooks/use-finance-calculations"
import { Calculator, Search, Filter, Trash2, Eye, Download } from "lucide-react"
import Link from "next/link"

export default function HistoricoPage() {
  const { user, loading: authLoading } = useFinanceAuth()
  const { calculations, loading: calcLoading, deleteCalculation } = useFinanceCalculations()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || calcLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getCalculationTypeLabel = (type: string) => {
    const labels = {
      juros_compostos: "Juros Compostos",
      conversor_moedas: "Conversor de Moedas",
      financiamento: "Financiamento",
      aposentadoria: "Aposentadoria",
      inflacao: "Inflação",
      orcamento: "Orçamento",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getCalculationTypeColor = (type: string) => {
    const colors = {
      juros_compostos: "bg-blue-100 text-blue-800",
      conversor_moedas: "bg-orange-100 text-orange-800",
      financiamento: "bg-green-100 text-green-800",
      aposentadoria: "bg-purple-100 text-purple-800",
      inflacao: "bg-red-100 text-red-800",
      orcamento: "bg-indigo-100 text-indigo-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Filtrar e ordenar cálculos
  const filteredCalculations = calculations
    .filter((calc) => {
      const matchesSearch = calc.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || calc.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

  const handleDeleteCalculation = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cálculo?")) {
      await deleteCalculation(id)
    }
  }

  const exportCalculations = () => {
    const csvContent = [
      ["Título", "Tipo", "Data de Criação"],
      ...filteredCalculations.map((calc) => [
        calc.title,
        getCalculationTypeLabel(calc.type),
        new Date(calc.created_at).toLocaleDateString("pt-BR"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "historico-calculos.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Histórico de Cálculos</h1>
            <p className="text-slate-600">Visualize e gerencie todos os seus cálculos salvos</p>
          </div>

          {/* Filtros e Busca */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </span>
                <Button onClick={exportCalculations} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar por título..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="juros_compostos">Juros Compostos</SelectItem>
                      <SelectItem value="conversor_moedas">Conversor de Moedas</SelectItem>
                      <SelectItem value="financiamento">Financiamento</SelectItem>
                      <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
                      <SelectItem value="inflacao">Inflação</SelectItem>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recente</SelectItem>
                      <SelectItem value="oldest">Mais antigo</SelectItem>
                      <SelectItem value="title">Título (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cálculos */}
          <Card>
            <CardHeader>
              <CardTitle>Cálculos Salvos ({filteredCalculations.length})</CardTitle>
              <CardDescription>
                {filteredCalculations.length === 0 && searchTerm
                  ? "Nenhum cálculo encontrado com os filtros aplicados"
                  : "Seus cálculos salvos aparecem aqui"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCalculations.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    {searchTerm || filterType !== "all"
                      ? "Nenhum cálculo encontrado com os filtros aplicados"
                      : "Você ainda não tem cálculos salvos"}
                  </p>
                  <Button asChild>
                    <Link href="/calculadoras/juros-compostos">Fazer Primeiro Cálculo</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCalculations.map((calculation) => (
                    <div
                      key={calculation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge className={getCalculationTypeColor(calculation.type)}>
                          {getCalculationTypeLabel(calculation.type)}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-slate-900">{calculation.title}</h4>
                          <p className="text-sm text-slate-600">
                            Criado em {new Date(calculation.created_at).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(calculation.created_at).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="Visualizar">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCalculation(calculation.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
