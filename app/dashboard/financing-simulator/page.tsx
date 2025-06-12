"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calculator, DollarSign, CalendarDays, Percent, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function FinancingSimulatorPage() {
  const [carValue, setCarValue] = useState<string>("")
  const [downPayment, setDownPayment] = useState<string>("")
  const [installments, setInstallments] = useState<string>("48") // Default to 48
  const [customInstallments, setCustomInstallments] = useState<string>("")
  const [firstPaymentDate, setFirstPaymentDate] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("1.5") // New state for interest rate (e.g., 1.5 for 1.5%)
  const [simulationResult, setSimulationResult] = useState<{
    monthlyPayment: number
    totalPaid: number
    totalInterest: number
    principal: number
    effectiveRate: number // To store the rate used in calculation
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const predefinedInstallments = ["12", "24", "36", "48", "60", "Personalizado"]

  // Função para formatar o número para exibição (R$ 1.234,56)
  const formatCurrency = (value: number | string) => {
    if (typeof value === "string") {
      value = Number.parseFloat(value.replace(".", "").replace(",", "."))
    }
    if (isNaN(value)) return ""
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Função para lidar com a mudança do input e formatar para moeda
  const handleCurrencyInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    let value = e.target.value.replace(/\D/g, "") // Remove tudo que não é dígito
    if (value.length > 2) {
      value = value.replace(/(\d)(\d{2})$/, "$1,$2") // Adiciona vírgula para os centavos
      value = value.replace(/(\d+)(\d{3})/, "$1.$2") // Adiciona ponto para milhares
      value = value.replace(/(\d+)(\d{3})/, "$1.$2") // Repete para milhões
    }
    setter(value)
  }

  // Função para lidar com a mudança do input de taxa (permite ponto e vírgula)
  const handleRateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    let value = e.target.value.replace(",", ".") // Substitui vírgula por ponto para parsear
    // Permite apenas números e um único ponto decimal
    value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
    setter(value)
  }

  const calculateFinancing = (value: number, down: number, numInstallments: number, rate: number) => {
    const principal = value - down
    if (principal <= 0 || numInstallments <= 0 || rate <= 0) {
      return null
    }

    // Fórmula PMT (Payment per Period)
    // PMT = [ P * i * (1 + i)^n ] / [ (1 + i)^n – 1]
    const monthlyPayment =
      (principal * rate * Math.pow(1 + rate, numInstallments)) / (Math.pow(1 + rate, numInstallments) - 1)
    const totalPaid = monthlyPayment * numInstallments
    const totalInterest = totalPaid - principal

    return {
      monthlyPayment,
      totalPaid,
      totalInterest,
      principal,
      effectiveRate: rate, // Store the actual rate used
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSimulationResult(null)

    // Converte os valores formatados para números para o cálculo
    const value = Number.parseFloat(carValue.replace(".", "").replace(",", "."))
    const down = Number.parseFloat(downPayment.replace(".", "").replace(",", "."))
    const numInstallments =
      installments === "Personalizado" ? Number.parseInt(customInstallments) : Number.parseInt(installments)
    const rate = Number.parseFloat(interestRate) / 100 // Convert percentage to decimal

    if (isNaN(value) || value <= 0) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira um valor válido para o carro.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (isNaN(down) || down < 0 || down >= value) {
      toast({
        title: "Erro de Validação",
        description: "O valor da entrada deve ser válido e menor que o valor do carro.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (isNaN(numInstallments) || numInstallments <= 0) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira um número válido de parcelas.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira uma taxa de juros válida e positiva.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!firstPaymentDate) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira a data do primeiro pagamento.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const result = calculateFinancing(value, down, numInstallments, rate)

    if (result) {
      setSimulationResult(result)
      toast({
        title: "Simulação Concluída",
        description: "Confira os resultados abaixo.",
      })
    } else {
      toast({
        title: "Erro na Simulação",
        description: "Não foi possível realizar a simulação com os dados fornecidos.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Simulador de Financiamento</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Dados do Financiamento
          </CardTitle>
          <CardDescription>Preencha os campos para simular seu financiamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carValue">Valor do Carro (R$)</Label>
              <Input
                id="carValue"
                type="text"
                placeholder="Ex: 50.000,00"
                value={carValue}
                onChange={(e) => handleCurrencyInputChange(e, setCarValue)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">Valor da Entrada (R$)</Label>
              <Input
                id="downPayment"
                type="text"
                placeholder="Ex: 10.000,00"
                value={downPayment}
                onChange={(e) => handleCurrencyInputChange(e, setDownPayment)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Select value={installments} onValueChange={setInstallments} disabled={loading}>
                  <SelectTrigger id="installments">
                    <SelectValue placeholder="Selecione o número de parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedInstallments.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {installments === "Personalizado" && (
                  <Input
                    type="number"
                    placeholder="Digite o número de parcelas"
                    value={customInstallments}
                    onChange={(e) => setCustomInstallments(e.target.value)}
                    min="1"
                    required
                    className="mt-2"
                    disabled={loading}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Taxa de Juros (% ao mês)</Label>
                <Input
                  id="interestRate"
                  type="text" // Use text to allow custom formatting
                  placeholder="Ex: 1.5"
                  value={interestRate}
                  onChange={(e) => handleRateInputChange(e, setInterestRate)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstPaymentDate">Data do Primeiro Pagamento</Label>
              <Input
                id="firstPaymentDate"
                type="date"
                value={firstPaymentDate}
                onChange={(e) => setFirstPaymentDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulando...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" /> Simular Financiamento
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Nova seção de atenção */}
      <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
        <p className="text-sm italic">
          <span className="font-semibold">⚠️ Atenção:</span> Os valores apresentados no simulador são estimativas
          baseadas nas informações fornecidas. As condições reais de financiamento — incluindo taxas de abertura de
          crédito (TAC), seguros obrigatórios, IOF e outras tarifas — podem variar de acordo com cada instituição
          financeira. O Ocar não se responsabiliza pelas taxas, parcelas ou condições finais oferecidas pelos bancos e
          financeiras. Recomendamos sempre consultar diretamente a instituição de sua preferência antes de fechar
          qualquer contrato.
        </p>
      </div>

      {simulationResult && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" /> Resultado da Simulação
            </CardTitle>
            <CardDescription>Detalhes do seu financiamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <div className="text-sm font-medium text-muted-foreground mb-1">Valor Financiado</div>
                <div className="text-lg font-semibold">R$ {formatCurrency(simulationResult.principal)}</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <div className="text-sm font-medium text-muted-foreground mb-1">Parcela Mensal</div>
                <div className="text-lg font-semibold text-primary">
                  R$ {formatCurrency(simulationResult.monthlyPayment)}
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Pago</div>
                <div className="text-lg font-semibold">R$ {formatCurrency(simulationResult.totalPaid)}</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total de Juros</div>
                <div className="text-lg font-semibold text-red-500">
                  R$ {formatCurrency(simulationResult.totalInterest)}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20 border-border flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Taxa de juros simulada: {(simulationResult.effectiveRate * 100).toFixed(2)}% ao mês
              </span>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20 border-border flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Primeiro pagamento em: {new Date(firstPaymentDate + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
