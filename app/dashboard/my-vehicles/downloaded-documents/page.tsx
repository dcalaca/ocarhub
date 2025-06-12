"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Download, Calendar, Car, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getUserDownloadedDocuments, type DownloadedDocument } from "@/lib/supabase/database"

type DocumentWithVehicle = DownloadedDocument & {
  user_vehicles?: {
    plate: string
    brand: string
    model: string
    year: number
  }
}

export default function DownloadedDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Erro ao obter usuário:", userError)
          toast({
            title: "Erro de autenticação",
            description: "Por favor, faça login novamente.",
            variant: "destructive",
          })
          return
        }

        setUserId(user.id)

        const { data: documentsData, error: documentsError } = await getUserDownloadedDocuments(user.id)

        if (documentsError) {
          console.error("Erro ao carregar documentos:", documentsError)
          toast({
            title: "Aviso",
            description: "Sistema de documentos não configurado. Execute o script SQL primeiro.",
            variant: "default",
          })
          return
        }

        setDocuments(documentsData || [])
      } catch (error) {
        console.error("Erro ao carregar documentos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os documentos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "crlv":
        return "CRLV Digital"
      case "receipt":
        return "Recibo de Pagamento"
      case "report":
        return "Relatório de Consulta"
      default:
        return "Documento"
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "crlv":
        return <Car className="h-5 w-5 text-blue-500" />
      case "receipt":
        return <FileText className="h-5 w-5 text-green-500" />
      case "report":
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/my-vehicles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Documentos Baixados</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-semibold text-muted-foreground">Nenhum documento baixado ainda.</p>
            <p className="text-sm text-muted-foreground">Quando você baixar CRLVs ou recibos, eles aparecerão aqui.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/my-vehicles">Voltar aos Veículos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(document.document_type)}
                    <div>
                      <h3 className="text-lg font-semibold">{getDocumentTypeLabel(document.document_type)}</h3>
                      <p className="text-sm text-muted-foreground">{document.document_name}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar novamente
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {document.user_vehicles && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {document.user_vehicles.brand} {document.user_vehicles.model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {document.user_vehicles.plate} • {document.user_vehicles.year}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Baixado em</p>
                      <p className="text-xs text-muted-foreground">{formatDate(document.downloaded_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tipo</p>
                      <p className="text-xs text-muted-foreground">{getDocumentTypeLabel(document.document_type)}</p>
                    </div>
                  </div>
                </div>

                {document.metadata && Object.keys(document.metadata).length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/20 border">
                    <p className="text-sm font-medium mb-2">Informações adicionais:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {Object.entries(document.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace("_", " ")}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
