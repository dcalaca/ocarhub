'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
  totalRecords?: number
  processedRecords?: number
  errors?: number
}

export default function FipeUploadComponent() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  })
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (!file) return

    // Validar se é um arquivo CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho do arquivo (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 50MB.",
        variant: "destructive",
      })
      return
    }

    setUploadProgress({
      status: 'uploading',
      progress: 0,
      message: 'Enviando arquivo...'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload-fipe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar arquivo')
      }

      // Simular progresso de processamento
      setUploadProgress({
        status: 'processing',
        progress: 50,
        message: 'Processando dados...'
      })

      // Aguardar processamento completo
      const result = await response.json()
      
      setUploadProgress({
        status: 'completed',
        progress: 100,
        message: 'Importação concluída!',
        totalRecords: result.totalRecords,
        processedRecords: result.processedRecords,
        errors: result.errors
      })

      toast({
        title: "Importação concluída!",
        description: `${result.processedRecords} registros importados com sucesso.`,
      })

    } catch (error: any) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error.message || 'Erro na importação'
      })

      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação.",
        variant: "destructive",
      })
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: uploadProgress.status === 'uploading' || uploadProgress.status === 'processing'
  })

  const resetUpload = () => {
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: ''
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Tabela FIPE
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo CSV da tabela FIPE para importar os dados automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' 
              ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
          `}
        >
          <input {...getInputProps()} />
          
          {uploadProgress.status === 'idle' && (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte o arquivo CSV aqui'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ou clique para selecionar
              </p>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </>
          )}

          {(uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') && (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium mb-2">{uploadProgress.message}</p>
              <Progress value={uploadProgress.progress} className="w-full max-w-xs mx-auto" />
            </>
          )}

          {uploadProgress.status === 'completed' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium mb-2 text-green-600">{uploadProgress.message}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>📊 Total processado: {uploadProgress.totalRecords?.toLocaleString()}</p>
                <p>✅ Importados: {uploadProgress.processedRecords?.toLocaleString()}</p>
                {uploadProgress.errors && uploadProgress.errors > 0 && (
                  <p>❌ Erros: {uploadProgress.errors}</p>
                )}
              </div>
              <Button onClick={resetUpload} variant="outline" className="mt-4">
                Importar Outro Arquivo
              </Button>
            </>
          )}

          {uploadProgress.status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium mb-2 text-red-600">{uploadProgress.message}</p>
              <Button onClick={resetUpload} variant="outline" className="mt-4">
                Tentar Novamente
              </Button>
            </>
          )}
        </div>

        {/* Informações sobre o formato */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Formato esperado do arquivo CSV:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Colunas: Brand Value, Model Value, Year Code, Fipe Code, Price</li>
            <li>• Preço no formato: "R$ 14.105,00"</li>
            <li>• Ano no formato: "1991-1" (será convertido para 1991)</li>
            <li>• Tamanho máximo: 50MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
