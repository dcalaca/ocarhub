"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, TrendingUp, BarChart3, Plus, Trash2 } from "lucide-react"

interface Investimento {
  id: number
  nome: string
  valorInicial: number
  contribuicaoMensal: number
  taxaJuros: number
  prazo: number
  tipo: string
}

export default function InvestimentosClientPage() {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([])
  const [novoInvestimento, setNovoInvestimento] = useState({
    nome: "",
    valorInicial: "",
    contribuicaoMensal: "",
    taxaJuros: "",
    prazo: "",
    tipo: "",
  })
  const [resultados, setResultados] = useState<any[]>([])

  const tiposInvestimento = [
    { value: "poupanca", label: "Poupança", taxaSugerida: "0.5" },
    { value: "cdb", label: "CDB", taxaSugerida: "0.8" },
    { value: "tesouro-selic", label: "Tesouro Selic", taxaSugerida: "0.9" },
    { value: "tesouro-ipca", label: "Tesouro IPCA+", taxaSugerida: "1.0" },
    { value: "fundos-renda-fixa", label: "Fundos Renda Fixa", taxaSugerida: "0.7" },
    { value: "acoes", label: "Ações", taxaSugerida: "1.2" },
    { value: "fundos-imobiliarios", label: "Fundos Imobiliários", taxaSugerida: "1.0" },
    { value: "personalizado", label: "Personalizado", taxaSugerida: "0.5" },
  ]

  const adicionarInvestimento = () => {
    if (
      !novoInvestimento.nome ||
      !novoInvestimento.valorInicial ||
      !novoInvestimento.taxaJuros ||
      !novoInvestimento.prazo
    ) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const investimento: Investimento = {
      id: Date.now(),
      nome: novoInvestimento.nome,
      valorInicial: Number.parseFloat(novoInvestimento.valorInicial),
      contribuicaoMensal: Number.parseFloat(novoInvestimento.contribuicaoMensal) || 0,
      taxaJuros: Number.parseFloat(novoInvestimento.taxaJuros),
      prazo: Number.parseInt(novoInvestimento.prazo),
      tipo: novoInvestimento.tipo,
    }

    setInvestimentos([...investimentos, investimento])
    setNovoInvestimento({
      nome: "",
      valorInicial: "",
      contribuicaoMensal: "",
      taxaJuros: "",
      prazo: "",
      tipo: "",
    })
  }

  const removerInvestimento = (id: number) => {
    setInvestimentos(investimentos.filter((inv) => inv.id !== id))
  }

  const calcularComparacao = () => {
    if (investimentos.length === 0) {
      alert("Adicione pelo menos um investimento para comparar")
      return
    }

    const resultadosCalculados = investimentos.map((inv) => {
      const taxaMensal = inv.taxaJuros / 100 / 12
      const meses = inv.prazo * 12

      // Valor futuro do montante inicial
      const valorFuturoInicial = inv.valorInicial * Math.pow(1 + taxaMensal, meses)

      // Valor futuro das contribuições mensais
      const valorFuturoContribuicoes =
        inv.contribuicaoMensal > 0 ? inv.contribuicaoMensal * ((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal) : 0

      const valorFinal = valorFuturoInicial + valorFuturoContribuicoes
      const valorInvestido = inv.valorInicial + inv.contribuicaoMensal * meses
      const lucro = valorFinal - valorInvestido
      const rentabilidadeTotal = (valorFinal / valorInvestido - 1) * 100
      const rentabilidadeAnual = Math.pow(valorFinal / valorInvestido, 1 / inv.prazo) - 1

      return {
        ...inv,
        valorFinal,
        valorInvestido,
        lucro,
        rentabilidadeTotal,
        rentabilidadeAnual: rentabilidadeAnual * 100,
      }
    })

    // Ordenar por valor final (maior para menor)
    resultadosCalculados.sort((a, b) => b.valorFinal - a.valorFinal)
    setResultados(resultadosCalculados)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const handleTipoChange = (tipo: string) => {
    const tipoSelecionado = tiposInvestimento.find((t) => t.value === tipo)
    setNovoInvestimento({
      ...novoInvestimento,
      tipo,
      taxaJuros: tipoSelecionado?.taxaSugerida || "",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Target className="w-8 h-8 text-blue-600" />
            Comparação de Investimentos
          </h1>
          <p className="text-muted-foreground">
            Compare diferentes opções de investimento e encontre a melhor estratégia para seus objetivos
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário para adicionar investimentos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Investimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Investimento</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: CDB Banco X"
                    value={novoInvestimento.nome}
                    onChange={(e) => setNovoInvestimento({ ...novoInvestimento, nome: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo de Investimento</Label>
                  <Select value={novoInvestimento.tipo} onValueChange={handleTipoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposInvestimento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valorInicial">Valor Inicial (R$)</Label>
                  <Input
                    id="valorInicial"
                    type="number"
                    placeholder="Ex: 10000"
                    value={novoInvestimento.valorInicial}
                    onChange={(e) => setNovoInvestimento({ ...novoInvestimento, valorInicial: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contribuicaoMensal">Contribuição Mensal (R$)</Label>
                  <Input
                    id="contribuicaoMensal"
                    type="number"
                    placeholder="Ex: 500 (opcional)"
                    value={novoInvestimento.contribuicaoMensal}
                    onChange={(e) => setNovoInvestimento({ ...novoInvestimento, contribuicaoMensal: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="taxaJuros">Taxa de Juros Mensal (%)</Label>
                  <Input
                    id="taxaJuros"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 0.8"
                    value={novoInvestimento.taxaJuros}
                    onChange={(e) => setNovoInvestimento({ ...novoInvestimento, taxaJuros: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="prazo">Prazo (anos)</Label>
                  <Input
                    id="prazo"
                    type="number"
                    placeholder="Ex: 5"
                    value={novoInvestimento.prazo}
                    onChange={(e) => setNovoInvestimento({ ...novoInvestimento, prazo: e.target.value })}
                  />
                </div>

                <Button onClick={adicionarInvestimento} className="w-full">
                  Adicionar Investimento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de investimentos e resultados */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investimentos adicionados */}
            {investimentos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Investimentos Adicionados ({investimentos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investimentos.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{inv.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(inv.valorInicial)} inicial • {formatCurrency(inv.contribuicaoMensal)}/mês •{" "}
                            {inv.taxaJuros}% a.m. • {inv.prazo} anos
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removerInvestimento(inv.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={calcularComparacao} className="w-full mt-4">
                    Comparar Investimentos
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Resultados da comparação */}
            {resultados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resultados da Comparação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resultados.map((resultado, index) => (
                      <div
                        key={resultado.id}
                        className={`p-4 rounded-lg border-2 ${
                          index === 0 ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            {index === 0 && <span className="text-green-600">🏆</span>}
                            {resultado.nome}
                            {index === 0 && (
                              <span className="text-sm bg-green-600 text-white px-2 py-1 rounded">MELHOR</span>
                            )}
                          </h3>
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Final</p>
                            <p className="font-bold text-lg text-green-600">{formatCurrency(resultado.valorFinal)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lucro</p>
                            <p className="font-bold text-lg text-blue-600">{formatCurrency(resultado.lucro)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rentabilidade Total</p>
                            <p className="font-bold text-lg text-purple-600">
                              {formatPercent(resultado.rentabilidadeTotal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rentabilidade Anual</p>
                            <p className="font-bold text-lg text-orange-600">
                              {formatPercent(resultado.rentabilidadeAnual)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-muted-foreground">
                            Valor investido: {formatCurrency(resultado.valorInvestido)} • Prazo: {resultado.prazo} anos
                            • Taxa: {resultado.taxaJuros}% a.m.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
