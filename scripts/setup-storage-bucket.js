const { createClient } = require('@supabase/supabase-js')

// Usar as credenciais diretamente (não recomendado em produção)
const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupStorageBucket() {
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
      console.log('🔧 Tentando criar bucket vehicle-photos...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('vehicle-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError)
        console.log('💡 O bucket precisa ser criado manualmente no Supabase Dashboard')
        console.log('📋 Instruções:')
        console.log('   1. Acesse https://supabase.com/dashboard')
        console.log('   2. Vá para Storage')
        console.log('   3. Clique em "New bucket"')
        console.log('   4. Nome: vehicle-photos')
        console.log('   5. Marque "Public bucket"')
        console.log('   6. Configure as políticas RLS se necessário')
        return
      }
      
      console.log('✅ Bucket vehicle-photos criado com sucesso!')
    } else {
      console.log('✅ Bucket vehicle-photos já existe!')
    }
    
    // Testar se conseguimos acessar o bucket
    console.log('🧪 Testando acesso ao bucket...')
    
    const { data: files, error: listError } = await supabase.storage
      .from('vehicle-photos')
      .list('', { limit: 1 })
    
    if (listError) {
      console.error('❌ Erro ao acessar bucket:', listError)
      console.log('💡 Verifique as políticas RLS do bucket no Supabase Dashboard')
    } else {
      console.log('✅ Acesso ao bucket funcionando!')
      console.log('📁 Arquivos no bucket:', files.length)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

setupStorageBucket()
