"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Check, AlertCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fipeService } from "@/lib/fipe-service"

interface FipeSelectorProps {
  brandId: string
  modelId: string
  year: number
  onSelect: (value: { price: number; fipeCode: string }) => void
}

export function FipeSelector({ brandId, modelId, year, onSelect }: FipeSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [fipeData, setFipeData] = useState<{ price: number; fipeCode: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const searchFipe = async () => {
    if (!brandId || !modelId || !year) {
      setError("Selecione marca, modelo e ano para consultar a tabela FIPE")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Buscar dados reais da FIPE
      const result = await fipeService.quickSearch(brandId, modelId, year)
      
      if (!result) {
        setError("Veículo não encontrado na tabela FIPE. Verifique os dados selecionados.")
        return
      }

      setFipeData({ price: result.price, fipeCode: result.fipeCode })
      onSelect({ price: result.price, fipeCode: result.fipeCode })
    } catch (err) {
      console.error('Erro ao consultar FIPE:', err)
      setError("Erro ao consultar tabela FIPE. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Tabela FIPE</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  A Tabela FIPE (Fundação Instituto de Pesquisas Econômicas) é uma referência de preços médios de
                  veículos no mercado brasileiro.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!fipeData ? (
        <div className="flex gap-2">
          <Button onClick={searchFipe} disabled={loading || !brandId || !modelId || !year} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar Tabela FIPE
              </>
            )}
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Valor na tabela FIPE:</p>
                <p className="text-lg font-bold">
                  {fipeData?.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Código FIPE: {fipeData?.fipeCode}</p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">Consultado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
