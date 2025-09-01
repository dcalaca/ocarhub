"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinanceCalculations } from "@/hooks/use-finance-calculations"
import { Coins, ArrowRightLeft, TrendingUp, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useFinanceAuth } from "@/hooks/use-finance-auth"

interface CurrencyRate {
  code: string
  name: string
  rate: number
  symbol: string
  bid?: number
  ask?: number
  variation?: number
  timestamp?: string
}

export default function ConversorMoedasClientPage() {
  const [valor, setValor] = useState(1)
  const [moedaOrigem, setMoedaOrigem] = useState("USD")
  const [moedaDestino, setMoedaDestino] = useState("BRL")
  const [resultado, setResultado] = useState<number | null>(null)
  const [taxas, setTaxas] = useState<Record<string, CurrencyRate>>({})
  const [loading, setLoading] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [fonte, setFonte] = useState<string>("")

  const { saveCalculation } = useFinanceCalculations()
  const { user } = useFinanceAuth()

  const moedas = [
    { code: "USD", name: "Dólar Americano", symbol: "$" },
    { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "Libra Esterlina", symbol: "£" },
    { code: "JPY", name: "Iene Japonês", symbol: "¥" },
    { code: "CAD", name: "Dólar Canadense", symbol: "C$" },
    { code: "AUD", name: "Dólar Australiano", symbol: "A$" },
    { code: "CHF", name: "Franco Suíço", symbol: "CHF" },
    { code: "ARS", name: "Peso Argentino", symbol: "$" },
    { code: "CLP", name: "Peso Chileno", symbol: "$" },
  ]

  // Buscar cotações da AwesomeAPI (API brasileira mais precisa)
  const buscarCotacoesAwesome = async () => {
    try {
      const pares = ["USD-BRL", "EUR-BRL", "GBP-BRL", "JPY-BRL", "CAD-BRL", "AUD-BRL", "CHF-BRL", "ARS-BRL", "CLP-BRL"]

      const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${pares.join(",")}`)
      const data = await response.json()

      const taxasFormatadas: Record<string, CurrencyRate> = {
        BRL: {
          code: "BRL",
          name: "Real Brasileiro",
          rate: 1,
          symbol: "R$",
          bid: 1,
          ask: 1,
          variation: 0,
          timestamp: new Date().toISOString(),
        },
      }

      // Processar dados da AwesomeAPI
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        const currency = key.replace("BRL", "")
        const moeda = moedas.find((m) => m.code === currency)

        if (moeda) {
          taxasFormatadas[currency] = {
            code: currency,
            name: moeda.name,
            rate: Number.parseFloat(value.bid),
            symbol: moeda.symbol,
            bid: Number.parseFloat(value.bid),
            ask: Number.parseFloat(value.ask),
            variation: Number.parseFloat(value.pctChange),
            timestamp: value.create_date,
          }
        }
      })

      return { taxas: taxasFormatadas, fonte: "AwesomeAPI (Economia)" }
    } catch (error) {
      console.error("Erro na AwesomeAPI:", error)
      throw error
    }
  }

  // Buscar cotações do Banco Central (backup)
  const buscarCotacoesBacen = async () => {
    try {
      const hoje = new Date()
      const dataFormatada = hoje.toISOString().split("T")[0].replace(/-/g, "")

      // Códigos do Banco Central
      const codigosBacen = {
        USD: 1, // Dólar americano
        EUR: 222, // Euro
        GBP: 312, // Libra esterlina
        JPY: 158, // Iene japonês
        CAD: 25, // Dólar canadense
        AUD: 5, // Dólar australiano
        CHF: 39, // Franco suíço
        ARS: 3, // Peso argentino
      }

      const promises = Object.entries(codigosBacen).map(async ([currency, codigo]) => {
        try {
          const response = await fetch(
            `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`,
          )
          const data = await response.json()

          if (data && data.length > 0) {
            const moeda = moedas.find((m) => m.code === currency)
            return {
              [currency]: {
                code: currency,
                name: moeda?.name || currency,
                rate: Number.parseFloat(data[0].valor),
                symbol: moeda?.symbol || currency,
                timestamp: data[0].data,
              },
            }
          }
          return null
        } catch (error) {
          console.error(`Erro ao buscar ${currency}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      const taxasFormatadas: Record<string, CurrencyRate> = {
        BRL: {
          code: "BRL",
          name: "Real Brasileiro",
          rate: 1,
          symbol: "R$",
          timestamp: new Date().toISOString(),
        },
      }

      results.forEach((result) => {
        if (result) {
          Object.assign(taxasFormatadas, result)
        }
      })

      return { taxas: taxasFormatadas, fonte: "Banco Central do Brasil" }
    } catch (error) {
      console.error("Erro no Banco Central:", error)
      throw error
    }
  }

  // Cotações de fallback
  const cotacoesFallback = () => {
    const taxasPadrao: Record<string, CurrencyRate> = {
      USD: { code: "USD", name: "Dólar Americano", rate: 5.85, symbol: "$" },
      BRL: { code: "BRL", name: "Real Brasileiro", rate: 1, symbol: "R$" },
      EUR: { code: "EUR", name: "Euro", rate: 6.35, symbol: "€" },
      GBP: { code: "GBP", name: "Libra Esterlina", rate: 7.25, symbol: "£" },
      JPY: { code: "JPY", name: "Iene Japonês", rate: 0.039, symbol: "¥" },
      CAD: { code: "CAD", name: "Dólar Canadense", rate: 4.25, symbol: "C$" },
      AUD: { code: "AUD", name: "Dólar Australiano", rate: 3.85, symbol: "A$" },
      CHF: { code: "CHF", name: "Franco Suíço", rate: 6.45, symbol: "CHF" },
      ARS: { code: "ARS", name: "Peso Argentino", rate: 0.0065, symbol: "$" },
      CLP: { code: "CLP", name: "Peso Chileno", rate: 0.0062, symbol: "$" },
    }
    return { taxas: taxasPadrao, fonte: "Valores de Referência" }
  }

  // Buscar cotações com fallback
  const buscarCotacoes = async () => {
    setLoading(true)
    try {
      // Tentar AwesomeAPI primeiro (mais precisa para BRL)
      try {
        const { taxas: taxasAwesome, fonte: fonteAwesome } = await buscarCotacoesAwesome()
        setTaxas(taxasAwesome)
        setFonte(fonteAwesome)
        setUltimaAtualizacao(new Date())
        toast.success("Cotações atualizadas com sucesso!")
        return
      } catch (error) {
        console.log("AwesomeAPI falhou, tentando Banco Central...")
      }

      // Tentar Banco Central como backup
      try {
        const { taxas: taxasBacen, fonte: fonteBacen } = await buscarCotacoesBacen()
        setTaxas(taxasBacen)
        setFonte(fonteBacen)
        setUltimaAtualizacao(new Date())
        toast.success("Cotações atualizadas (Banco Central)!")
        return
      } catch (error) {
        console.log("Banco Central falhou, usando valores de referência...")
      }

      // Usar valores de fallback
      const { taxas: taxasFallback, fonte: fonteFallback } = cotacoesFallback()
      setTaxas(taxasFallback)
      setFonte(fonteFallback)
      setUltimaAtualizacao(new Date())
      toast.error("Erro ao buscar cotações online. Usando valores de referência.")
    } catch (error) {
      console.error("Erro geral:", error)
      const { taxas: taxasFallback, fonte: fonteFallback } = cotacoesFallback()
      setTaxas(taxasFallback)
      setFonte(fonteFallback)
      setUltimaAtualizacao(new Date())
      toast.error("Erro ao buscar cotações. Usando valores de referência.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar cotações ao montar o componente
  useEffect(() => {
    buscarCotacoes()
  }, [])

  // Converter moedas
  const converter = () => {
    if (!taxas[moedaOrigem] || !taxas[moedaDestino] || valor <= 0) {
      toast.error("Preencha todos os campos corretamente")
      return
    }

    let valorConvertido: number

    if (moedaOrigem === "BRL") {
      // De BRL para outra moeda
      valorConvertido = valor / taxas[moedaDestino].rate
    } else if (moedaDestino === "BRL") {
      // De outra moeda para BRL
      valorConvertido = valor * taxas[moedaOrigem].rate
    } else {
      // Entre duas moedas estrangeiras (via BRL)
      const valorEmBRL = valor * taxas[moedaOrigem].rate
      valorConvertido = valorEmBRL / taxas[moedaDestino].rate
    }

    setResultado(valorConvertido)

    // Salvar cálculo se usuário estiver logado
    if (user) {
      const dadosCalculo = {
        valor,
        moedaOrigem,
        moedaDestino,
        resultado: valorConvertido,
        taxaOrigem: taxas[moedaOrigem].rate,
        taxaDestino: taxas[moedaDestino].rate,
        fonte,
        dataConversao: new Date().toISOString(),
      }

      saveCalculation({
        type: "conversor_moedas",
        title: `${valor} ${moedaOrigem} → ${valorConvertido.toFixed(2)} ${moedaDestino}`,
        inputs: dadosCalculo,
        result: dadosCalculo,
      })
    }

    toast.success("Conversão realizada com sucesso!")
  }

  // Trocar moedas de lugar
  const trocarMoedas = () => {
    const temp = moedaOrigem
    setMoedaOrigem(moedaDestino)
    setMoedaDestino(temp)
    if (resultado) {
      setValor(resultado)
      setResultado(valor)
    }
  }

  const formatarMoeda = (valor: number, codigo: string) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: codigo === "JPY" ? 0 : 2,
      maximumFractionDigits: codigo === "JPY" ? 0 : 4,
    }).format(valor)
  }

  const calcularTaxaCruzada = () => {
    if (!taxas[moedaOrigem] || !taxas[moedaDestino]) return 0

    if (moedaOrigem === "BRL") {
      return 1 / taxas[moedaDestino].rate
    } else if (moedaDestino === "BRL") {
      return taxas[moedaOrigem].rate
    } else {
      return taxas[moedaOrigem].rate / taxas[moedaDestino].rate
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversor de Moedas</h1>
        <p className="text-muted-foreground">Converta moedas com cotações atualizadas em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Conversão de Moedas
            </CardTitle>
            <CardDescription>
              <div className="space-y-1">
                {ultimaAtualizacao && (
                  <div className="text-sm">
                    <strong>Última atualização:</strong> {ultimaAtualizacao.toLocaleString("pt-BR")}
                  </div>
                )}
                {fonte && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Fonte: {fonte}
                  </div>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                placeholder="1.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label>De</Label>
                <Select value={moedaOrigem} onValueChange={setMoedaOrigem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moedas.map((moeda) => (
                      <SelectItem key={moeda.code} value={moeda.code}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{moeda.code}</span>
                          <span>{moeda.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={trocarMoedas}
                  className="mb-2 bg-transparent"
                  title="Trocar moedas"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label>Para</Label>
                <Select value={moedaDestino} onValueChange={setMoedaDestino}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moedas.map((moeda) => (
                      <SelectItem key={moeda.code} value={moeda.code}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{moeda.code}</span>
                          <span>{moeda.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={converter} className="flex-1" disabled={loading}>
                <Coins className="w-4 h-4 mr-2" />
                Converter
              </Button>
              <Button variant="outline" onClick={buscarCotacoes} disabled={loading} title="Atualizar cotações">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resultado da Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado !== null ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatarMoeda(valor, moedaOrigem)} {moedaOrigem}
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatarMoeda(resultado, moedaDestino)} {moedaDestino}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taxa: 1 {moedaOrigem} = {formatarMoeda(calcularTaxaCruzada(), moedaDestino)} {moedaDestino}
                  </div>
                </div>

                {taxas[moedaOrigem] && taxas[moedaDestino] && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Moeda Origem</div>
                      <div className="font-semibold">{taxas[moedaOrigem].name}</div>
                      <div className="text-sm">{taxas[moedaOrigem].symbol}</div>
                      {taxas[moedaOrigem].variation && (
                        <div
                          className={`text-xs ${taxas[moedaOrigem].variation! > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {taxas[moedaOrigem].variation! > 0 ? "+" : ""}
                          {taxas[moedaOrigem].variation!.toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Moeda Destino</div>
                      <div className="font-semibold">{taxas[moedaDestino].name}</div>
                      <div className="text-sm">{taxas[moedaDestino].symbol}</div>
                      {taxas[moedaDestino].variation && (
                        <div
                          className={`text-xs ${taxas[moedaDestino].variation! > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {taxas[moedaDestino].variation! > 0 ? "+" : ""}
                          {taxas[moedaDestino].variation!.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Informações:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cotações atualizadas em tempo real</li>
                    <li>• Fonte: {fonte}</li>
                    <li>• Valores podem variar conforme o mercado</li>
                    <li>• Para transações oficiais, consulte seu banco</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Coins className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Preencha os dados e clique em converter para ver o resultado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Cotações */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Cotações Atuais</CardTitle>
          <CardDescription>Cotações em relação ao Real Brasileiro (BRL) • Fonte: {fonte}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(taxas)
              .filter((moeda) => moeda.code !== "BRL")
              .map((moeda) => (
                <div key={moeda.code} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{moeda.code}</div>
                      <div className="text-sm text-muted-foreground">{moeda.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">R$ {moeda.rate.toFixed(4)}</div>
                      <div className="text-sm text-muted-foreground">{moeda.symbol}</div>
                      {moeda.variation && (
                        <div className={`text-xs ${moeda.variation > 0 ? "text-green-600" : "text-red-600"}`}>
                          {moeda.variation > 0 ? "+" : ""}
                          {moeda.variation.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
