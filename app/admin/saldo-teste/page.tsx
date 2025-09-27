"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  History,
  RefreshCw
} from "lucide-react"

interface Transacao {
  id: string
  tipo: string
  valor: number
  descricao: string
  status: string
  metodo_pagamento: string
  referencia: string
  created_at: string
}

export default function SaldoTestePage() {
  const { user, refreshSaldo } = useAuth()
  const [valor, setValor] = useState("")
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loadingTransacoes, setLoadingTransacoes] = useState(false)

  const adicionarSaldo = async () => {
    if (!user) {
      setMessage("Você precisa estar logado")
      setMessageType("error")
      return
    }

    const valorNum = parseFloat(valor)
    if (isNaN(valorNum) || valorNum <= 0) {
      setMessage("Digite um valor válido maior que zero")
      setMessageType("error")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch('/api/test-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: valorNum,
          description: descricao || `Saldo de teste - R$ ${valorNum.toFixed(2)}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Saldo adicionado com sucesso! Novo saldo: R$ ${data.novo_saldo.toFixed(2)}`)
        setMessageType("success")
        setValor("")
        setDescricao("")
        
        // Atualizar saldo no contexto
        await refreshSaldo()
        
        // Recarregar transações
        carregarTransacoes()
      } else {
        setMessage(data.error || "Erro ao adicionar saldo")
        setMessageType("error")
      }
    } catch (error) {
      console.error('Erro:', error)
      setMessage("Erro ao conectar com o servidor")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const carregarTransacoes = async () => {
    if (!user) return

    setLoadingTransacoes(true)
    try {
      const response = await fetch(`/api/transacoes?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setTransacoes(data.transacoes || [])
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoadingTransacoes(false)
    }
  }

  useEffect(() => {
    if (user) {
      carregarTransacoes()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Login Necessário</h2>
              <p className="text-muted-foreground mb-4">
                Você precisa estar logado para acessar esta página.
              </p>
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">💰 Gerenciar Saldo de Teste</h1>
          <p className="text-muted-foreground">
            Adicione saldo de teste para desenvolvimento e testes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Adicionar Saldo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Adicionar Saldo de Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Saldo Atual</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  R$ {(user.saldo || 0).toLocaleString("pt-BR", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="100.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição (Opcional)</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Ex: Saldo para testes de consulta veicular"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={adicionarSaldo}
                  disabled={loading || !valor}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Saldo
                    </>
                  )}
                </Button>
              </div>

              {message && (
                <Alert className={messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {messageType === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={messageType === "success" ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Transações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Histórico de Transações
                <Button
                  variant="outline"
                  size="sm"
                  onClick={carregarTransacoes}
                  disabled={loadingTransacoes}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingTransacoes ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransacoes ? (
                <div className="text-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Carregando transações...</p>
                </div>
              ) : transacoes.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transacoes.slice(0, 10).map((transacao) => (
                    <div key={transacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={transacao.tipo === 'credito' ? 'default' : 'destructive'}>
                            {transacao.tipo === 'credito' ? 'Crédito' : 'Débito'}
                          </Badge>
                          <Badge variant="outline">
                            {transacao.metodo_pagamento}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{transacao.descricao}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transacao.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transacao.tipo === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                          {transacao.tipo === 'credito' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transacao.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Valores Sugeridos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Valores Sugeridos para Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { valor: 25, desc: "1 consulta veicular" },
                { valor: 100, desc: "4 consultas veiculares" },
                { valor: 250, desc: "10 consultas veiculares" },
                { valor: 500, desc: "20 consultas veiculares" }
              ].map((item) => (
                <Button
                  key={item.valor}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => {
                    setValor(item.valor.toString())
                    setDescricao(item.desc)
                  }}
                >
                  <div className="font-bold text-lg">R$ {item.valor}</div>
                  <div className="text-xs text-muted-foreground text-center">
                    {item.desc}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
