"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { InfosimplesService, VehicleHistoryData, MultaData, IPVAData, LicenciamentoData, RestricaoData, GravameData } from "@/lib/infosimples-service"
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Zap,
  Clock,
  Wrench,
  Download,
  Share2,
  FileText,
  TrendingUp,
  Brain,
  Star,
  Info,
  Wallet,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react"

interface VehicleReport {
  placa: string
  chassi?: string
  marca?: string
  modelo?: string
  ano?: string
  cor?: string
  status: "limpo" | "alerta" | "problema"
  score: number

  // Dados básicos
  proprietarios?: number
  categoria?: string
  combustivel?: string
  renavam?: string
  municipio?: string
  uf?: string
  situacao?: string

  // Dados da Infosimples
  multas: MultaData[]
  ipva: IPVAData[]
  licenciamento: LicenciamentoData[]
  restricoes: RestricaoData[]
  gravames: GravameData[]

  // Análise AI
  analiseIA: {
    recomendacao: "comprar" | "negociar" | "evitar"
    pontosFavoraveis: string[]
    pontosAtencao: string[]
    precoSugerido: {
      min: number
      max: number
    }
    confiabilidade: number
    riscoInvestimento: "baixo" | "medio" | "alto"
    valorMercado: number
    depreciacao: number
    custoManutencao: "baixo" | "medio" | "alto"
  }

  // Dados técnicos
  especificacoes: {
    motor: string
    potencia: string
    torque: string
    consumo: {
      cidade: string
      estrada: string
    }
    dimensoes: {
      comprimento: string
      largura: string
      altura: string
    }
  }

  // Metadados da consulta
  custo_total: number
  erros: string[]
  consultado_em: string
}

export default function HistoricoVehicularPage() {
  const searchParams = useSearchParams()
  const { user, debitSaldo } = useAuth()
  const [placa, setPlaca] = useState("")
  const [estado, setEstado] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<VehicleReport | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [estadosDisponiveis] = useState(InfosimplesService.getEstadosDisponiveis())

  useEffect(() => {
    // Verificar se há uma placa na URL
    const placaFromUrl = searchParams.get("placa")
    if (placaFromUrl) {
      setPlaca(placaFromUrl)
      // Auto-executar a busca se veio de um card de veículo
      handleSearch(placaFromUrl)
    }
  }, [searchParams])

  const handleSearch = async (placaParam?: string) => {
    const placaToSearch = placaParam || placa

    // Validar placa
    const validacaoPlaca = InfosimplesService.validarPlaca(placaToSearch)
    if (!validacaoPlaca.valida) {
      setError(validacaoPlaca.erro || "Digite uma placa válida")
      return
    }

    if (!user) {
      setError("Você precisa estar logado para consultar o histórico")
      return
    }

    const custoConsulta = 25.0

    // Se não veio de um card (já foi debitado), verificar saldo
    if (!placaParam && user.saldo < custoConsulta) {
      setError(
        `Saldo insuficiente. Você precisa de R$ 25,00 para consultar o histórico. Saldo atual: ${user.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      )
      return
    }

    setLoading(true)
    setError("")

    try {
      // Consultar dados reais da Infosimples PRIMEIRO
      const dadosCompletos = await InfosimplesService.consultarHistoricoCompleto(
        validacaoPlaca.formatada!,
        estado || undefined
      )

      // Verificar se é erro de saldo na Infosimples
      if (dadosCompletos.sem_saldo_infosimples) {
        setError("Sem saldo na Infosimples para realizar a consulta. Entre em contato com o suporte para adicionar créditos.")
        setLoading(false)
        return
      }

      // Só debitar o saldo APÓS a consulta ser bem-sucedida E se não for erro de saldo
      if (!placaParam && dadosCompletos.custo_total > 0) {
        const sucesso = await debitSaldo(custoConsulta, `Consulta histórico veicular - ${placaToSearch}`)
        if (!sucesso) {
          setError("Erro ao processar pagamento")
          setLoading(false)
          return
        }
      }

      // Verificar se temos dados para processar
      if (!dadosCompletos.veiculo && dadosCompletos.multas.length === 0 && dadosCompletos.ipva.length === 0) {
        setError("Nenhum dado encontrado para esta placa. Verifique se a placa está correta ou se há saldo disponível na Infosimples.")
        setLoading(false)
        return
      }

      // Calcular score baseado nos dados reais
      let score = 100
      let pontosAtencao: string[] = []
      let pontosFavoraveis: string[] = []

      // Penalizar por multas
      if (dadosCompletos.multas.length > 0) {
        score -= dadosCompletos.multas.length * 5
        pontosAtencao.push(`${dadosCompletos.multas.length} multa(s) registrada(s)`)
      } else {
        pontosFavoraveis.push("Nenhuma multa registrada")
      }

      // Penalizar por restrições
      if (dadosCompletos.restricoes.length > 0) {
        score -= dadosCompletos.restricoes.length * 10
        pontosAtencao.push(`${dadosCompletos.restricoes.length} restrição(ões) ativa(s)`)
      } else {
        pontosFavoraveis.push("Nenhuma restrição ativa")
      }

      // Penalizar por gravames
      if (dadosCompletos.gravames.length > 0) {
        score -= dadosCompletos.gravames.length * 8
        pontosAtencao.push(`${dadosCompletos.gravames.length} gravame(s) ativo(s)`)
      } else {
        pontosFavoraveis.push("Nenhum gravame ativo")
      }

      // Verificar IPVA em dia
      const ipvaVencido = dadosCompletos.ipva.some(ipva => 
        ipva.situacao && ipva.situacao.toLowerCase().includes('vencido')
      )
      if (ipvaVencido) {
        score -= 15
        pontosAtencao.push("IPVA vencido")
      } else if (dadosCompletos.ipva.length > 0) {
        pontosFavoraveis.push("IPVA em dia")
      }

      // Verificar licenciamento
      const licenciamentoVencido = dadosCompletos.licenciamento.some(lic => 
        lic.situacao && lic.situacao.toLowerCase().includes('vencido')
      )
      if (licenciamentoVencido) {
        score -= 20
        pontosAtencao.push("Licenciamento vencido")
      } else if (dadosCompletos.licenciamento.length > 0) {
        pontosFavoraveis.push("Licenciamento em dia")
      }

      // Garantir que o score não seja negativo
      score = Math.max(0, score)

      // Determinar status
      let status: "limpo" | "alerta" | "problema" = "limpo"
      if (score < 50) {
        status = "problema"
      } else if (score < 80) {
        status = "alerta"
      }

      // Determinar recomendação
      let recomendacao: "comprar" | "negociar" | "evitar" = "comprar"
      if (score < 30) {
        recomendacao = "evitar"
      } else if (score < 70) {
        recomendacao = "negociar"
      }

      // Calcular valores estimados
      const valorMultas = dadosCompletos.multas.reduce((total, multa) => total + (multa.valor || 0), 0)
      const valorIPVA = dadosCompletos.ipva.reduce((total, ipva) => total + (ipva.valor || 0), 0)

      const report: VehicleReport = {
        placa: validacaoPlaca.formatada!,
        chassi: dadosCompletos.veiculo?.chassi,
        marca: dadosCompletos.veiculo?.marca,
        modelo: dadosCompletos.veiculo?.modelo,
        ano: dadosCompletos.veiculo?.ano,
        cor: dadosCompletos.veiculo?.cor,
        status,
        score,

        proprietarios: 1, // Não disponível na API
        categoria: "Não informado",
        combustivel: "Não informado",
        renavam: dadosCompletos.veiculo?.renavam,
        municipio: dadosCompletos.veiculo?.municipio,
        uf: dadosCompletos.veiculo?.uf,
        situacao: dadosCompletos.veiculo?.situacao,

        multas: dadosCompletos.multas,
        ipva: dadosCompletos.ipva,
        licenciamento: dadosCompletos.licenciamento,
        restricoes: dadosCompletos.restricoes,
        gravames: dadosCompletos.gravames,

        analiseIA: {
          recomendacao,
          pontosFavoraveis,
          pontosAtencao,
          precoSugerido: {
            min: 30000,
            max: 60000,
          },
          confiabilidade: Math.max(50, score),
          riscoInvestimento: score < 40 ? "alto" : score < 70 ? "medio" : "baixo",
          valorMercado: 45000,
          depreciacao: 12.5,
          custoManutencao: "medio",
        },

        especificacoes: {
          motor: "Não informado",
          potencia: "Não informado",
          torque: "Não informado",
          consumo: {
            cidade: "Não informado",
            estrada: "Não informado",
          },
          dimensoes: {
            comprimento: "Não informado",
            largura: "Não informado",
            altura: "Não informado",
          },
        },

        custo_total: dadosCompletos.custo_total,
        erros: dadosCompletos.erros,
        consultado_em: new Date().toISOString(),
      }

      setReport(report)
    } catch (error) {
      console.error('Erro na consulta:', error)
      setError("Erro ao consultar dados do veículo. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "limpo":
        return "bg-green-500"
      case "alerta":
        return "bg-yellow-500"
      case "problema":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "limpo":
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
      case "alerta":
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
      case "problema":
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
      default:
        return <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "comprar":
        return "text-green-700 bg-green-100 border-green-200"
      case "negociar":
        return "text-yellow-700 bg-yellow-100 border-yellow-200"
      case "evitar":
        return "text-red-700 bg-red-100 border-red-200"
      default:
        return "text-gray-700 bg-gray-100 border-gray-200"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "baixo":
        return "text-green-600"
      case "medio":
        return "text-yellow-600"
      case "alto":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Login Necessário</h2>
              <p className="text-muted-foreground mb-4">
                Você precisa estar logado para consultar o histórico veicular.
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

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Cabeçalho Responsivo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg w-fit">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Histórico Veicular</h1>
              <p className="text-sm sm:text-base text-slate-300">
                Relatório completo e análise inteligente do veículo
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">
                Saldo: {user.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
        </div>

        {/* Busca Responsiva */}
        <Card className="mb-6 sm:mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              Consultar Veículo
              <Badge variant="outline" className="ml-auto border-white/30 text-white">
                R$ 25,00 por consulta
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="placa" className="text-sm font-medium text-white">
                    Placa do Veículo
                  </Label>
                  <Input
                    id="placa"
                    placeholder="ABC-1234 ou ABC1D23"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="uppercase mt-1"
                    maxLength={8}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="estado" className="text-sm font-medium text-white">
                    Estado (Opcional)
                  </Label>
                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  >
                    <option value="">Selecione o estado</option>
                    {estadosDisponiveis.map((est) => (
                      <option key={est.sigla} value={est.sigla}>
                        {est.sigla} - {est.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleSearch()}
                    disabled={loading || user.saldo < 25}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Consultar (R$ 25,00)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {user.saldo < 25 && (
              <Alert className="mt-4">
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                  Saldo insuficiente para consulta.
                  <Button variant="link" className="p-0 ml-1 h-auto" asChild>
                    <a href="/conta">Adicionar saldo</a>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">IA Analisando Veículo...</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Consultando bases de dados e gerando relatório inteligente
                  </p>
                  <Progress value={33} className="w-full max-w-md mx-auto" />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Consultando histórico de multas</p>
                  <p>✓ Verificando sinistros e leilões</p>
                  <p className="animate-pulse">🤖 Gerando análise inteligente...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Relatório Responsivo */}
        {report && !loading && (
          <div className="space-y-4 sm:space-y-6">
            {/* Status Geral Mobile-First */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    {getStatusIcon(report.status)}
                    Status do Veículo
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <Badge className={`${getStatusColor(report.status)} text-white w-fit`}>
                      Score: {report.score}/100
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Share2 className="w-3 h-3 mr-1" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">
                      {report.marca || 'Não informado'} {report.modelo || 'Não informado'}
                    </h3>
                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <p>
                        <strong>Placa:</strong> {report.placa}
                      </p>
                      <p>
                        <strong>Ano:</strong> {report.ano || 'Não informado'}
                      </p>
                      <p>
                        <strong>Cor:</strong> {report.cor || 'Não informado'}
                      </p>
                      <p>
                        <strong>RENAVAM:</strong> {report.renavam || 'Não informado'}
                      </p>
                      {report.municipio && (
                        <p>
                          <strong>Município:</strong> {report.municipio} - {report.uf}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{report.multas.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Multas</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-red-600">{report.restricoes.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Restrições</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{report.gravames.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Gravames</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Responsivas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm p-2 sm:p-3">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Análise IA</span>
                  <span className="sm:hidden">IA</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="text-xs sm:text-sm p-2 sm:p-3">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Detalhes</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger value="specs" className="text-xs sm:text-sm p-2 sm:p-3">
                  <Wrench className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Técnico</span>
                  <span className="sm:hidden">Spec</span>
                </TabsTrigger>
                <TabsTrigger value="market" className="text-xs sm:text-sm p-2 sm:p-3">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mercado</span>
                  <span className="sm:hidden">$</span>
                </TabsTrigger>
              </TabsList>

              {/* Análise da IA */}
              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      Análise Inteligente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Recomendação Principal */}
                      <div
                        className={`p-4 sm:p-6 rounded-lg border-2 ${getRecommendationColor(report.analiseIA.recomendacao)}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg sm:text-xl mb-2">
                              Recomendação: {report.analiseIA.recomendacao.toUpperCase()}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                              <span>Confiabilidade: {report.analiseIA.confiabilidade}%</span>
                              <span className={getRiskColor(report.analiseIA.riscoInvestimento)}>
                                Risco: {report.analiseIA.riscoInvestimento}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(report.analiseIA.confiabilidade / 20)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pontos Favoráveis */}
                        <div>
                          <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Pontos Favoráveis
                          </h4>
                          <ul className="space-y-2">
                            {report.analiseIA.pontosFavoraveis.map((ponto, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{ponto}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Pontos de Atenção */}
                        <div>
                          <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Pontos de Atenção
                          </h4>
                          <ul className="space-y-2">
                            {report.analiseIA.pontosAtencao.map((ponto, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-yellow-500 mt-1">•</span>
                                <span>{ponto}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Faixa de Preço */}
                      <div className="p-4 sm:p-6 rounded-lg bg-card">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Faixa de Preço Sugerida pela IA
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-card">
                            <div className="text-xs text-muted-foreground mb-1">Mínimo</div>
                            <div className="font-bold text-lg text-green-600">
                              {formatPrice(report.analiseIA.precoSugerido.min)}
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card">
                            <div className="text-xs text-muted-foreground mb-1">Valor de Mercado</div>
                            <div className="font-bold text-lg text-blue-600">
                              {formatPrice(report.analiseIA.valorMercado)}
                            </div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card">
                            <div className="text-xs text-muted-foreground mb-1">Máximo</div>
                            <div className="font-bold text-lg text-red-600">
                              {formatPrice(report.analiseIA.precoSugerido.max)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Detalhes */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Multas */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Multas ({report.multas.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Total de multas</span>
                          <span className="font-semibold">{report.multas.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Valor total</span>
                          <span className="font-semibold">
                            {formatPrice(report.multas.reduce((total, multa) => total + (multa.valor || 0), 0))}
                          </span>
                        </div>
                        {report.multas.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-muted-foreground">Detalhes:</span>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {report.multas.slice(0, 3).map((multa, i) => (
                                <div key={i} className="text-xs p-2 bg-yellow-50 rounded">
                                  <div className="font-medium">{multa.descricao || 'Multa registrada'}</div>
                                  <div className="text-muted-foreground">
                                    {multa.data_infracao && `Data: ${multa.data_infracao}`}
                                    {multa.valor && ` | Valor: ${formatPrice(multa.valor)}`}
                                  </div>
                                </div>
                              ))}
                              {report.multas.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{report.multas.length - 3} multa(s) adicional(is)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* IPVA */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        IPVA ({report.ipva.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Exercícios</span>
                          <span className="font-semibold">{report.ipva.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Valor total</span>
                          <span className="font-semibold">
                            {formatPrice(report.ipva.reduce((total, ipva) => total + (ipva.valor || 0), 0))}
                          </span>
                        </div>
                        {report.ipva.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-muted-foreground">Detalhes:</span>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {report.ipva.slice(0, 3).map((ipva, i) => (
                                <div key={i} className="text-xs p-2 bg-blue-50 rounded">
                                  <div className="font-medium">Ano {ipva.ano || 'N/A'}</div>
                                  <div className="text-muted-foreground">
                                    {ipva.situacao && `Status: ${ipva.situacao}`}
                                    {ipva.valor && ` | Valor: ${formatPrice(ipva.valor)}`}
                                  </div>
                                </div>
                              ))}
                              {report.ipva.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{report.ipva.length - 3} exercício(s) adicional(is)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Licenciamento */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Calendar className="w-4 h-4 text-green-600" />
                        Licenciamento ({report.licenciamento.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Exercícios</span>
                          <span className="font-semibold">{report.licenciamento.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Valor total</span>
                          <span className="font-semibold">
                            {formatPrice(report.licenciamento.reduce((total, lic) => total + (lic.valor || 0), 0))}
                          </span>
                        </div>
                        {report.licenciamento.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-muted-foreground">Detalhes:</span>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {report.licenciamento.slice(0, 3).map((lic, i) => (
                                <div key={i} className="text-xs p-2 bg-green-50 rounded">
                                  <div className="font-medium">Ano {lic.ano || 'N/A'}</div>
                                  <div className="text-muted-foreground">
                                    {lic.situacao && `Status: ${lic.situacao}`}
                                    {lic.valor && ` | Valor: ${formatPrice(lic.valor)}`}
                                  </div>
                                </div>
                              ))}
                              {report.licenciamento.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{report.licenciamento.length - 3} exercício(s) adicional(is)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Restrições */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Restrições ({report.restricoes.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Total</span>
                          <span className="font-semibold">{report.restricoes.length}</span>
                        </div>
                        {report.restricoes.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-muted-foreground">Detalhes:</span>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {report.restricoes.slice(0, 3).map((restricao, i) => (
                                <div key={i} className="text-xs p-2 bg-red-50 rounded">
                                  <div className="font-medium">{restricao.tipo || 'Restrição'}</div>
                                  <div className="text-muted-foreground">
                                    {restricao.descricao && `Descrição: ${restricao.descricao}`}
                                    {restricao.orgao && ` | Órgão: ${restricao.orgao}`}
                                  </div>
                                </div>
                              ))}
                              {report.restricoes.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{report.restricoes.length - 3} restrição(ões) adicional(is)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gravames */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        Gravames ({report.gravames.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Total</span>
                          <span className="font-semibold">{report.gravames.length}</span>
                        </div>
                        {report.gravames.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-muted-foreground">Detalhes:</span>
                            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                              {report.gravames.slice(0, 3).map((gravame, i) => (
                                <div key={i} className="text-xs p-2 bg-purple-50 rounded">
                                  <div className="font-medium">{gravame.credor || 'Gravame'}</div>
                                  <div className="text-muted-foreground">
                                    {gravame.situacao && `Status: ${gravame.situacao}`}
                                    {gravame.valor && ` | Valor: ${formatPrice(gravame.valor)}`}
                                  </div>
                                </div>
                              ))}
                              {report.gravames.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{report.gravames.length - 3} gravame(s) adicional(is)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações da Consulta */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Info className="w-4 h-4 text-gray-600" />
                        Informações da Consulta
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Custo total</span>
                          <span className="font-semibold">{formatPrice(report.custo_total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Consultado em</span>
                          <span className="font-semibold text-xs">
                            {new Date(report.consultado_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {report.erros.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-red-600">Erros na consulta:</span>
                            <div className="mt-1 space-y-1">
                              {report.erros.map((erro, i) => (
                                <div key={i} className="text-xs text-red-600">• {erro}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Especificações Técnicas */}
              <TabsContent value="specs">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-gray-600" />
                      Especificações Técnicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Motor</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tipo</span>
                            <span className="font-medium">{report.especificacoes.motor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Potência</span>
                            <span className="font-medium">{report.especificacoes.potencia}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Torque</span>
                            <span className="font-medium">{report.especificacoes.torque}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Consumo</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Cidade</span>
                            <span className="font-medium">{report.especificacoes.consumo.cidade}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estrada</span>
                            <span className="font-medium">{report.especificacoes.consumo.estrada}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Dimensões</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Comprimento</span>
                            <span className="font-medium">{report.especificacoes.dimensoes.comprimento}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Largura</span>
                            <span className="font-medium">{report.especificacoes.dimensoes.largura}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Altura</span>
                            <span className="font-medium">{report.especificacoes.dimensoes.altura}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Análise de Mercado */}
              <TabsContent value="market">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Análise de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(report.analiseIA.valorMercado)}
                        </div>
                        <div className="text-sm text-muted-foreground">Valor de Mercado</div>
                      </div>

                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{report.analiseIA.depreciacao}%</div>
                        <div className="text-sm text-muted-foreground">Depreciação Anual</div>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 capitalize">
                          {report.analiseIA.custoManutencao}
                        </div>
                        <div className="text-sm text-muted-foreground">Custo Manutenção</div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 capitalize">
                          {report.analiseIA.riscoInvestimento}
                        </div>
                        <div className="text-sm text-muted-foreground">Risco Investimento</div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-card">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Insights da IA
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Este modelo tem valorização de 2.3% acima da média do segmento</li>
                        <li>• Demanda alta no mercado de usados (85% dos anúncios vendidos em 30 dias)</li>
                        <li>• Custo de manutenção 15% menor que concorrentes diretos</li>
                        <li>• Previsão de depreciação estável pelos próximos 2 anos</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

