/**
 * Script para configurar o Supabase Storage para fotos de veículos
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  try {
    console.log('🚀 Configurando Supabase Storage...')

    // Criar bucket para fotos de veículos
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('vehicle-photos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "vehicle-photos" já existe')
      } else {
        console.error('❌ Erro ao criar bucket:', bucketError)
        throw bucketError
      }
    } else {
      console.log('✅ Bucket "vehicle-photos" criado com sucesso')
    }

    // Configurar políticas RLS para o bucket
    console.log('🔐 Configurando políticas de acesso...')
    
    // Política para permitir leitura pública
    const { error: readPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'vehicle-photos',
      policy_name: 'Public read access for vehicle photos',
      policy_definition: 'true',
      policy_check: 'true',
      policy_roles: 'public'
    })

    if (readPolicyError && !readPolicyError.message.includes('already exists')) {
      console.error('❌ Erro ao criar política de leitura:', readPolicyError)
    } else {
      console.log('✅ Política de leitura pública configurada')
    }

    // Política para permitir upload apenas para usuários autenticados
    const { error: writePolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'vehicle-photos',
      policy_name: 'Authenticated users can upload vehicle photos',
      policy_definition: 'auth.role() = \'authenticated\'',
      policy_check: 'auth.role() = \'authenticated\'',
      policy_roles: 'authenticated'
    })

    if (writePolicyError && !writePolicyError.message.includes('already exists')) {
      console.error('❌ Erro ao criar política de upload:', writePolicyError)
    } else {
      console.log('✅ Política de upload para usuários autenticados configurada')
    }

    console.log('🎉 Configuração do Storage concluída!')
    console.log('📝 Próximos passos:')
    console.log('   1. Teste o upload de fotos na página de anúncio')
    console.log('   2. Verifique se as imagens aparecem em "Meus Anúncios"')

  } catch (error) {
    console.error('❌ Erro na configuração do Storage:', error)
    process.exit(1)
  }
}

setupStorage()
