"use client"

import { useState } from "react"
import { Header } from "@/components/simple-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, Download, RefreshCw } from "lucide-react"

export default function AdminPagamentosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Mock data para evitar erro de undefined
  const transactions = [
    {
      id: "trans_001",
      descricao: "Depósito via PIX",
      valor: 50.0,
      createdAt: new Date(),
      status: "aprovado",
      metodoPagamento: "PIX",
    },
    {
      id: "trans_002",
      descricao: "Consulta Histórico Veicular",
      valor: -25.0,
      createdAt: new Date(),
      status: "processando",
      metodoPagamento: "Saldo",
    },
  ]

  const saqueRequests = [
    {
      id: "saque_001",
      chavePix: "usuario@email.com",
      valor: 100.0,
      createdAt: new Date(),
      status: "pendente",
    },
  ]

  // Simulação de aprovação de saque
  const handleAprovarSaque = (id: string) => {
    toast({
      title: "Saque aprovado",
      description: "O saque foi aprovado e será processado em breve",
    })
  }

  // Simulação de rejeição de saque
  const handleRejeitarSaque = (id: string) => {
    toast({
      title: "Saque rejeitado",
      description: "O saque foi rejeitado",
      variant: "destructive",
    })
  }

  // Filtrar transações com verificação de segurança
  const filteredTransactions =
    transactions?.filter((t) => {
      const matchesSearch =
        t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesSearch && matchesStatus
    }) || []

  // Filtrar saques com verificação de segurança
  const filteredSaques =
    saqueRequests?.filter((s) => {
      const matchesSearch =
        s.chavePix.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || s.status === statusFilter
      return matchesSearch && matchesStatus
    }) || []

  // Formatar data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  // Verificar se é admin específico
  const isAdmin = user?.email === 'dcalaca@gmail.com'
  
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-4">Esta página é restrita a administradores.</p>
              <Button asChild>
                <a href="/">Voltar para Home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administração de Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie transações e solicitações de saque</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por ID, descrição ou chave PIX"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <Label htmlFor="status">Status</Label>
            <div className="relative">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">Todos os status</option>
                <option value="aprovado">Aprovado</option>
                <option value="pendente">Pendente</option>
                <option value="processando">Processando</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-end">
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="w-full md:w-auto flex items-end">
            <Button variant="outline" className="w-full md:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="transacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="saques">Solicitações de Saque</TabsTrigger>
          </TabsList>

          {/* Aba de Transações */}
          <TabsContent value="transacoes">
            <Card>
              <CardHeader>
                <CardTitle>Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Método
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-card">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhuma transação encontrada
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:opacity-80 bg-card">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.descricao}</td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.valor > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.valor > 0 ? "+" : ""}
                              {Math.abs(transaction.valor).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={`
                                ${transaction.status === "aprovado" ? "bg-green-100 text-green-800" : ""}
                                ${transaction.status === "pendente" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${transaction.status === "processando" ? "bg-blue-100 text-blue-800" : ""}
                                ${transaction.status === "rejeitado" ? "bg-red-100 text-red-800" : ""}
                              `}
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.metodoPagamento || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Saques */}
          <TabsContent value="saques">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Saque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chave PIX
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-card">
                      {filteredSaques.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhuma solicitação de saque encontrada
                          </td>
                        </tr>
                      ) : (
                        filteredSaques.map((saque) => (
                          <tr key={saque.id} className="hover:opacity-80 bg-card">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {saque.id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{saque.chavePix}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {saque.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(saque.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={`
                                ${saque.status === "aprovado" ? "bg-green-100 text-green-800" : ""}
                                ${saque.status === "pendente" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${saque.status === "rejeitado" ? "bg-red-100 text-red-800" : ""}
                              `}
                              >
                                {saque.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAprovarSaque(saque.id)}
                                  disabled={saque.status !== "pendente"}
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejeitarSaque(saque.id)}
                                  disabled={saque.status !== "pendente"}
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
