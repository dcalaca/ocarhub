"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useFinanceCalculations } from "@/hooks/use-finance-calculations"
import { Calculator, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { toast } from "sonner"
import { useFinanceAuth } from "@/hooks/use-finance-auth"

export default function JurosCompostosClientPage() {
  const [valorInicial, setValorInicial] = useState(0)
  const [aporteMensal, setAporteMensal] = useState(0)
  const [taxa, setTaxa] = useState(0)
  const [periodo, setPeriodo] = useState(0)
  const [tipoTaxa, setTipoTaxa] = useState("anual")
  const [tipoPeriodo, setTipoPeriodo] = useState("anos")
  const [resultado, setResultado] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const { saveCalculation } = useFinanceCalculations()
  const { user } = useFinanceAuth()

  const calcularJurosCompostos = () => {
    // Validações corrigidas
    if (valorInicial <= 0) {
      toast.error("O valor inicial deve ser maior que zero")
      return
    }

    if (aporteMensal < 0) {
      toast.error("O aporte mensal não pode ser negativo")
      return
    }

    if (taxa <= 0) {
      toast.error("A taxa de juros deve ser maior que zero")
      return
    }

    if (periodo <= 0) {
      toast.error("O período deve ser maior que zero")
      return
    }

    // Converter para valores corretos
    const taxaMensal = tipoTaxa === "anual" ? Math.pow(1 + taxa / 100, 1 / 12) - 1 : taxa / 100
    const periodoMeses = tipoPeriodo === "anos" ? periodo * 12 : periodo

    // Calcular montante final
    let montante = valorInicial
    let totalAportes = 0

    // Simular mês a mês
    for (let mes = 1; mes <= periodoMeses; mes++) {
      montante = montante * (1 + taxaMensal) + aporteMensal
      totalAportes += aporteMensal
    }

    const totalInvestido = valorInicial + totalAportes
    const totalJuros = montante - totalInvestido
    const rentabilidadeTotal = totalInvestido > 0 ? (montante / totalInvestido - 1) * 100 : 0

    // Dados para gráfico
    const dadosGrafico = []
    let montanteTemp = valorInicial
    let aportesTemp = 0

    const pontos = Math.min(12, periodoMeses) // Máximo 12 pontos no gráfico
    const intervalo = Math.max(1, Math.floor(periodoMeses / pontos))

    for (let i = 0; i <= periodoMeses; i += intervalo) {
      if (i > 0) {
        for (let j = 0; j < intervalo && i - intervalo + j < periodoMeses; j++) {
          montanteTemp = montanteTemp * (1 + taxaMensal) + aporteMensal
          aportesTemp += aporteMensal
        }
      }

      dadosGrafico.push({
        periodo: tipoPeriodo === "anos" ? (i / 12).toFixed(1) : i,
        valor: montanteTemp,
        aportes: valorInicial + aportesTemp,
        juros: montanteTemp - valorInicial - aportesTemp,
      })
    }

    const resultadoCalculo = {
      montanteFinal: montante,
      totalInvestido,
      totalJuros,
      rentabilidade: rentabilidadeTotal,
      dadosGrafico,
    }

    setResultado(resultadoCalculo)
    setChartData(dadosGrafico)
    toast.success("Cálculo realizado com sucesso!")

    // Salvar cálculo
    if (user) {
      saveCalculation({
        type: "juros_compostos",
        title: `Juros Compostos - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorInicial)}`,
        inputs: { valorInicial, aporteMensal, taxa, periodo, tipoTaxa, tipoPeriodo },
        result: resultadoCalculo,
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calculadora de Juros Compostos</h1>
        <p className="text-muted-foreground">
          Descubra o poder dos juros compostos e veja como seus investimentos podem crescer ao longo do tempo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Dados do Investimento
            </CardTitle>
            <CardDescription>Preencha os dados para calcular o crescimento do seu investimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valorInicial">Valor Inicial</Label>
              <CurrencyInput id="valorInicial" value={valorInicial} onChange={setValorInicial} />
            </div>

            <div>
              <Label htmlFor="aporte">Aporte Mensal</Label>
              <CurrencyInput id="aporte" value={aporteMensal} onChange={setAporteMensal} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxa">Taxa de Juros (%)</Label>
                <Input
                  id="taxa"
                  type="number"
                  step="0.01"
                  value={taxa || ""}
                  onChange={(e) => setTaxa(Number(e.target.value))}
                  placeholder="12.00"
                />
              </div>
              <div>
                <Label>Período da Taxa</Label>
                <Select value={tipoTaxa} onValueChange={setTipoTaxa}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="periodo">Período</Label>
                <Input
                  id="periodo"
                  type="number"
                  value={periodo || ""}
                  onChange={(e) => setPeriodo(Number(e.target.value))}
                  placeholder=""
                />
              </div>
              <div>
                <Label>Unidade</Label>
                <Select value={tipoPeriodo} onValueChange={setTipoPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meses">Meses</SelectItem>
                    <SelectItem value="anos">Anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calcularJurosCompostos} className="w-full">
              Calcular Juros Compostos
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Montante Final</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.montanteFinal)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Total Investido</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.totalInvestido)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Juros Ganhos</p>
                    <p className="text-xl font-bold text-purple-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.totalJuros)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rentabilidade</p>
                    <p className="text-xl font-bold text-orange-600">{resultado.rentabilidade.toFixed(2)}%</p>
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="periodo"
                          label={{
                            value: tipoPeriodo === "anos" ? "Anos" : "Meses",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              notation: "compact",
                            }).format(value)
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(value),
                          ]}
                        />
                        <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} name="Montante" />
                        <Line type="monotone" dataKey="aportes" stroke="#3b82f6" strokeWidth={2} name="Investido" />
                        <Line type="monotone" dataKey="juros" stroke="#8b5cf6" strokeWidth={2} name="Juros" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Preencha os dados e clique em calcular para ver os resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção Educativa */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Como funcionam os Juros Compostos?</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            Os juros compostos são conhecidos como "juros sobre juros". Isso significa que você ganha rendimentos não
            apenas sobre o valor inicial investido, mas também sobre os juros acumulados em períodos anteriores.
          </p>
          <h3>Fórmula dos Juros Compostos:</h3>
          <p className="font-mono bg-gray-100 p-2 rounded">M = C × (1 + i)^t + PMT × [((1 + i)^t - 1) / i]</p>
          <ul>
            <li>
              <strong>M</strong> = Montante final
            </li>
            <li>
              <strong>C</strong> = Capital inicial
            </li>
            <li>
              <strong>i</strong> = Taxa de juros
            </li>
            <li>
              <strong>t</strong> = Tempo
            </li>
            <li>
              <strong>PMT</strong> = Pagamento (aporte) regular
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
