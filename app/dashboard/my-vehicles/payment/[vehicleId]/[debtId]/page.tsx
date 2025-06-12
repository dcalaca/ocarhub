"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CreditCard, Smartphone, Loader2, Check, Receipt, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DebtPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)
  const [vehicleId] = useState<string>(params.vehicleId as string)
  const [debtId] = useState<string>(params.debtId as string)
  const [vehicleData, setVehicleData] = useState<any>(null)
  const [debts, setDebts] = useState<any[]>([])
  const [installments, setInstallments] = useState<string>("1")

  useEffect(() => {
    // Simula carregamento dos dados do veículo e débitos
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Em produção, isso viria do banco de dados
        // Simulando dados para demonstração
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockVehicle = {
          id: vehicleId,
          plate: "ABC1D23",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          color: "Prata",
        }

        setVehicleData(mockVehicle)

        // Gera débitos simulados
        const mockDebts = []

        if (debtId === "all") {
          // Todos os débitos
          mockDebts.push(
            {
              id: `ipva_${mockVehicle.plate}_2023`,
              type: "ipva",
              description: "IPVA 2023",
              amount: 1247.8,
              dueDate: "30/04/2023",
              status: "pending",
            },
            {
              id: `license_${mockVehicle.plate}_2023`,
              type: "license",
              description: "Licenciamento 2023",
              amount: 98.91,
              dueDate: "30/06/2023",
              status: "pending",
            },
            {
              id: `fine_${mockVehicle.plate}_1`,
              type: "fine",
              description: "Multa - Excesso de velocidade",
              amount: 293.47,
              dueDate: "15/07/2023",
              status: "pending",
            },
          )
        } else {
          // Débito específico
          if (debtId.includes("ipva")) {
            mockDebts.push({
              id: debtId,
              type: "ipva",
              description: "IPVA 2023",
              amount: 1247.8,
              dueDate: "30/04/2023",
              status: "pending",
            })
          } else if (debtId.includes("license")) {
            mockDebts.push({
              id: debtId,
              type: "license",
              description: "Licenciamento 2023",
              amount: 98.91,
              dueDate: "30/06/2023",
              status: "pending",
            })
          } else if (debtId.includes("fine")) {
            mockDebts.push({
              id: debtId,
              type: "fine",
              description: "Multa - Excesso de velocidade",
              amount: 293.47,
              dueDate: "15/07/2023",
              status: "pending",
            })
          }
        }

        setDebts(mockDebts)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [vehicleId, debtId, toast])

  const handlePayment = async (paymentMethod: "pix" | "credit_card" | "boleto") => {
    setIsProcessing(true)

    try {
      // Simula processamento do pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setShowSuccess(true)
      toast({
        title: "Pagamento realizado!",
        description: "Seus débitos foram pagos com sucesso.",
      })
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

  const handleGenerateReceipt = async () => {
    setIsGeneratingReceipt(true)
    try {
      // Importa jsPDF e html2canvas separadamente para evitar erros
      const jsPDF = (await import("jspdf")).default
      const html2canvas = (await import("html2canvas")).default

      const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0)
      const serviceCharge = 20.0
      const totalAmount = totalDebts + serviceCharge

      // Cria um elemento temporário para o recibo
      const receiptElement = document.createElement("div")
      receiptElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; background: white; width: 800px;">
        <!-- Header com Logo -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #6366f1; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
            <div style="width: 60px; height: 60px; background: #6366f1; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">🚗</span>
            </div>
            <div>
              <h1 style="color: #6366f1; margin: 0; font-size: 32px; font-weight: bold;">OCAR</h1>
              <p style="margin: 0; color: #666; font-size: 14px;">Serviços Automotivos Digitais</p>
            </div>
          </div>
          <h2 style="color: #333; margin: 10px 0 5px 0; font-size: 24px;">RECIBO DE PAGAMENTO</h2>
          <p style="margin: 0; color: #888; font-size: 14px;">
            Emitido em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
          </p>
        </div>

        <!-- Dados do Veículo -->
        <div style="margin-bottom: 30px;">
          <h3 style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 20px; margin: 0 0 20px 0; border-radius: 8px; font-size: 18px;">
            📋 Dados do Veículo
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
              <p style="margin: 0; font-weight: bold; color: #6366f1;">Placa:</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${vehicleData.plate}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
              <p style="margin: 0; font-weight: bold; color: #6366f1;">Marca/Modelo:</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${vehicleData.brand} ${vehicleData.model}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
              <p style="margin: 0; font-weight: bold; color: #6366f1;">Ano:</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${vehicleData.year}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
              <p style="margin: 0; font-weight: bold; color: #6366f1;">Cor:</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${vehicleData.color}</p>
            </div>
          </div>
        </div>

        <!-- Detalhamento do Pagamento -->
        <div style="margin-bottom: 30px;">
          <h3 style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 20px; margin: 0 0 20px 0; border-radius: 8px; font-size: 18px;">
            💰 Detalhamento do Pagamento
          </h3>
          <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0);">
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: bold; color: #334155;">Descrição do Serviço</th>
                <th style="padding: 15px; text-align: center; border-bottom: 2px solid #e2e8f0; font-weight: bold; color: #334155;">Detalhes</th>
                <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e2e8f0; font-weight: bold; color: #334155;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${debts
                .map((debt, index) => {
                  const description = debt.description
                  let details = ""

                  if (debt.type === "ipva") {
                    details = "Imposto sobre Propriedade de Veículos Automotores - Exercício 2023"
                  } else if (debt.type === "license") {
                    details = "Taxa de licenciamento anual do veículo - DETRAN"
                  } else if (debt.type === "fine") {
                    details = "Multa de trânsito por infração - Código: 74552"
                  }

                  return `
                  <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                    <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                      <strong>${description}</strong>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
                      ${details}
                    </td>
                    <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #dc2626;">
                      R$ ${debt.amount.toFixed(2).replace(".", ",")}
                    </td>
                  </tr>
                `
                })
                .join("")}
              <tr style="background: #fef3c7;">
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
                  <strong>🔧 Serviço Ocar</strong>
                </td>
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
                  Taxa de processamento e intermediação de pagamento
                </td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #6366f1;">
                  R$ ${serviceCharge.toFixed(2).replace(".", ",")}
                </td>
              </tr>
              <tr style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;">
                <td style="padding: 20px; font-weight: bold; font-size: 18px;">TOTAL GERAL</td>
                <td style="padding: 20px; text-align: center; font-size: 14px;">Valor total processado</td>
                <td style="padding: 20px; text-align: right; font-weight: bold; font-size: 20px;">R$ ${totalAmount.toFixed(2).replace(".", ",")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Informações do Pagamento -->
        <div style="margin-bottom: 30px;">
          <h3 style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 20px; margin: 0 0 20px 0; border-radius: 8px; font-size: 18px;">
            ✅ Informações do Pagamento
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; font-weight: bold; color: #22c55e;">Data do Pagamento:</p>
              <p style="margin: 5px 0 0 0;">${new Date().toLocaleDateString("pt-BR")}</p>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; font-weight: bold; color: #22c55e;">Hora do Pagamento:</p>
              <p style="margin: 5px 0 0 0;">${new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; font-weight: bold; color: #22c55e;">Método de Pagamento:</p>
              <p style="margin: 5px 0 0 0;">Cartão de Crédito</p>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; font-weight: bold; color: #22c55e;">Número de Autorização:</p>
              <p style="margin: 5px 0 0 0;">${Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0")}</p>
            </div>
          </div>
        </div>

        <!-- Sobre a Ocar -->
        <div style="margin-bottom: 30px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h3 style="color: #6366f1; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
            🚗 Sobre a OCAR - Serviços Automotivos Digitais
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
            <div>
              <h4 style="color: #6366f1; margin: 0 0 8px 0; font-size: 14px;">🔍 Nossos Serviços:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.6;">
                <li>Consulta completa de veículos</li>
                <li>Verificação de débitos e multas</li>
                <li>Pagamento de IPVA e licenciamento</li>
                <li>Emissão de CRLV Digital</li>
              </ul>
            </div>
            <div>
              <h4 style="color: #6366f1; margin: 0 0 8px 0; font-size: 14px;">🛡️ Segurança e Confiança:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.6;">
                <li>Plataforma 100% segura</li>
                <li>Dados protegidos por criptografia</li>
                <li>Integração oficial com órgãos</li>
                <li>Suporte especializado 24/7</li>
              </ul>
            </div>
          </div>
          <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; font-style: italic;">
            "Facilitando sua vida automotiva com tecnologia e segurança"
          </p>
        </div>

        <!-- Rodapé -->
        <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 2px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
            <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">📞 Precisa de Ajuda?</p>
            <p style="margin: 0; font-size: 14px;">Entre em contato: suporte@ocar.com.br | (11) 9999-9999</p>
          </div>
          <p style="margin: 0; color: #64748b; font-size: 12px;">
            Este recibo foi emitido através da plataforma OCAR Serviços Automotivos Digitais
          </p>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">
            © ${new Date().getFullYear()} OCAR - Todos os direitos reservados | CNPJ: 12.345.678/0001-90
          </p>
        </div>
      </div>
    `

      // Adiciona o elemento ao DOM temporariamente
      receiptElement.style.position = "absolute"
      receiptElement.style.left = "-9999px"
      receiptElement.style.top = "0"
      document.body.appendChild(receiptElement)

      // Gera o canvas
      const canvas = await html2canvas(receiptElement.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Remove o elemento temporário
      document.body.removeChild(receiptElement)

      // Cria o PDF
      const pdf = new jsPDF("p", "mm", "a4")
      const imgData = canvas.toDataURL("image/png")

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

      // Salva o PDF
      const fileName = `recibo-pagamento-${vehicleData.plate}-${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(fileName)

      toast({
        title: "Recibo Gerado!",
        description: "O recibo de pagamento foi baixado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao gerar recibo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o recibo. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReceipt(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/my-vehicles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Pagamento Concluído</h1>
        </div>

        <Card className="text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              Seus débitos foram pagos com sucesso. O pagamento será processado em até 3 dias úteis.
            </p>

            <div className="bg-muted/20 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Resumo do Pagamento</h3>
              <div className="space-y-2">
                {debts.map((debt) => (
                  <div key={debt.id} className="flex justify-between">
                    <span>{debt.description}</span>
                    <span>{formatCurrency(debt.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="font-medium">Serviço Ocar</span>
                  <span>{formatCurrency(20)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(debts.reduce((sum, debt) => sum + debt.amount, 0) + 20)}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleGenerateReceipt} disabled={isGeneratingReceipt} className="w-full">
              {isGeneratingReceipt ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando recibo...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" /> Baixar Recibo
                </>
              )}
            </Button>
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
        <h1 className="text-3xl font-bold">Pagamento de Débitos</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalhes do Veículo
          </CardTitle>
          <CardDescription>
            Confira os dados do veículo antes de prosseguir com o pagamento dos débitos.
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
            Débitos a Pagar
          </CardTitle>
          <CardDescription>Confira os débitos selecionados para pagamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {debts.map((debt) => (
            <div key={debt.id} className="p-4 rounded-lg border bg-muted/20 border-border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{debt.description}</h3>
                  <p className="text-sm text-muted-foreground">Vencimento: {debt.dueDate}</p>
                </div>
                <div className="text-xl font-bold text-red-500">{formatCurrency(debt.amount)}</div>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-lg border bg-primary/10 border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Serviço Ocar</h3>
                <p className="text-sm text-muted-foreground">Taxa de processamento</p>
              </div>
              <div className="text-xl font-bold text-primary">{formatCurrency(20)}</div>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-muted/20 border-border">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Total a pagar</h3>
              <div className="text-2xl font-bold">
                {formatCurrency(debts.reduce((sum, debt) => sum + debt.amount, 0) + 20)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Forma de Pagamento
          </CardTitle>
          <CardDescription>Escolha como deseja pagar os débitos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="credit_card" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credit_card">Cartão de Crédito</TabsTrigger>
              <TabsTrigger value="pix">PIX</TabsTrigger>
              <TabsTrigger value="boleto">Boleto</TabsTrigger>
            </TabsList>

            <TabsContent value="credit_card" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selecione o número de parcelas:</p>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o número de parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      1x de {formatCurrency((debts.reduce((sum, debt) => sum + debt.amount, 0) + 20) / 1)}
                    </SelectItem>
                    <SelectItem value="2">
                      2x de {formatCurrency((debts.reduce((sum, debt) => sum + debt.amount, 0) + 20) / 2)}
                    </SelectItem>
                    <SelectItem value="3">
                      3x de {formatCurrency((debts.reduce((sum, debt) => sum + debt.amount, 0) + 20) / 3)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handlePayment("credit_card")} disabled={isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" /> Pagar com Cartão de Crédito
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="pix" className="space-y-4 mt-4">
              <div className="p-4 rounded-lg border bg-muted/20 border-border text-center">
                <p className="mb-2">QR Code PIX</p>
                <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                  <p className="text-sm text-gray-500">QR Code simulado</p>
                </div>
                <p className="text-sm text-muted-foreground">Escaneie o QR Code acima ou copie o código PIX abaixo:</p>
                <div className="mt-2 p-2 bg-muted rounded-md text-center">
                  <code className="text-xs">
                    00020126580014BR.GOV.BCB.PIX0136a629534e-7e14-43ff-af5f-4de65f234a52520400005303986540510.005802BR5925OCAR
                    SERVICOS DIGITAIS6009SAO PAULO62070503***6304E2CA
                  </code>
                </div>
              </div>

              <Button onClick={() => handlePayment("pix")} disabled={isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" /> Confirmar Pagamento PIX
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="boleto" className="space-y-4 mt-4">
              <div className="p-4 rounded-lg border bg-muted/20 border-border">
                <p className="mb-2">Informações do Boleto:</p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Valor:</span>{" "}
                    {formatCurrency(debts.reduce((sum, debt) => sum + debt.amount, 0) + 20)}
                  </li>
                  <li>
                    <span className="font-medium">Data de Vencimento:</span>{" "}
                    {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                  </li>
                  <li>
                    <span className="font-medium">Beneficiário:</span> Ocar Serviços Digitais
                  </li>
                  <li>
                    <span className="font-medium">CNPJ:</span> 12.345.678/0001-90
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-yellow-500/10 border-yellow-500/20 text-yellow-600">
                <p className="text-sm">
                  O boleto será gerado após a confirmação. O pagamento será processado em até 3 dias úteis após o
                  pagamento.
                </p>
              </div>

              <Button onClick={() => handlePayment("boleto")} disabled={isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" /> Gerar Boleto
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
