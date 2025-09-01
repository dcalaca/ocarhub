"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PiggyBank, Calculator, TrendingUp } from "lucide-react"

export default function AposentadoriaPageClient() {
  const [idadeAtual, setIdadeAtual] = useState("")
  const [idadeAposentadoria, setIdadeAposentadoria] = useState("")
  const [rendaDesejada, setRendaDesejada] = useState("")
  const [valorAtual, setValorAtual] = useState("")
  const [contribuicaoMensal, setContribuicaoMensal] = useState("")
  const [taxaJuros, setTaxaJuros] = useState("0.5")
  const [resultado, setResultado] = useState<any>(null)

  const calcular = () => {
    const idade = Number.parseInt(idadeAtual)
    const idadeApos = Number.parseInt(idadeAposentadoria)
    const renda = Number.parseFloat(rendaDesejada)
    const valorInicial = Number.parseFloat(valorAtual) || 0
    const contribuicao = Number.parseFloat(contribuicaoMensal) || 0
    const taxa = Number.parseFloat(taxaJuros) / 100

    if (!idade || !idadeApos || !renda || idade >= idadeApos) {
      alert("Por favor, preencha todos os campos corretamente")
      return
    }

    const anosParaAposentadoria = idadeApos - idade
    const mesesParaAposentadoria = anosParaAposentadoria * 12
    const taxaMensal = taxa / 12

    // Valor futuro do montante atual
    const valorFuturoAtual = valorInicial * Math.pow(1 + taxaMensal, mesesParaAposentadoria)

    // Valor futuro das contribuições mensais
    const valorFuturoContribuicoes =
      contribuicao * ((Math.pow(1 + taxaMensal, mesesParaAposentadoria) - 1) / taxaMensal)

    const montanteTotal = valorFuturoAtual + valorFuturoContribuicoes

    // Valor necessário para gerar a renda desejada (considerando 4% de saque anual)
    const valorNecessario = (renda * 12) / 0.04

    const deficit = valorNecessario - montanteTotal
    const contribuicaoNecessaria =
      deficit > 0 ? (deficit * taxaMensal) / (Math.pow(1 + taxaMensal, mesesParaAposentadoria) - 1) : 0

    setResultado({
      anosParaAposentadoria,
      montanteTotal,
      valorNecessario,
      deficit: deficit > 0 ? deficit : 0,
      contribuicaoNecessaria: contribuicaoNecessaria > 0 ? contribuicaoNecessaria : 0,
      situacao: montanteTotal >= valorNecessario ? "adequada" : "insuficiente",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <PiggyBank className="w-8 h-8 text-blue-600" />
            Calculadora de Aposentadoria
          </h1>
          <p className="text-muted-foreground">
            Planeje sua aposentadoria e descubra quanto precisa poupar para atingir sua renda desejada
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Dados para Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="idadeAtual">Idade Atual</Label>
                  <Input
                    id="idadeAtual"
                    type="number"
                    placeholder="Ex: 30"
                    value={idadeAtual}
                    onChange={(e) => setIdadeAtual(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="idadeAposentadoria">Idade para Aposentadoria</Label>
                  <Input
                    id="idadeAposentadoria"
                    type="number"
                    placeholder="Ex: 65"
                    value={idadeAposentadoria}
                    onChange={(e) => setIdadeAposentadoria(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rendaDesejada">Renda Mensal Desejada (R$)</Label>
                <Input
                  id="rendaDesejada"
                  type="number"
                  placeholder="Ex: 5000"
                  value={rendaDesejada}
                  onChange={(e) => setRendaDesejada(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="valorAtual">Valor Já Poupado (R$)</Label>
                <Input
                  id="valorAtual"
                  type="number"
                  placeholder="Ex: 50000"
                  value={valorAtual}
                  onChange={(e) => setValorAtual(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="contribuicaoMensal">Contribuição Mensal Atual (R$)</Label>
                <Input
                  id="contribuicaoMensal"
                  type="number"
                  placeholder="Ex: 1000"
                  value={contribuicaoMensal}
                  onChange={(e) => setContribuicaoMensal(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="taxaJuros">Taxa de Juros Mensal (%)</Label>
                <Input
                  id="taxaJuros"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 0.5"
                  value={taxaJuros}
                  onChange={(e) => setTaxaJuros(e.target.value)}
                />
              </div>

              <Button onClick={calcular} className="w-full">
                Calcular Aposentadoria
              </Button>
            </CardContent>
          </Card>

          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Resultado da Simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Anos para aposentadoria</p>
                    <p className="text-2xl font-bold text-blue-600">{resultado.anosParaAposentadoria} anos</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Montante acumulado</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(resultado.montanteTotal)}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor necessário</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(resultado.valorNecessario)}</p>
                  </div>

                  {resultado.situacao === "insuficiente" && (
                    <>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Déficit</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(resultado.deficit)}</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Contribuição adicional necessária</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(resultado.contribuicaoNecessaria)}/mês
                        </p>
                      </div>
                    </>
                  )}

                  <div
                    className={`p-4 rounded-lg ${resultado.situacao === "adequada" ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <p className="font-semibold">
                      {resultado.situacao === "adequada"
                        ? "✅ Parabéns! Sua estratégia atual é suficiente para atingir sua meta de aposentadoria."
                        : "⚠️ Sua estratégia atual é insuficiente. Considere aumentar suas contribuições mensais."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
