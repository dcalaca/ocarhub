const { createClient } = require('@supabase/supabase-js')

// Usar as credenciais diretamente
const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPhotoUpload() {
  try {
    console.log('🧪 Testando upload de foto...')
    
    // Criar um arquivo de teste simples (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testBlob = Buffer.from(testImageData, 'base64')
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
    
    const vehicleId = 'test-vehicle-123'
    const fileName = `${vehicleId}/0-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`
    
    console.log('📤 Fazendo upload para:', fileName)
    
    const { data, error } = await supabase.storage
      .from('vehicle-photos')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Erro no upload:', error)
      console.log('💡 Verifique se:')
      console.log('   1. O bucket vehicle-photos existe')
      console.log('   2. As políticas RLS estão configuradas')
      console.log('   3. O usuário está autenticado')
      return
    }
    
    console.log('✅ Upload bem-sucedido!')
    console.log('📁 Dados do upload:', data)
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(fileName)
    
    console.log('🔗 URL pública:', publicUrl)
    
    // Testar se conseguimos acessar a imagem
    try {
      const response = await fetch(publicUrl)
      if (response.ok) {
        console.log('✅ Imagem acessível publicamente!')
      } else {
        console.log('❌ Imagem não acessível:', response.status)
      }
    } catch (fetchError) {
      console.log('❌ Erro ao testar acesso à imagem:', fetchError.message)
    }
    
    // Limpar arquivo de teste
    console.log('🧹 Limpando arquivo de teste...')
    const { error: deleteError } = await supabase.storage
      .from('vehicle-photos')
      .remove([fileName])
    
    if (deleteError) {
      console.warn('⚠️ Erro ao limpar arquivo de teste:', deleteError)
    } else {
      console.log('✅ Arquivo de teste removido')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPhotoUpload()
