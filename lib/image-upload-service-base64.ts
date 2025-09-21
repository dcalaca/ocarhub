export class ImageUploadService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  /**
   * Upload de uma única imagem convertendo para base64
   */
  static async uploadImage(file: File, vehicleId: string, index: number): Promise<string> {
    try {
      // Validar arquivo
      if (!this.validateFile(file)) {
        throw new Error('Arquivo inválido')
      }

      console.log('📤 Convertendo imagem para base64:', file.name)

      // Converter arquivo para base64
      const base64 = await this.fileToBase64(file)
      
      console.log('✅ Imagem convertida para base64')
      return base64

    } catch (error) {
      console.error('❌ Erro ao converter imagem:', error)
      throw error
    }
  }

  /**
   * Upload de múltiplas imagens
   */
  static async uploadImages(files: File[], vehicleId: string): Promise<string[]> {
    try {
      console.log(`📤 Convertendo ${files.length} imagens para base64 para veículo ${vehicleId}`)
      
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, vehicleId, index)
      )

      const urls = await Promise.all(uploadPromises)
      console.log('✅ Todas as imagens foram convertidas:', urls.length)
      
      return urls

    } catch (error) {
      console.error('❌ Erro ao converter imagens:', error)
      throw error
    }
  }

  /**
   * Converter arquivo para base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
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
   * Deletar imagem (não aplicável para base64)
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    console.log('ℹ️ Deletar imagem não aplicável para base64')
  }
}
