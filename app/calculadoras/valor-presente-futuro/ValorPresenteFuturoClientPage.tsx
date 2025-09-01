"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinanceCalculations } from "@/hooks/use-finance-calculations"
import { Calculator, TrendingUp, TrendingDown, Calendar, Save, Download } from "lucide-react"
import { useFinanceAuth } from "@/hooks/use-finance-auth"
import { toast } from "sonner"

export default function ValorPresenteFuturoClientPage() {
  const [valor, setValor] = useState(1000)
  const [taxa, setTaxa] = useState(10)
  const [periodo, setPeriodo] = useState(5)
  const [tipoCalculo, setTipoCalculo] = useState("futuro")
  const [resultado, setResultado] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { saveCalculation } = useFinanceCalculations()
  const { user } = useFinanceAuth()

  const calcular = () => {
    // Validações
    if (valor <= 0 || taxa < 0 || periodo <= 0) {
      toast.error("Preencha todos os campos com valores válidos")
      return
    }

    const taxaDecimal = taxa / 100
    let resultadoCalculo

    if (tipoCalculo === "futuro") {
      // Valor Futuro = Valor Presente × (1 + taxa)^período
      const valorFuturo = valor * Math.pow(1 + taxaDecimal, periodo)
      const juros = valorFuturo - valor

      resultadoCalculo = {
        tipo: "Valor Futuro",
        valorOriginal: valor,
        valorCalculado: valorFuturo,
        juros,
        taxa,
        periodo,
        tipoCalculo: "futuro",
      }
    } else {
      // Valor Presente = Valor Futuro / (1 + taxa)^período
      const valorPresente = valor / Math.pow(1 + taxaDecimal, periodo)
      const desconto = valor - valorPresente

      resultadoCalculo = {
        tipo: "Valor Presente",
        valorOriginal: valor,
        valorCalculado: valorPresente,
        desconto,
        taxa,
        periodo,
        tipoCalculo: "presente",
      }
    }

    setResultado(resultadoCalculo)
    toast.success("Cálculo realizado com sucesso!")
  }

  const salvarCalculo = async () => {
    if (!user) {
      toast.error("Faça login para salvar seus cálculos")
      return
    }

    if (!resultado) {
      toast.error("Faça um cálculo primeiro")
      return
    }

    setIsSaving(true)

    try {
      const title = `${resultado.tipo} - ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(resultado.valorOriginal)} → ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(resultado.valorCalculado)}`

      await saveCalculation({
        type: "valor_presente_futuro",
        title,
        inputs: { valor, taxa, periodo, tipoCalculo },
        result: resultado,
      })

      toast.success("Cálculo salvo com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar cálculo")
    } finally {
      setIsSaving(false)
    }
  }

  const exportarResultado = () => {
    if (!resultado) {
      toast.error("Faça um cálculo primeiro")
      return
    }

    const dados = `
CALCULADORA DE VALOR PRESENTE E FUTURO
=====================================

Tipo de Cálculo: ${resultado.tipo}
Valor ${tipoCalculo === "futuro" ? "Presente" : "Futuro"}: ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(resultado.valorOriginal)}
Taxa de Juros: ${resultado.taxa}% ao ano
Período: ${resultado.periodo} anos

RESULTADO:
${resultado.tipo}: ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(resultado.valorCalculado)}
${tipoCalculo === "futuro" ? "Juros Ganhos" : "Desconto Aplicado"}: ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(tipoCalculo === "futuro" ? resultado.juros : resultado.desconto)}

Calculado em: ${new Date().toLocaleString("pt-BR")}
    `.trim()

    const blob = new Blob([dados], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `valor-presente-futuro-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Resultado exportado com sucesso!")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calculadora de Valor Presente e Futuro</h1>
        <p className="text-muted-foreground">
          Calcule o valor presente ou futuro do seu dinheiro considerando uma taxa de juros
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Dados do Cálculo
            </CardTitle>
            <CardDescription>Escolha o tipo de cálculo e preencha os dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={tipoCalculo} onValueChange={setTipoCalculo}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="futuro">Valor Futuro</TabsTrigger>
                <TabsTrigger value="presente">Valor Presente</TabsTrigger>
              </TabsList>

              <TabsContent value="futuro" className="space-y-4">
                <div>
                  <Label htmlFor="valorPresente">Valor Presente (hoje)</Label>
                  <CurrencyInput id="valorPresente" value={valor} onChange={setValor} placeholder="R$ 1.000,00" />
                  <p className="text-xs text-muted-foreground mt-1">Quanto você tem hoje para investir</p>
                </div>
              </TabsContent>

              <TabsContent value="presente" className="space-y-4">
                <div>
                  <Label htmlFor="valorFuturo">Valor Futuro (no futuro)</Label>
                  <CurrencyInput id="valorFuturo" value={valor} onChange={setValor} placeholder="R$ 1.500,00" />
                  <p className="text-xs text-muted-foreground mt-1">Quanto você quer ter no futuro</p>
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label htmlFor="taxa">Taxa de Juros (% ao ano)</Label>
              <Input
                id="taxa"
                type="number"
                step="0.01"
                value={taxa}
                onChange={(e) => setTaxa(Number(e.target.value))}
                placeholder="10.00"
              />
              <p className="text-xs text-muted-foreground mt-1">Taxa anual de rendimento</p>
            </div>

            <div>
              <Label htmlFor="periodo">Período (anos)</Label>
              <Input
                id="periodo"
                type="number"
                step="0.1"
                value={periodo}
                onChange={(e) => setPeriodo(Number(e.target.value))}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground mt-1">Tempo do investimento</p>
            </div>

            <Button onClick={calcular} className="w-full" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular {tipoCalculo === "futuro" ? "Valor Futuro" : "Valor Presente"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tipoCalculo === "futuro" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              Resultado do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{resultado.tipo}</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(resultado.valorCalculado)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-muted-foreground">
                      {tipoCalculo === "futuro" ? "Valor Presente" : "Valor Futuro"}
                    </span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resultado.valorOriginal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-muted-foreground">Taxa de Juros</span>
                    <span className="font-semibold">{resultado.taxa}% ao ano</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-muted-foreground">Período</span>
                    <span className="font-semibold">{resultado.periodo} anos</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-muted-foreground">
                      {tipoCalculo === "futuro" ? "Juros Ganhos" : "Desconto Aplicado"}
                    </span>
                    <span className="font-semibold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(tipoCalculo === "futuro" ? resultado.juros : resultado.desconto)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button onClick={exportarResultado} variant="outline" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Resultado
                  </Button>
                  {user && (
                    <Button
                      onClick={salvarCalculo}
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={isSaving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Salvando..." : "Salvar Cálculo"}
                    </Button>
                  )}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Interpretação:</h4>
                  <p className="text-sm text-muted-foreground">
                    {tipoCalculo === "futuro"
                      ? `Se você investir ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(resultado.valorOriginal)} hoje a uma taxa de ${resultado.taxa}% ao ano, em ${resultado.periodo} anos você terá ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(resultado.valorCalculado)}.`
                      : `Para ter ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(resultado.valorOriginal)} em ${resultado.periodo} anos, você precisa investir ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(resultado.valorCalculado)} hoje a uma taxa de ${resultado.taxa}% ao ano.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Preencha os dados e clique em calcular para ver os resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção Educativa */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Entendendo Valor Presente e Futuro</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Valor Futuro (VF)</h3>
              <p className="text-muted-foreground mb-3">
                O valor futuro é quanto um investimento vale em uma data futura, considerando uma taxa de juros
                específica.
              </p>
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-mono text-sm">VF = VP × (1 + i)^n</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Valor Presente (VP)</h3>
              <p className="text-muted-foreground mb-3">
                O valor presente é quanto um valor futuro vale hoje, descontado por uma taxa de juros.
              </p>
              <div className="bg-green-50 p-3 rounded">
                <p className="font-mono text-sm">VP = VF / (1 + i)^n</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Onde:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <strong>VP</strong> = Valor Presente
              </li>
              <li>
                <strong>VF</strong> = Valor Futuro
              </li>
              <li>
                <strong>i</strong> = Taxa de juros (decimal)
              </li>
              <li>
                <strong>n</strong> = Número de períodos
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
