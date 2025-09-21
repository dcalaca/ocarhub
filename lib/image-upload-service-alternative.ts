import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'vehicle-photos'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  /**
   * Upload de uma única imagem para o Supabase Storage
   */
  static async uploadImage(file: File, vehicleId: string, index: number): Promise<string> {
    try {
      // Validar arquivo
      if (!this.validateFile(file)) {
        throw new Error('Arquivo inválido')
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${vehicleId}/${index}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      console.log('📤 Fazendo upload da imagem:', fileName)

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Erro no upload:', error)
        
        // Se for erro de RLS, tentar com nome de arquivo diferente
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          console.log('🔄 Tentando com nome de arquivo diferente...')
          const alternativeFileName = `public/${vehicleId}/${index}-${Date.now()}.${fileExt}`
          
          const { data: retryData, error: retryError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(alternativeFileName, file, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (retryError) {
            throw retryError
          }
          
          // Obter URL pública da imagem
          const { data: { publicUrl } } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(alternativeFileName)

          console.log('✅ Imagem enviada com sucesso (retry):', publicUrl)
          return publicUrl
        }
        
        throw error
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      console.log('✅ Imagem enviada com sucesso:', publicUrl)
      return publicUrl

    } catch (error) {
      console.error('❌ Erro no upload da imagem:', error)
      throw error
    }
  }

  /**
   * Upload de múltiplas imagens
   */
  static async uploadImages(files: File[], vehicleId: string): Promise<string[]> {
    try {
      console.log(`📤 Fazendo upload de ${files.length} imagens para veículo ${vehicleId}`)
      
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, vehicleId, index)
      )

      const urls = await Promise.all(uploadPromises)
      console.log('✅ Todas as imagens foram enviadas:', urls)
      
      return urls

    } catch (error) {
      console.error('❌ Erro no upload das imagens:', error)
      throw error
    }
  }

  /**
   * Validar arquivo de imagem
   */
  private static validateFile(file: File): boolean {
    // Verificar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      console.error('❌ Tipo de arquivo não permitido:', file.type)
      return false
    }

    // Verificar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      console.error('❌ Arquivo muito grande:', file.size)
      return false
    }

    return true
  }

  /**
   * Deletar imagem do storage
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extrair nome do arquivo da URL
      const fileName = imageUrl.split('/').pop()
      if (!fileName) {
        throw new Error('URL inválida')
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName])

      if (error) {
        console.error('❌ Erro ao deletar imagem:', error)
        throw error
      }

      console.log('✅ Imagem deletada:', fileName)

    } catch (error) {
      console.error('❌ Erro ao deletar imagem:', error)
      throw error
    }
  }
}
