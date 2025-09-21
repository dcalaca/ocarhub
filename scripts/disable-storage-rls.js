const { createClient } = require('@supabase/supabase-js')

// Usar service role key para ter permissões administrativas
const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableStorageRLS() {
  try {
    console.log('🔧 Desabilitando RLS temporariamente para storage...')
    
    // Desabilitar RLS na tabela storage.objects
    const { error } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Erro ao acessar storage.objects:', error.message)
      return
    }
    
    console.log('✅ Acesso ao storage funcionando!')
    console.log('💡 Para desabilitar RLS completamente, execute no SQL Editor:')
    console.log('   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;')
    
    // Testar upload direto
    console.log('🧪 Testando upload direto...')
    
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testBlob = Buffer.from(testImageData, 'base64')
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
    
    const fileName = `test-${Date.now()}.png`
    
    const { data, error: uploadError } = await supabase.storage
      .from('vehicle-photos')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError)
      console.log('💡 Soluções:')
      console.log('   1. Execute no SQL Editor: ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;')
      console.log('   2. Ou configure as políticas RLS manualmente no Dashboard')
    } else {
      console.log('✅ Upload funcionando!')
      console.log('📁 Dados:', data)
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(fileName)
      
      console.log('🔗 URL pública:', publicUrl)
      
      // Limpar arquivo de teste
      await supabase.storage
        .from('vehicle-photos')
        .remove([fileName])
      
      console.log('🧹 Arquivo de teste removido')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

disableStorageRLS()
