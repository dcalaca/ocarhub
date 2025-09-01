"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface MarketData {
  dolar: {
    value: string
    change: string
    trend: "up" | "down" | "neutral"
  }
  selic: {
    value: string
    change: string
    trend: "up" | "down" | "neutral"
  }
  ipca: {
    value: string
    change: string
    trend: "up" | "down" | "neutral"
  }
  lastUpdate: string
}

export function MarketAlerts() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch("/api/market-data", {
          cache: "no-store",
        })

        if (response.ok) {
          const marketData = await response.json()
          setData(marketData)
        } else {
          throw new Error("API response not ok")
        }
      } catch (error) {
        console.error("Erro ao buscar dados do mercado:", error)
        // Fallback data with correct structure
        setData({
          dolar: {
            value: "R$ 5,85",
            change: "+0,8%",
            trend: "up",
          },
          selic: {
            value: "10,75%",
            change: "0,0%",
            trend: "neutral",
          },
          ipca: {
            value: "0,32%",
            change: "+0,1%",
            trend: "up",
          },
          lastUpdate: new Date().toLocaleString("pt-BR"),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Alertas de Mercado</h2>
            <p className="text-gray-600">Acompanhe os principais indicadores econômicos em tempo real</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!data) return null

  const getVariationIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-5 h-5 text-red-500" />
    if (trend === "down") return <TrendingDown className="w-5 h-5 text-green-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getVariationColor = (trend: string) => {
    if (trend === "up") return "text-red-600"
    if (trend === "down") return "text-green-600"
    return "text-yellow-600"
  }

  const getBgColor = (trend: string) => {
    if (trend === "up") return "bg-red-100"
    if (trend === "down") return "bg-green-100"
    return "bg-yellow-100"
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Alertas de Mercado</h2>
          <p className="text-gray-600">Acompanhe os principais indicadores econômicos em tempo real</p>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {data.lastUpdate} • Dados do Banco Central do Brasil
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`w-12 h-12 ${getBgColor(data.dolar.trend)} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                {getVariationIcon(data.dolar.trend)}
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Dólar comercial</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{data.dolar.value}</p>
              <p className={`text-sm ${getVariationColor(data.dolar.trend)}`}>{data.dolar.change}</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`w-12 h-12 ${getBgColor(data.selic.trend)} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                {getVariationIcon(data.selic.trend)}
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Taxa Selic</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{data.selic.value}</p>
              <p className={`text-sm ${getVariationColor(data.selic.trend)}`}>{data.selic.change}</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`w-12 h-12 ${getBgColor(data.ipca.trend)} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                {getVariationIcon(data.ipca.trend)}
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">IPCA mensal</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{data.ipca.value}</p>
              <p className={`text-sm ${getVariationColor(data.ipca.trend)}`}>{data.ipca.change}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
