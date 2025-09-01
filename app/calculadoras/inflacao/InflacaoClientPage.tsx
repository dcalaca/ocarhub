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
import { Percent, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { toast } from "sonner"
import { useFinanceAuth } from "@/hooks/use-finance-auth"

export default function InflacaoClientPage() {
  const [valorInicial, setValorInicial] = useState(1000)
  const [taxaInflacao, setTaxaInflacao] = useState(4.5)
  const [periodo, setPeriodo] = useState(10)
  const [tipoPeriodo, setTipoPeriodo] = useState("anos")
  const [resultado, setResultado] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const { saveCalculation } = useFinanceCalculations()
  const { user } = useFinanceAuth()

  const calcularInflacao = () => {
    if (valorInicial <= 0 || taxaInflacao < 0 || periodo <= 0) {
      toast.error("Preencha todos os campos com valores válidos")
      return
    }

    const taxaAnual = taxaInflacao / 100
    const periodoAnos = tipoPeriodo === "anos" ? periodo : periodo / 12

    // Calcular poder de compra ao longo do tempo
    const valorFuturo = valorInicial / Math.pow(1 + taxaAnual, periodoAnos)
    const perdaPoder = valorInicial - valorFuturo
    const percentualPerda = (perdaPoder / valorInicial) * 100

    // Dados para gráfico
    const dadosGrafico = []
    const pontos = Math.min(20, Math.ceil(periodoAnos))

    for (let i = 0; i <= pontos; i++) {
      const ano = (periodoAnos / pontos) * i
      const poderCompra = valorInicial / Math.pow(1 + taxaAnual, ano)
      const perdaAcumulada = valorInicial - poderCompra

      dadosGrafico.push({
        ano: ano.toFixed(1),
        poderCompra: poderCompra,
        perdaAcumulada: perdaAcumulada,
        valorNominal: valorInicial,
      })
    }

    const resultadoCalculo = {
      valorInicial,
      valorFuturo,
      perdaPoder,
      percentualPerda,
      taxaInflacao,
      periodo: periodoAnos,
      dadosGrafico,
    }

    setResultado(resultadoCalculo)
    setChartData(dadosGrafico)
    toast.success("Cálculo realizado com sucesso!")

    // Salvar cálculo se usuário estiver logado
    if (user) {
      saveCalculation({
        type: "inflacao",
        title: `Inflação ${taxaInflacao}% - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorInicial)}`,
        inputs: { valorInicial, taxaInflacao, periodo, tipoPeriodo },
        result: resultadoCalculo,
      })
    }
  }

  const exemplosInflacao = [
    { periodo: "2023", taxa: 4.62, descricao: "IPCA 2023" },
    { periodo: "2022", taxa: 5.79, descricao: "IPCA 2022" },
    { periodo: "2021", taxa: 10.06, descricao: "IPCA 2021" },
    { periodo: "Média 10 anos", taxa: 6.5, descricao: "Média histórica" },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calculadora de Inflação</h1>
        <p className="text-muted-foreground">
          Veja como a inflação afeta o poder de compra do seu dinheiro ao longo do tempo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Dados da Simulação
            </CardTitle>
            <CardDescription>Preencha os dados para calcular o impacto da inflação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valorInicial">Valor Atual</Label>
              <CurrencyInput
                id="valorInicial"
                value={valorInicial}
                onChange={setValorInicial}
                placeholder="R$ 1.000,00"
              />
            </div>

            <div>
              <Label htmlFor="taxa">Taxa de Inflação (% ao ano)</Label>
              <Input
                id="taxa"
                type="number"
                step="0.01"
                value={taxaInflacao}
                onChange={(e) => setTaxaInflacao(Number(e.target.value))}
                placeholder="4.50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="periodo">Período</Label>
                <Input
                  id="periodo"
                  type="number"
                  value={periodo}
                  onChange={(e) => setPeriodo(Number(e.target.value))}
                  placeholder="10"
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

            <Button onClick={calcularInflacao} className="w-full">
              <Percent className="w-4 h-4 mr-2" />
              Calcular Impacto da Inflação
            </Button>

            {/* Exemplos de inflação */}
            <div className="mt-6">
              <Label className="text-sm font-medium">Exemplos de Inflação (IPCA):</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {exemplosInflacao.map((exemplo, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setTaxaInflacao(exemplo.taxa)}
                    className="text-xs p-2 h-auto flex-col"
                  >
                    <span className="font-semibold">{exemplo.taxa}%</span>
                    <span className="text-muted-foreground">{exemplo.periodo}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Impacto da Inflação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Valor Hoje</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.valorInicial)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Poder de Compra Futuro</p>
                    <p className="text-2xl font-bold text-red-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.valorFuturo)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Perda de Poder</p>
                    <p className="text-xl font-bold text-orange-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.perdaPoder)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Percentual de Perda</p>
                    <p className="text-xl font-bold text-purple-600">{resultado.percentualPerda.toFixed(2)}%</p>
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="h-64">
                    <h4 className="text-sm font-medium mb-2">Evolução do Poder de Compra</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="ano"
                          label={{
                            value: "Anos",
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
                        <Line
                          type="monotone"
                          dataKey="valorNominal"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Valor Nominal"
                          strokeDasharray="5 5"
                        />
                        <Line
                          type="monotone"
                          dataKey="poderCompra"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Poder de Compra"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Interpretação:</h4>
                  <p className="text-sm text-muted-foreground">
                    Com uma inflação de {resultado.taxaInflacao}% ao ano, em {resultado.periodo.toFixed(1)} anos,
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      resultado.valorInicial,
                    )}
                    de hoje terá o mesmo poder de compra que
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      resultado.valorFuturo,
                    )}
                    no futuro. Você perderá {resultado.percentualPerda.toFixed(1)}% do poder de compra.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Percent className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Preencha os dados e clique em calcular para ver o impacto da inflação
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção Educativa */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Entendendo a Inflação</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">O que é Inflação?</h3>
              <p className="text-muted-foreground mb-3">
                A inflação é o aumento generalizado e contínuo dos preços de bens e serviços em uma economia. Ela reduz
                o poder de compra da moeda ao longo do tempo.
              </p>
              <h4 className="font-semibold mb-2">Principais Causas:</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Aumento da demanda por produtos</li>
                <li>• Elevação dos custos de produção</li>
                <li>• Expansão da oferta de moeda</li>
                <li>• Expectativas inflacionárias</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Como se Proteger?</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  • <strong>Investimentos indexados:</strong> Tesouro IPCA+, CDBs pós-fixados
                </li>
                <li>
                  • <strong>Ações:</strong> Empresas podem repassar inflação aos preços
                </li>
                <li>
                  • <strong>Fundos imobiliários:</strong> Aluguéis tendem a acompanhar inflação
                </li>
                <li>
                  • <strong>Moedas estrangeiras:</strong> Diversificação cambial
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">IPCA - Índice Nacional de Preços ao Consumidor Amplo</h4>
            <p className="text-sm text-muted-foreground">
              O IPCA é o índice oficial de inflação do Brasil, calculado pelo IBGE. Ele mede a variação de preços de uma
              cesta de produtos e serviços consumidos por famílias com renda de 1 a 40 salários mínimos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
