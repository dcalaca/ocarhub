"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, CreditCard, Smartphone, Loader2, Check } from "lucide-react"

export default function CRLVPurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [vehicleId] = useState<string>(params.vehicleId as string)
  const [vehicleData, setVehicleData] = useState<any>(null)

  useEffect(() => {
    // Simula carregamento dos dados do veículo
    const loadVehicleData = async () => {
      setIsLoading(true)
      try {
        // Em produção, isso viria do banco de dados
        // Simulando dados para demonstração
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setVehicleData({
          id: vehicleId,
          plate: "ABC1D23",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          color: "Prata",
        })
      } catch (error) {
        console.error("Erro ao carregar dados do veículo:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do veículo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadVehicleData()
  }, [vehicleId, toast])

  const handlePurchase = async (paymentMethod: "pix" | "credit_card") => {
    setIsProcessing(true)

    try {
      // Simula processamento do pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setShowSuccess(true)
      toast({
        title: "Pagamento realizado!",
        description: "Seu CRLV Digital está sendo processado e estará disponível em instantes.",
      })

      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push("/dashboard/my-vehicles")
      }, 3000)
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h2>
            <p className="text-muted-foreground mb-4">
              Seu CRLV Digital está sendo processado e estará disponível em instantes.
            </p>
            <p className="text-sm text-muted-foreground">Redirecionando para seus veículos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/my-vehicles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Emitir CRLV Digital</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalhes do Veículo
          </CardTitle>
          <CardDescription>
            Confira os dados do veículo antes de prosseguir com a emissão do CRLV Digital.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/20 border-border">
              <p className="text-sm font-medium text-muted-foreground">Placa</p>
              <p className="text-lg font-semibold">{vehicleData?.plate || "Não informado"}</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20 border-border">
              <p className="text-sm font-medium text-muted-foreground">Marca/Modelo</p>
              <p className="text-lg font-semibold">
                {vehicleData?.brand} {vehicleData?.model}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20 border-border">
              <p className="text-sm font-medium text-muted-foreground">Ano</p>
              <p className="text-lg font-semibold">{vehicleData?.year}</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20 border-border">
              <p className="text-sm font-medium text-muted-foreground">Cor</p>
              <p className="text-lg font-semibold">{vehicleData?.color}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Emissão do CRLV Digital
          </CardTitle>
          <CardDescription>Escolha a forma de pagamento para emitir o CRLV Digital.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-primary/10 border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">CRLV Digital</h3>
                <p className="text-muted-foreground">Documento digital do veículo</p>
              </div>
              <div className="text-xl font-bold text-primary">R$ 15,00</div>
            </div>
          </div>

          <Tabs defaultValue="pix" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix">PIX</TabsTrigger>
              <TabsTrigger value="credit_card">Cartão de Crédito</TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Pagamento via PIX</h3>
                      <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                    </div>
                  </div>
                  <Button onClick={() => handlePurchase("pix")} disabled={isProcessing} className="w-full" size="lg">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      "Pagar R$ 15,00 via PIX"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credit_card" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Cartão de Crédito</h3>
                      <p className="text-sm text-muted-foreground">Pagamento em até 3x sem juros</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePurchase("credit_card")}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      "Pagar R$ 15,00 no Cartão"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-sm text-muted-foreground mt-4">
            <p>
              Ao concluir o pagamento, você terá acesso ao CRLV Digital do seu veículo, que ficará disponível
              permanentemente em seu perfil.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
