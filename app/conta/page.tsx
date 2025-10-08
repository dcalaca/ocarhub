"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { usePagarme } from "@/hooks/use-pagarme"
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
  Copy,
  QrCode,
  Shield,
  Eye,
  EyeOff,
  CreditCard,
  Receipt,
  Download,
  Printer,
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

  const saqueRequests = [
    { id: "1", valor: 200, status: "pendente", data: "2024-01-16", createdAt: new Date("2024-01-16"), chavePix: "usuario@ocar.com" },
    { id: "2", valor: 100, status: "aprovado", data: "2024-01-10", createdAt: new Date("2024-01-10"), chavePix: "usuario@ocar.com" },
  ]

  // Função mock para solicitar saque
  const solicitarSaque = async (valor: number, chavePix: string) => {
    console.log('Mock: Solicitar saque', { valor, chavePix })
    toast({
      title: "Saque solicitado!",
      description: `Solicitação de R$ ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} enviada.`,
    })
  }

  // Estados para depósito
  const [valorDeposito, setValorDeposito] = useState("")
  const [metodoDeposito, setMetodoDeposito] = useState<"pix" | "cartao" | "boleto">("pix")

  // Estados para saque
  const [valorSaque, setValorSaque] = useState("")
  const [chavePix, setChavePix] = useState("")
  const [loadingSaque, setLoadingSaque] = useState(false)

  // Estados da interface
  const [mostrarSaldo, setMostrarSaldo] = useState(true)
  const [filtroTransacao, setFiltroTransacao] = useState<"todas" | "entradas" | "saidas">("todas")

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
  }, [user, getTransacoes])

  // Usar o hook do Pagarme
  const {
    loading: loadingDeposito,
    pixData,
    boletoData,
    createPixPayment,
    createBoletoPayment,
    createCardPayment,
    copyPixCode,
    copyBoletoLine,
    clearPixData,
    clearBoletoData,
  } = usePagarme({
    onSuccess: (data) => {
      setValorDeposito("")
    },
  })

  // Verificar se há parâmetros de pagamento na URL
  useEffect(() => {
    const paymentStatus = searchParams.get("payment")
    const amount = searchParams.get("amount")

    if (paymentStatus === "success" && amount) {
      toast({
        title: "Pagamento confirmado!",
        description: `${Number.parseFloat(amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} adicionado à sua conta`,
      })
    } else if (paymentStatus === "canceled") {
      toast({
        title: "Pagamento cancelado",
        description: "O pagamento foi cancelado ou não foi concluído",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const handleDeposito = async () => {
    const valor = Number.parseFloat(valorDeposito)

    if (!valor || valor <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para depósito",
        variant: "destructive",
      })
      return
    }

    if (valor < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para depósito é R$ 10,00",
        variant: "destructive",
      })
      return
    }

    if (valor > 10000) {
      toast({
        title: "Valor máximo",
        description: "O valor máximo para depósito é R$ 10.000,00",
        variant: "destructive",
      })
      return
    }

    switch (metodoDeposito) {
      case "pix":
        await createPixPayment(valor)
        break
      case "boleto":
        await createBoletoPayment(valor)
        break
      case "cartao":
        // Para cartão, você pode implementar um modal com formulário
        toast({
          title: "Em breve",
          description: "Pagamento com cartão será implementado em breve",
        })
        break
    }
  }

  const handleSaque = async () => {
    const valor = Number.parseFloat(valorSaque)

    if (!valor || valor <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para saque",
        variant: "destructive",
      })
      return
    }

    if (valor < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para saque é R$ 10,00",
        variant: "destructive",
      })
      return
    }

    if (valor > user!.saldo) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para este saque",
        variant: "destructive",
      })
      return
    }

    if (!chavePix) {
      toast({
        title: "Chave PIX obrigatória",
        description: "Digite sua chave PIX para receber o saque",
        variant: "destructive",
      })
      return
    }

    setLoadingSaque(true)

    const sucesso = await solicitarSaque(valor, chavePix)

    if (sucesso) {
      setValorSaque("")
      setChavePix("")
      toast({
        title: "Saque solicitado!",
        description: `Saque de ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} será processado em até 2 horas úteis`,
      })
    } else {
      toast({
        title: "Erro no saque",
        description: "Não foi possível processar sua solicitação",
        variant: "destructive",
      })
    }

    setLoadingSaque(false)
  }

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

  const copiarChavePix = () => {
    navigator.clipboard.writeText("usuario@ocar.com.br")
    toast({
      title: "Chave PIX copiada!",
      description: "Cole no seu app de pagamentos",
    })
  }

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

        <Tabs defaultValue="movimentar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border">
            <TabsTrigger value="movimentar" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 hover:text-white">
              <DollarSign className="w-4 h-4" />
              Movimentar
            </TabsTrigger>
            <TabsTrigger value="extrato" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 hover:text-white">
              <Calendar className="w-4 h-4" />
              Extrato
            </TabsTrigger>
            <TabsTrigger value="saques" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 hover:text-white">
              <Clock className="w-4 h-4" />
              Saques
            </TabsTrigger>
          </TabsList>

          {/* Aba Movimentar */}
          <TabsContent value="movimentar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Depósito */}
                <Card className="border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <ArrowDownLeft className="w-5 h-5" />
                    Adicionar Saldo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="valor-deposito">Valor do Depósito</Label>
                    <Input
                      id="valor-deposito"
                      type="number"
                      placeholder="0,00"
                      value={valorDeposito}
                      onChange={(e) => setValorDeposito(e.target.value)}
                      min="10"
                      max="10000"
                      step="0.01"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Mín: R$ 10,00 | Máx: R$ 10.000,00</p>
                  </div>

                  <div>
                    <Label>Método de Pagamento</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={metodoDeposito === "pix" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMetodoDeposito("pix")}
                        className={`flex items-center gap-1 ${
                          metodoDeposito === "pix" 
                            ? "bg-purple-600 text-white hover:bg-purple-700" 
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <QrCode className="w-3 h-3" /> PIX
                      </Button>
                      <Button
                        variant={metodoDeposito === "cartao" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMetodoDeposito("cartao")}
                        className={`flex items-center gap-1 ${
                          metodoDeposito === "cartao" 
                            ? "bg-purple-600 text-white hover:bg-purple-700" 
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <CreditCard className="w-3 h-3" /> Cartão
                      </Button>
                      <Button
                        variant={metodoDeposito === "boleto" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMetodoDeposito("boleto")}
                        className={`flex items-center gap-1 ${
                          metodoDeposito === "boleto" 
                            ? "bg-purple-600 text-white hover:bg-purple-700" 
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <Receipt className="w-3 h-3" /> Boleto
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setValorDeposito("25")}
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      R$ 25
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setValorDeposito("100")}
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      R$ 100
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setValorDeposito("500")}
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      R$ 500
                    </Button>
                  </div>

                  <Button
                    onClick={handleDeposito}
                    disabled={loadingDeposito || !valorDeposito}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loadingDeposito ? (
                      "Processando..."
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Saldo
                      </>
                    )}
                  </Button>

                  {pixData && (
                    <div className="p-4 bg-blue-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">PIX Gerado</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearPixData}>
                          ✕
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="w-32 h-32 border-2 border rounded-lg mx-auto mb-2 flex items-center justify-center bg-card">
                            <QrCode className="w-16 h-16 text-blue-400" />
                          </div>
                          <p className="text-sm text-blue-700">Escaneie o QR Code</p>
                        </div>

                        <div>
                          <Label className="text-xs text-blue-700">Código PIX:</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input value={pixData.pix.qr_code} readOnly className="text-xs bg-card" />
                            <Button size="sm" onClick={copyPixCode}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-blue-600 text-center">
                          Expira em: {new Date(pixData.pix.expires_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  )}

                  {boletoData && (
                    <div className="p-4 bg-orange-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-orange-800">Boleto Gerado</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearBoletoData}>
                          ✕
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-orange-700">Linha digitável:</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input value={boletoData.boleto.line} readOnly className="text-xs font-mono bg-card" />
                            <Button size="sm" onClick={copyBoletoLine}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild className="flex-1">
                            <a href={boletoData.boleto.url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-3 h-3 mr-1" />
                              Baixar PDF
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Printer className="w-3 h-3 mr-1" />
                            Imprimir
                          </Button>
                        </div>

                        <div className="text-xs text-orange-600 text-center">
                          Vencimento: {new Date(boletoData.boleto.expires_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Saque */}
                <Card className="border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <ArrowUpRight className="w-5 h-5" />
                    Sacar Saldo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="valor-saque">Valor do Saque</Label>
                    <Input
                      id="valor-saque"
                      type="number"
                      placeholder="0,00"
                      value={valorSaque}
                      onChange={(e) => setValorSaque(e.target.value)}
                      min="10"
                      max={user.saldo || 0}
                      step="0.01"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Disponível: {(user.saldo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="chave-pix">Chave PIX (CPF, E-mail ou Telefone)</Label>
                    <Input
                      id="chave-pix"
                      placeholder="Digite sua chave PIX"
                      value={chavePix}
                      onChange={(e) => setChavePix(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Deve ser do mesmo CPF da conta</p>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Saques são processados em até 2 horas úteis. Taxa: R$ 2,00</AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleSaque}
                    disabled={loadingSaque || !valorSaque || !chavePix}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loadingSaque ? (
                      "Processando..."
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Solicitar Saque
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Extrato */}
          <TabsContent value="extrato">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Extrato de Movimentações
                  </CardTitle>
                  <div className="flex gap-2">
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
                        className="flex items-center justify-between p-4 border rounded-lg hover:opacity-80"
                        className="bg-card"
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
          </TabsContent>

          {/* Aba Saques */}
          <TabsContent value="saques">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Solicitações de Saque
                </CardTitle>
              </CardHeader>
              <CardContent>
                {saqueRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação</h3>
                    <p className="text-muted-foreground">Suas solicitações de saque aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {saqueRequests.map((saque) => (
                      <div key={saque.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">
                              Saque via PIX -{" "}
                              {saque.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(saque.createdAt)} • {saque.chavePix}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(saque.status)}
                          {saque.motivoRejeicao && (
                            <div className="text-xs text-red-600 mt-1">{saque.motivoRejeicao}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
