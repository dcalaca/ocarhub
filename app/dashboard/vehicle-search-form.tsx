"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Loader2, Lock, Unlock, ChevronDown, ChevronUp } from "lucide-react"
import { getVehicleInfo } from "./actions"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getUserWallet } from "./wallet/actions" // Importar para carregar o saldo, mas não exibir aqui

type VehicleData = {
  plate?: string
  chassis?: string
  model?: string
  brand?: string
  year?: number
  color?: string
  previousOwners?: number
  auction?: boolean
  accidentHistory?: boolean
  theftRecord?: boolean
  debts?: string[]
  status?: "Regular" | "Alerta" | "Irregular"
  [key: string]: any
}

type UserWallet = {
  user_id: string
  balance: number
  updated_at: string
}

export function VehicleSearchForm() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFullReport, setShowFullReport] = useState(false)
  const [wallet, setWallet] = useState<UserWallet | null>(null) // Manter para lógica de compra
  const [userId, setUserId] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Erro ao obter usuário:", error)
          return
        }

        if (user) {
          setUserId(user.id)
          // Carregar saldo da carteira (apenas para a lógica de compra, não para exibição)
          const userWallet = await getUserWallet(user.id)
          setWallet(userWallet)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
      }
    }
    loadUserData()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!searchTerm.trim()) {
      setError("Por favor, insira uma placa ou chassi.")
      return
    }
    setIsLoading(true)
    setError(null)
    setVehicleData(null)
    setShowFullReport(false)

    try {
      const result = await getVehicleInfo(searchTerm)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        // Adiciona cor simulada baseada na placa
        const colors = ["Preta", "Branca", "Prata", "Vermelha", "Azul", "Cinza"]
        const colorIndex = searchTerm.length % colors.length
        result.data.color = colors[colorIndex]

        setVehicleData(result.data)
      } else {
        setError("Nenhum dado encontrado para o termo informado.")
      }
    } catch (e: any) {
      setError("Ocorreu um erro ao buscar as informações do veículo.")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseReport = async () => {
    if (!userId || !vehicleData?.plate || !wallet) return

    const reportPrice = 19.9

    if (wallet.balance < reportPrice) {
      toast({
        title: "Saldo insuficiente",
        description: `Você tem R$ ${wallet.balance.toFixed(2)} e precisa de R$ ${reportPrice.toFixed(2)}.`,
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    try {
      // Simula a compra do relatório
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowFullReport(true)
      // Atualiza o saldo localmente (o layout principal também será atualizado)
      setWallet({
        ...wallet,
        balance: wallet.balance - reportPrice,
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "Sucesso!",
        description: "Relatório completo liberado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a compra.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!vehicleData) return

    setIsGeneratingPdf(true)
    try {
      // Importa html2pdf de forma mais robusta
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule // Tenta pegar o default ou o módulo inteiro

      // Cria o conteúdo HTML para o PDF
      const pdfContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0;">OCAR - Relatório Veicular Completo</h1>
            <h2 style="margin: 10px 0; color: #666;">Placa: ${vehicleData.plate}</h2>
            <p style="margin: 5px 0; color: #888;">Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">📋 Informações Básicas</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div><strong>Placa:</strong> ${vehicleData.plate}</div>
              <div><strong>Modelo:</strong> ${vehicleData.brand} ${vehicleData.model}</div>
              <div><strong>Ano:</strong> ${vehicleData.year}</div>
              <div><strong>Cor:</strong> ${vehicleData.color}</div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">⚠️ Análise de Risco</h3>
            <div style="margin-bottom: 15px;">
              <div><strong>Status Geral:</strong> <span style="color: ${vehicleData.status === "Regular" ? "#22c55e" : vehicleData.status === "Alerta" ? "#f59e0b" : "#ef4444"}">${vehicleData.status}</span></div>
              <div><strong>Risco de Comercialização:</strong> ${vehicleData.commercializationRisk}</div>
              <div><strong>Score de Leilão:</strong> ${vehicleData.auctionScore}</div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🏛️ Dados de Leilão</h3>
            <div><strong>Informações:</strong> ${vehicleData.auctionData}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">💥 Histórico de Batidas</h3>
            <div><strong>Acidentes:</strong> ${Array.isArray(vehicleData.accidents) ? vehicleData.accidents.join(", ") : vehicleData.accidents}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🚨 Roubo e Furto</h3>
            <div><strong>Registro:</strong> ${vehicleData.theftRecord ? "Sim - Verificar restrições" : "Sem registros"}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">📊 Histórico de KM</h3>
            <div>${vehicleData.kmHistory}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">👥 Histórico de Proprietários</h3>
            <div><strong>Número de proprietários anteriores:</strong> ${vehicleData.previousOwners}</div>
            <div><strong>Datas de transferência:</strong></div>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${vehicleData.ownerHistory?.map((date: string) => `<li>${date}</li>`).join("") || "<li>Dados não disponíveis</li>"}
            </ul>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🔒 Gravames</h3>
            <div>${vehicleData.gravames}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">💰 Débitos e Multas</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${vehicleData.debts?.map((debt: string) => `<li>${debt}</li>`).join("") || "<li>Sem débitos</li>"}
            </ul>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🚫 Restrições e Impedimentos</h3>
            <div>${Array.isArray(vehicleData.restrictions) ? vehicleData.restrictions.join(", ") : vehicleData.restrictions}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">⚖️ Renajud</h3>
            <div>${vehicleData.renajudDetail}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🔧 Recall</h3>
            <div>${vehicleData.recall}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">📋 Dados Cadastrais Nacionais</h3>
            <div style="margin-bottom: 10px;"><strong>Chassi:</strong> ${vehicleData.nationalRegistry?.chassis}</div>
            <div style="margin-bottom: 10px;"><strong>Motor:</strong> ${vehicleData.nationalRegistry?.engine}</div>
            <div style="margin-bottom: 10px;"><strong>Tipo:</strong> ${vehicleData.nationalRegistry?.type}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🏛️ Dados Cadastrais Estaduais</h3>
            <div style="margin-bottom: 10px;"><strong>Modificações:</strong> ${vehicleData.stateRegistry?.modifications}</div>
            <div style="margin-bottom: 10px;"><strong>Mudanças de cor:</strong> ${vehicleData.stateRegistry?.colorChanges}</div>
            <div style="margin-bottom: 10px;"><strong>Troca de motor:</strong> ${vehicleData.stateRegistry?.engineSwap}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🔍 Decodificador de Chassi</h3>
            <div style="margin-bottom: 10px;"><strong>País:</strong> ${vehicleData.chassisDecoder?.country}</div>
            <div style="margin-bottom: 10px;"><strong>Fabricante:</strong> ${vehicleData.chassisDecoder?.manufacturer}</div>
            <div style="margin-bottom: 10px;"><strong>Planta:</strong> ${vehicleData.chassisDecoder?.plant}</div>
            <div style="margin-bottom: 10px;"><strong>Ano modelo:</strong> ${vehicleData.chassisDecoder?.modelYear}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">⚠️ Principais Falhas do Modelo</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${vehicleData.commonFailures?.map((failure: string) => `<li>${failure}</li>`).join("") || "<li>Dados não disponíveis</li>"}
            </ul>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">💲 Precificação</h3>
            <div style="margin-bottom: 10px;"><strong>Tabela FIPE:</strong> ${vehicleData.pricing?.fipe}</div>
            <div style="margin-bottom: 10px;"><strong>Valor de Mercado:</strong> ${vehicleData.pricing?.market}</div>
            <div style="margin-bottom: 10px;"><strong>Tendência:</strong> ${vehicleData.priceGraph}</div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">🔧 Ficha Técnica</h3>
            <div style="margin-bottom: 10px;"><strong>Motor:</strong> ${vehicleData.technicalSpecs?.engine}</div>
            <div style="margin-bottom: 10px;"><strong>Transmissão:</strong> ${vehicleData.technicalSpecs?.transmission}</div>
            <div style="margin-bottom: 10px;"><strong>Combustível:</strong> ${vehicleData.technicalSpecs?.fuel}</div>
            <div style="margin-bottom: 10px;"><strong>Consumo:</strong> ${vehicleData.technicalSpecs?.consumption}</div>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 12px;">
            <p>Este relatório foi gerado pela plataforma OCAR</p>
            <p>© ${new Date().getFullYear()} OCAR - Todos os direitos reservados</p>
          </div>
        </div>
      `

      const opt = {
        margin: 1,
        filename: `relatorio-ocar-${vehicleData.plate}-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(pdfContent).save()

      toast({
        title: "PDF Gerado!",
        description: "O relatório completo foi baixado com sucesso.",
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const LockedField = ({ label, icon }: { label: string; icon?: React.ReactNode }) => (
    <div className="p-4 rounded-lg border bg-muted/10 border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span className="text-sm">Clique para desbloquear</span>
      </div>
    </div>
  )

  const InfoCard = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) => (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )

  const DataField = ({ label, value, isAlert = false }: { label: string; value: any; isAlert?: boolean }) => (
    <div className="p-3 rounded-lg border bg-muted/20 border-border">
      <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`text-base font-semibold ${isAlert ? "text-red-400" : "text-foreground"}`}>
        {Array.isArray(value) ? (
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          value || "Não informado"
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* O card de saldo foi movido para o layout principal (app/dashboard/layout.tsx) */}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consultar Veículo</CardTitle>
          <CardDescription>Insira a placa para consulta gratuita básica.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Digite a placa (ex: ABC1D23)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Consultar
            </Button>
          </form>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {vehicleData && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">🔍 Consulta: {vehicleData.plate}</h2>
              </div>

              {/* Informações Gratuitas */}
              <InfoCard title="Informações Básicas (Gratuitas)" icon="✅">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataField label="Placa" value={vehicleData.plate} />
                  <DataField label="Modelo" value={`${vehicleData.brand} ${vehicleData.model}`} />
                  <DataField label="Ano" value={vehicleData.year} />
                  <DataField label="Cor" value={vehicleData.color} />
                </div>
              </InfoCard>

              {/* Relatório Completo */}
              {showFullReport ? (
                <div className="space-y-6">
                  <InfoCard title="Relatório Completo (Liberado)" icon="🔓">
                    <div className="space-y-6">
                      {/* Análise de Risco */}
                      <Collapsible open={expandedSections["risk"]} onOpenChange={() => toggleSection("risk")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">⚠️ Análise de Risco</h4>
                            {expandedSections["risk"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DataField
                              label="Status Geral"
                              value={`${vehicleData.status === "Regular" ? "✅" : vehicleData.status === "Alerta" ? "⚠️" : "❌"} ${vehicleData.status}`}
                              isAlert={vehicleData.status !== "Regular"}
                            />
                            <DataField label="Risco de Comercialização" value={vehicleData.commercializationRisk} />
                            <DataField label="Score de Leilão" value={vehicleData.auctionScore} />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Dados de Leilão */}
                      <Collapsible open={expandedSections["auction"]} onOpenChange={() => toggleSection("auction")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🏛️ Dados de Leilão</h4>
                            {expandedSections["auction"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Informações de Leilão" value={vehicleData.auctionData} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Histórico de Batidas */}
                      <Collapsible open={expandedSections["accidents"]} onOpenChange={() => toggleSection("accidents")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">💥 Histórico de Batidas</h4>
                            {expandedSections["accidents"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Acidentes Registrados" value={vehicleData.accidents} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Roubo e Furto */}
                      <Collapsible open={expandedSections["theft"]} onOpenChange={() => toggleSection("theft")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🚨 Roubo e Furto</h4>
                            {expandedSections["theft"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField
                            label="Registro de Roubo/Furto"
                            value={vehicleData.theftRecord ? "⚠️ Sim - Verificar restrições" : "✅ Sem registros"}
                            isAlert={vehicleData.theftRecord}
                          />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Histórico de KM */}
                      <Collapsible open={expandedSections["km"]} onOpenChange={() => toggleSection("km")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">📊 Histórico de KM</h4>
                            {expandedSections["km"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Quilometragem Registrada" value={vehicleData.kmHistory} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Histórico de Proprietários */}
                      <Collapsible open={expandedSections["owners"]} onOpenChange={() => toggleSection("owners")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">👥 Histórico de Proprietários</h4>
                            {expandedSections["owners"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField
                              label="Proprietários Anteriores"
                              value={`${vehicleData.previousOwners} proprietários`}
                            />
                            <DataField label="Datas de Transferência" value={vehicleData.ownerHistory} />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Gravames */}
                      <Collapsible open={expandedSections["gravames"]} onOpenChange={() => toggleSection("gravames")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🔒 Gravames</h4>
                            {expandedSections["gravames"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Informações de Gravame" value={vehicleData.gravames} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Débitos e Multas */}
                      <Collapsible open={expandedSections["debts"]} onOpenChange={() => toggleSection("debts")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">💰 Débitos e Multas</h4>
                            {expandedSections["debts"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField
                            label="Situação Financeira"
                            value={vehicleData.debts}
                            isAlert={
                              Array.isArray(vehicleData.debts) && vehicleData.debts.some((d) => d.includes("pendente"))
                            }
                          />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Restrições e Impedimentos */}
                      <Collapsible
                        open={expandedSections["restrictions"]}
                        onOpenChange={() => toggleSection("restrictions")}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🚫 Restrições e Impedimentos</h4>
                            {expandedSections["restrictions"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Restrições Ativas" value={vehicleData.restrictions} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Renajud */}
                      <Collapsible open={expandedSections["renajud"]} onOpenChange={() => toggleSection("renajud")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">⚖️ Renajud</h4>
                            {expandedSections["renajud"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Detalhes Renajud" value={vehicleData.renajudDetail} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Recall */}
                      <Collapsible open={expandedSections["recall"]} onOpenChange={() => toggleSection("recall")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🔧 Recall</h4>
                            {expandedSections["recall"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Situação de Recall" value={vehicleData.recall} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Dados Cadastrais */}
                      <Collapsible open={expandedSections["registry"]} onOpenChange={() => toggleSection("registry")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">📋 Dados Cadastrais</h4>
                            {expandedSections["registry"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <div className="space-y-4">
                            <h5 className="font-semibold text-primary">Dados Nacionais</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DataField label="Chassi" value={vehicleData.nationalRegistry?.chassis} />
                              <DataField label="Motor" value={vehicleData.nationalRegistry?.engine} />
                              <DataField label="Tipo" value={vehicleData.nationalRegistry?.type} />
                            </div>

                            <h5 className="font-semibold text-primary">Dados Estaduais</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DataField label="Modificações" value={vehicleData.stateRegistry?.modifications} />
                              <DataField label="Mudanças de Cor" value={vehicleData.stateRegistry?.colorChanges} />
                              <DataField label="Troca de Motor" value={vehicleData.stateRegistry?.engineSwap} />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Decodificador de Chassi */}
                      <Collapsible open={expandedSections["chassis"]} onOpenChange={() => toggleSection("chassis")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🔍 Decodificador de Chassi</h4>
                            {expandedSections["chassis"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="País" value={vehicleData.chassisDecoder?.country} />
                            <DataField label="Fabricante" value={vehicleData.chassisDecoder?.manufacturer} />
                            <DataField label="Planta" value={vehicleData.chassisDecoder?.plant} />
                            <DataField label="Ano Modelo" value={vehicleData.chassisDecoder?.modelYear} />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Principais Falhas */}
                      <Collapsible open={expandedSections["failures"]} onOpenChange={() => toggleSection("failures")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">⚠️ Principais Falhas do Modelo</h4>
                            {expandedSections["failures"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <DataField label="Falhas Conhecidas" value={vehicleData.commonFailures} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Precificação */}
                      <Collapsible open={expandedSections["pricing"]} onOpenChange={() => toggleSection("pricing")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">💲 Precificação e Tendências</h4>
                            {expandedSections["pricing"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Tabela FIPE" value={vehicleData.pricing?.fipe} />
                            <DataField label="Valor de Mercado" value={vehicleData.pricing?.market} />
                          </div>
                          <DataField label="Tendência de Preço" value={vehicleData.priceGraph} />
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Ficha Técnica */}
                      <Collapsible open={expandedSections["specs"]} onOpenChange={() => toggleSection("specs")}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                            <h4 className="text-lg font-semibold">🔧 Ficha Técnica</h4>
                            {expandedSections["specs"] ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Motor" value={vehicleData.technicalSpecs?.engine} />
                            <DataField label="Transmissão" value={vehicleData.technicalSpecs?.transmission} />
                            <DataField label="Combustível" value={vehicleData.technicalSpecs?.fuel} />
                            <DataField label="Consumo" value={vehicleData.technicalSpecs?.consumption} />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </InfoCard>
                </div>
              ) : (
                <InfoCard title="Histórico Completo (Bloqueado)" icon="🔒">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <LockedField label="Risco de comercialização" />
                    <LockedField label="Dados de leilão" />
                    <LockedField label="Histórico de batidas" />
                    <LockedField label="Roubo e furto" />
                    <LockedField label="Histórico de KM" />
                    <LockedField label="Histórico de proprietários" />
                    <LockedField label="Gravames" />
                    <LockedField label="Débitos e multas" />
                    <LockedField label="Restrições" />
                    <LockedField label="Renajud" />
                    <LockedField label="Recall" />
                    <LockedField label="Score de leilão" />
                    <LockedField label="Dados cadastrais" />
                    <LockedField label="Decodificador de chassi" />
                    <LockedField label="Principais falhas" />
                    <LockedField label="Precificação" />
                    <LockedField label="Gráfico de preços" />
                    <LockedField label="Ficha técnica" />
                  </div>
                </InfoCard>
              )}

              {/* Botão de compra ou download */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center">
                  {showFullReport ? (
                    <div className="space-y-4">
                      <div className="text-green-600 font-semibold text-lg">✅ Relatório Completo Liberado!</div>
                      <Button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        size="lg"
                        className="w-full max-w-md"
                      >
                        {isGeneratingPdf ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Gerando PDF...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-5 w-5" />
                            Baixar PDF Completo
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold">
                        🔓 Liberar histórico completo por <span className="text-primary">R$ 19,90</span>
                      </div>
                      <p className="text-muted-foreground">e receba o PDF com todos os dados detalhados</p>
                      <Button
                        onClick={handlePurchaseReport}
                        disabled={isPurchasing || !wallet || wallet.balance < 19.9}
                        size="lg"
                        className="w-full max-w-md"
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-2 h-5 w-5" />
                            Liberar Relatório Completo - R$ 19,90
                          </>
                        )}
                      </Button>
                      {wallet && wallet.balance < 19.9 && (
                        <p className="text-sm text-red-600">
                          Saldo insuficiente. Você precisa de R$ {(19.9 - wallet.balance).toFixed(2)} a mais.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
