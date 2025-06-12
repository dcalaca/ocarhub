"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Download, Loader2 } from "lucide-react"

// Adicionar importação no topo
import { saveDownloadedDocument } from "@/lib/supabase/database"
import { createClient } from "@/lib/supabase/client"

export default function CRLVViewPage() {
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
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
          renavam: "12345678901",
          chassis: "9BRBL3HE1K0123456",
          owner: "João da Silva",
          cpf: "123.456.789-00",
          city: "São Paulo",
          state: "SP",
          crlvPurchaseDate: "10/06/2023",
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

  // Modificar a função handleDownloadPdf para incluir o salvamento:
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      // Importa html2pdf de forma mais robusta
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule

      const crlvContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0;">CRLV - Certificado de Registro e Licenciamento de Veículo</h1>
            <h2 style="margin: 10px 0; color: #666;">DIGITAL</h2>
            <p style="margin: 5px 0; color: #888;">Emitido em: ${new Date().toLocaleDateString("pt-BR")}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">Dados do Veículo</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div><strong>Placa:</strong> ${vehicleData.plate}</div>
              <div><strong>Renavam:</strong> ${vehicleData.renavam}</div>
              <div><strong>Marca/Modelo:</strong> ${vehicleData.brand} ${vehicleData.model}</div>
              <div><strong>Ano:</strong> ${vehicleData.year}</div>
              <div><strong>Cor:</strong> ${vehicleData.color}</div>
              <div><strong>Chassi:</strong> ${vehicleData.chassis}</div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">Dados do Proprietário</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div><strong>Nome:</strong> ${vehicleData.owner}</div>
              <div><strong>CPF:</strong> ${vehicleData.cpf}</div>
              <div><strong>Município:</strong> ${vehicleData.city}</div>
              <div><strong>UF:</strong> ${vehicleData.state}</div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">Licenciamento</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div><strong>Exercício:</strong> ${new Date().getFullYear()}</div>
              <div><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString("pt-BR")}</div>
              <div><strong>Código de Segurança:</strong> ${Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
              <div><strong>Situação:</strong> <span style="color: green; font-weight: bold;">REGULAR</span></div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 12px;">
            <p>Este documento foi emitido através da plataforma OCAR</p>
            <p>© ${new Date().getFullYear()} OCAR - Todos os direitos reservados</p>
          </div>
        </div>
      `

      const opt = {
        margin: 1,
        filename: `crlv-digital-${vehicleData.plate}-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(crlvContent).save()

      // Salvar registro do download no Supabase
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          await saveDownloadedDocument(user.id, vehicleId, "crlv", `CRLV Digital - ${vehicleData.plate}`, {
            plate: vehicleData.plate,
            brand: vehicleData.brand,
            model: vehicleData.model,
            year: vehicleData.year,
          })
        }
      } catch (error) {
        console.error("Erro ao salvar registro do download:", error)
        // Não interrompe o fluxo se houver erro ao salvar o registro
      }

      toast({
        title: "PDF Gerado!",
        description: "O CRLV Digital foi baixado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <h1 className="text-3xl font-bold">CRLV Digital</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Certificado de Registro e Licenciamento de Veículo
          </CardTitle>
          <CardDescription>CRLV Digital do veículo {vehicleData?.plate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados do Veículo */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Veículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Placa</p>
                <p className="text-base font-semibold">{vehicleData?.plate}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Renavam</p>
                <p className="text-base font-semibold">{vehicleData?.renavam}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Marca/Modelo</p>
                <p className="text-base font-semibold">
                  {vehicleData?.brand} {vehicleData?.model}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Ano</p>
                <p className="text-base font-semibold">{vehicleData?.year}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Cor</p>
                <p className="text-base font-semibold">{vehicleData?.color}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Chassi</p>
                <p className="text-base font-semibold">{vehicleData?.chassis}</p>
              </div>
            </div>
          </div>

          {/* Dados do Proprietário */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Proprietário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-base font-semibold">{vehicleData?.owner}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">CPF</p>
                <p className="text-base font-semibold">{vehicleData?.cpf}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Município</p>
                <p className="text-base font-semibold">{vehicleData?.city}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">UF</p>
                <p className="text-base font-semibold">{vehicleData?.state}</p>
              </div>
            </div>
          </div>

          {/* Licenciamento */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-2">Licenciamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Exercício</p>
                <p className="text-base font-semibold">{new Date().getFullYear()}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Data de Emissão</p>
                <p className="text-base font-semibold">{vehicleData?.crlvPurchaseDate}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Código de Segurança</p>
                <p className="text-base font-semibold">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/20 border-border">
                <p className="text-sm font-medium text-muted-foreground">Situação</p>
                <p className="text-base font-semibold text-green-500">REGULAR</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} size="lg" className="w-full max-w-md">
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Baixar CRLV Digital
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
