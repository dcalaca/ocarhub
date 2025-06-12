"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, DollarSign, BarChart2 } from "lucide-react"

export default function FipeComparisonPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Tabela FIPE e Comparação de Preços</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Consulte e Compare
          </CardTitle>
          <CardDescription>
            Visualize o preço FIPE do veículo e compare com a média de anúncios do mercado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Esta funcionalidade permite que você insira os dados de um veículo e veja seu valor de referência pela
            Tabela FIPE, além de uma comparação com os preços médios de anúncios em grandes plataformas como Webmotors,
            OLX e iCarros.
          </p>
          <p className="text-muted-foreground flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Em breve, você poderá tomar decisões de compra e venda ainda mais informadas!
          </p>
          {/* Aqui você pode adicionar um formulário para buscar o veículo e exibir os resultados */}
          <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
            Funcionalidade em desenvolvimento.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
