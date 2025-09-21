const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStorageBucket() {
  try {
    console.log('🔍 Verificando bucket vehicle-photos...')
    
    // Listar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError)
      return
    }
    
    console.log('📦 Buckets encontrados:', buckets.map(b => b.name))
    
    const vehiclePhotosBucket = buckets.find(b => b.name === 'vehicle-photos')
    
    if (!vehiclePhotosBucket) {
      console.log('❌ Bucket vehicle-photos não encontrado!')
      console.log('🔧 Criando bucket vehicle-photos...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('vehicle-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError)
        return
      }
      
      console.log('✅ Bucket vehicle-photos criado com sucesso!')
    } else {
      console.log('✅ Bucket vehicle-photos já existe!')
    }
    
    // Testar upload de uma imagem de teste
    console.log('🧪 Testando upload...')
    
    // Criar um arquivo de teste simples
    const testContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const testBlob = new Blob([testContent], { type: 'image/png' })
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vehicle-photos')
      .upload('test/test-image.png', testFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Erro no upload de teste:', uploadError)
      return
    }
    
    console.log('✅ Upload de teste bem-sucedido!')
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl('test/test-image.png')
    
    console.log('🔗 URL pública:', publicUrl)
    
    // Limpar arquivo de teste
    const { error: deleteError } = await supabase.storage
      .from('vehicle-photos')
      .remove(['test/test-image.png'])
    
    if (deleteError) {
      console.warn('⚠️ Erro ao limpar arquivo de teste:', deleteError)
    } else {
      console.log('🧹 Arquivo de teste removido')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testStorageBucket()
