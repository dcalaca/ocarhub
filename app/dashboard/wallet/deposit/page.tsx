"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Smartphone, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const predefinedAmounts = [10, 25, 50, 100, 200]

  const handleDeposit = async (paymentMethod: "pix" | "credit_card") => {
    const depositAmount = Number.parseFloat(amount)

    if (!depositAmount || depositAmount < 5) {
      toast({
        title: "Valor inválido",
        description: "O valor mínimo para depósito é R$ 5,00",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simula processamento do pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setShowSuccess(true)
      toast({
        title: "Depósito realizado!",
        description: `R$ ${depositAmount.toFixed(2)} adicionados à sua carteira`,
      })

      // Redireciona após 2 segundos
      setTimeout(() => {
        router.push("/dashboard/wallet")
      }, 2000)
    } catch (error) {
      toast({
        title: "Erro no depósito",
        description: "Ocorreu um erro ao processar o depósito",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Depósito Realizado!</h2>
            <p className="text-muted-foreground mb-4">
              R$ {Number.parseFloat(amount).toFixed(2)} foram adicionados à sua carteira
            </p>
            <p className="text-sm text-muted-foreground">Redirecionando para a carteira...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/wallet">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Adicionar Saldo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escolha o valor</CardTitle>
          <CardDescription>Selecione um valor ou digite o valor desejado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valores predefinidos */}
          <div>
            <Label className="text-base font-medium">Valores sugeridos</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {predefinedAmounts.map((value) => (
                <Button
                  key={value}
                  variant={amount === value.toString() ? "default" : "outline"}
                  onClick={() => setAmount(value.toString())}
                  className="h-12"
                >
                  R$ {value}
                </Button>
              ))}
            </div>
          </div>

          {/* Valor personalizado */}
          <div>
            <Label htmlFor="amount">Ou digite o valor</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="5"
              step="0.01"
              className="text-lg h-12"
            />
            <p className="text-sm text-muted-foreground mt-1">Valor mínimo: R$ 5,00</p>
          </div>

          {/* Métodos de pagamento */}
          {amount && Number.parseFloat(amount) >= 5 && (
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
                    <Button onClick={() => handleDeposit("pix")} disabled={isProcessing} className="w-full" size="lg">
                      {isProcessing ? "Processando..." : `Pagar R$ ${Number.parseFloat(amount).toFixed(2)} via PIX`}
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
                        <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeposit("credit_card")}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? "Processando..." : `Pagar R$ ${Number.parseFloat(amount).toFixed(2)} no Cartão`}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
