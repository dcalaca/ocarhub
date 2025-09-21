const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSimpleUpload() {
  try {
    console.log('🧪 Testando upload simples...')
    
    // Criar um arquivo de teste
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testBlob = Buffer.from(testImageData, 'base64')
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
    
    const fileName = `test-${Date.now()}.png`
    
    console.log('📤 Fazendo upload para:', fileName)
    
    const { data, error } = await supabase.storage
      .from('vehicle-photos')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Erro no upload:', error)
      
      if (error.message.includes('row-level security')) {
        console.log('💡 Solução: Execute no Supabase SQL Editor:')
        console.log('   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;')
      }
      
      return
    }
    
    console.log('✅ Upload bem-sucedido!')
    console.log('📁 Dados:', data)
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(fileName)
    
    console.log('🔗 URL pública:', publicUrl)
    
    // Testar acesso à imagem
    try {
      const response = await fetch(publicUrl)
      if (response.ok) {
        console.log('✅ Imagem acessível publicamente!')
      } else {
        console.log('❌ Imagem não acessível:', response.status)
      }
    } catch (fetchError) {
      console.log('❌ Erro ao testar acesso:', fetchError.message)
    }
    
    // Limpar arquivo de teste
    console.log('🧹 Limpando arquivo de teste...')
    const { error: deleteError } = await supabase.storage
      .from('vehicle-photos')
      .remove([fileName])
    
    if (deleteError) {
      console.warn('⚠️ Erro ao limpar:', deleteError.message)
    } else {
      console.log('✅ Arquivo removido')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testSimpleUpload()
