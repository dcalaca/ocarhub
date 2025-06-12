"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Trash2, Sun, Moon, Download } from "lucide-react" // Adicionado Download icon
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteUserAccount } from "../actions" // Importar a ação de exclusão

export default function SettingsPage() {
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true) // Assumindo dark mode como padrão
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false) // Novo estado para o checklist
  const { toast } = useToast()
  const router = useRouter()

  const handleDeleteAccount = async () => {
    setLoadingDelete(true)
    try {
      const result = await deleteUserAccount()
      if (result.success) {
        toast({
          title: "Conta excluída!",
          description: "Sua conta foi removida com sucesso. Redirecionando...",
        })
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        toast({
          title: "Erro ao excluir conta",
          description: result.message || "Não foi possível excluir sua conta.",
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e.message || "Ocorreu um erro inesperado ao excluir a conta.",
        variant: "destructive",
      })
    } finally {
      setLoadingDelete(false)
    }
  }

  const handleThemeToggle = () => {
    // Esta é uma simulação. Em uma aplicação real, você alteraria o tema globalmente
    // por exemplo, adicionando/removendo uma classe no <html> ou usando um hook de tema.
    setIsDarkMode(!isDarkMode)
    toast({
      title: "Tema alterado",
      description: `Modo ${isDarkMode ? "claro" : "escuro"} ativado (simulado).`,
    })
  }

  const handleDownloadChecklist = async () => {
    setIsGeneratingChecklist(true)
    try {
      // Importa html2pdf de forma mais robusta
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule // Tenta pegar o default ou o módulo inteiro

      const checklistContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0;">Checklist de Compra Segura - Ocar</h1>
            <p style="margin: 10px 0; color: #666;">Guia completo para uma compra de veículo sem preocupações.</p>
            <p style="margin: 5px 0; color: #888;">Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="background: #6366f1; color: white; padding: 10px; margin: 0 0 15px 0;">✅ Itens Essenciais para Verificar</h3>
            <ol style="margin: 10px 0; padding-left: 25px; line-height: 1.6;">
              <li><strong>Verifique o histórico:</strong> Certifique-se de que o veículo não possui histórico de leilão, sinistro, roubo/furto ou batidas graves.</li>
              <li><strong>Documentação:</strong> Confirme a autenticidade do CRLV (Certificado de Registro e Licenciamento do Veículo), CRV (Certificado de Registro do Veículo) e nota fiscal).</li>
              <li><strong>Numeração:</strong> Confira se a numeração do chassi, motor e placas coincidem com o que está no documento do veículo.</li>
              <li><strong>Restrições:</strong> Consulte possíveis restrições judiciais (Renajud) e gravames.</li>
              <li><strong>Estado geral:</strong> Avalie o estado da lataria, pintura, pneus, faróis, lanternas, vidros e retrovisores.</li>
              <li><strong>Teste de direção:</strong> Realize um teste de direção em via pública, observando freios, direção e câmbio.</li>
              <li><strong>Quilometragem:</strong> Verifique a quilometragem e se está compatível com o ano/modelo.</li>
              <li><strong>Manutenção e Recall:</strong> Peça o histórico completo de manutenção e se houve recall pendente.</li>
              <li><strong>Débitos:</strong> Consulte débitos de IPVA, licenciamento e multas pendentes.</li>
              <li><strong>Vistoria profissional:</strong> Sempre que possível, leve o carro para vistoria com mecânico de confiança.</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 12px;">
            <p>Este checklist foi gerado pela plataforma OCAR</p>
            <p>© ${new Date().getFullYear()} OCAR - Todos os direitos reservados</p>
          </div>
        </div>
      `

      const opt = {
        margin: 1,
        filename: `checklist-compra-segura-ocar-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(checklistContent).save()

      toast({
        title: "Checklist Gerado!",
        description: "O checklist de compra segura foi baixado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF do checklist:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o PDF do checklist. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingChecklist(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      {/* Card para Configurações Gerais */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>Ajuste as configurações gerais da sua aplicação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Modo Escuro
            </Label>
            <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleThemeToggle} />
          </div>

          {/* Novo botão para baixar o checklist */}
          <div className="flex items-center justify-between border-t pt-4 border-border">
            <Label className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Baixar Checklist de Compra Segura
            </Label>
            <Button onClick={handleDownloadChecklist} disabled={isGeneratingChecklist}>
              {isGeneratingChecklist ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                </>
              ) : (
                "Baixar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card para Configurações da Conta */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Gerencie suas informações de conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Gerenciar Perfil</Label>
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">Ir para Perfil</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-4 border-border">
            <Label className="text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Excluir Conta
            </Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loadingDelete}>
                  {loadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja excluir sua conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso removerá permanentemente sua conta e todos os seus dados de
                    nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={loadingDelete}>
                    {loadingDelete ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
                      </>
                    ) : (
                      "Confirmar Exclusão"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Card para Notificações (Exemplo) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Gerencie suas preferências de notificação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">Notificações por SMS</Label>
            <Switch id="sms-notifications" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
