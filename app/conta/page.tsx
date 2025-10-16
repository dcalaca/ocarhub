"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContaPage() {
  const { user, refreshUserData, getTransacoes } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Estados para transações reais
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  // Estados da interface
  const [mostrarSaldo, setMostrarSaldo] = useState(true)
  const [filtroTransacao, setFiltroTransacao] = useState<"todas" | "entradas" | "saidas">("todas")

  // Função para recarregar transações manualmente
  const recarregarTransacoes = async () => {
    if (!user) return

    setLoadingTransactions(true)
    try {
      console.log('🔄 Recarregando transações manualmente...')
      const transacoes = await getTransacoes()
      console.log('📊 Transações recarregadas:', transacoes)
      setTransactions(transacoes)
      toast({
        title: "Extrato atualizado",
        description: `${transacoes.length} transações carregadas`,
      })
    } catch (error) {
      console.error('❌ Erro ao recarregar transações:', error)
      toast({
        title: "Erro ao atualizar extrato",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
    } finally {
      setLoadingTransactions(false)
    }
  }

  // Carregar transações reais do banco
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) {
        setLoadingTransactions(false)
        return
      }

      try {
        console.log('🔍 Carregando transações reais do banco...')
        const transacoes = await getTransacoes()
        console.log('📊 Transações carregadas:', transacoes)
        setTransactions(transacoes)
      } catch (error) {
        console.error('❌ Erro ao carregar transações:', error)
        setTransactions([])
      } finally {
        setLoadingTransactions(false)
      }
    }

    loadTransactions()
  }, [user]) // Removido getTransacoes das dependências para evitar loop infinito

  // Verificar se há parâmetros de pagamento na URL
  useEffect(() => {
    const status = searchParams.get('status')

    if (status) {
      switch (status) {
        case 'success':
      toast({
            title: "Pagamento realizado!",
            description: "Seu saldo será atualizado em alguns instantes",
          })
          // Recarregar transações após pagamento
          setTimeout(() => {
            recarregarTransacoes()
          }, 2000)
          break
        case 'failure':
      toast({
            title: "Pagamento não aprovado",
            description: "Tente novamente ou escolha outro método de pagamento",
        variant: "destructive",
      })
        break
        case 'pending':
        toast({
            title: "Pagamento pendente",
            description: "Aguardando confirmação do pagamento",
        })
        break
    }
  }
  }, [searchParams, toast])

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return "Data inválida"
    }
    
    // Converter string para Date se necessário
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (!dateObj || isNaN(dateObj.getTime())) {
      return "Data inválida"
    }
    
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case "deposito":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case "saque":
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />
      case "consulta_historico":
        return <FileText className="w-4 h-4 text-purple-600" />
      case "anuncio_destaque":
      case "anuncio_premium":
      case "taxa_anuncio":
      case "gasto": // Adicionado para transações de débito por anúncios
        return <TrendingUp className="w-4 h-4 text-orange-600" />
      default:
        return <TrendingDown className="w-4 h-4 text-red-600" />
    }
  }

  const getTransactionColor = (valor: number) => {
    return valor > 0 ? "text-green-600" : "text-red-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case "pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case "processando":
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>
      case "rejeitado":
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const transacoesFiltradas = (transactions || []).filter((t) => {
    if (filtroTransacao === "entradas") return t.valor > 0
    if (filtroTransacao === "saidas") return t.valor < 0
    return true
  })


  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-4">Você precisa estar logado para acessar sua conta.</p>
              <Button asChild>
                <a href="/login">Fazer Login</a>
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

      <div className="container mx-auto px-4 py-8 max-w-6xl pt-20">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Minha Conta</h1>
              <p className="text-slate-300">Gerencie seu saldo e movimentações financeiras</p>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Saldo Atual */}
                <Card className="border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Saldo Disponível</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setMostrarSaldo(!mostrarSaldo)}>
                    {mostrarSaldo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={refreshUserData} title="Atualizar saldo">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {mostrarSaldo ? (user.saldo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "••••••"}
              </div>
            </CardContent>
          </Card>

          {/* Total de Entradas */}
                <Card className="border bg-card">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Recebido</h3>
              <div className="text-2xl font-bold text-blue-600">
                {(transactions || [])
                  .filter((t) => t.valor > 0)
                  .reduce((acc, t) => acc + t.valor, 0)
                  .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </CardContent>
          </Card>

          {/* Total de Saídas */}
                <Card className="border bg-card">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Gasto</h3>
              <div className="text-2xl font-bold text-red-600">
                {Math.abs((transactions || []).filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0)).toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" },
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Segurança */}
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Segurança:</strong> Seus depósitos e saques são processados apenas para o CPF cadastrado em sua
            conta. Mantenha seus dados sempre atualizados.
          </AlertDescription>
        </Alert>

        {/* Histórico de Compras */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                Histórico de Compras
                  </CardTitle>
                  <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={recarregarTransacoes}
                  disabled={loadingTransactions}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingTransactions ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                    <Button
                      variant={filtroTransacao === "todas" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroTransacao("todas")}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filtroTransacao === "entradas" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroTransacao("entradas")}
                    >
                      Entradas
                    </Button>
                    <Button
                      variant={filtroTransacao === "saidas" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroTransacao("saidas")}
                    >
                      Saídas
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Carregando transações...</h3>
                    <p className="text-muted-foreground">
                      Buscando suas movimentações no banco de dados.
                    </p>
                  </div>
                ) : transacoesFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação</h3>
                    <p className="text-muted-foreground">
                      Suas transações aparecerão aqui quando você movimentar sua conta.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transacoesFiltradas.map((transaction) => (
                      <div
                        key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:opacity-80 bg-card"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.tipo)}
                          <div>
                            <div className="font-medium">{transaction.descricao}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at || transaction.createdAt)}
                              {transaction.metodo_pagamento && (
                                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                  {transaction.metodo_pagamento.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getTransactionColor(transaction.valor)}`}>
                            {transaction.valor > 0 ? "+" : ""}
                            {Math.abs(transaction.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

      </div>
    </div>
  )
}
