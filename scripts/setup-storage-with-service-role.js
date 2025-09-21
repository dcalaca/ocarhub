const { createClient } = require('@supabase/supabase-js')

// Usar service role key para ter permissões administrativas
const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStoragePolicies() {
  try {
    console.log('🔧 Configurando políticas RLS para storage...')
    
    // 1. Habilitar RLS
    console.log('1️⃣ Habilitando RLS...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    })
    
    if (rlsError) {
      console.log('⚠️ RLS já estava habilitado ou erro:', rlsError.message)
    } else {
      console.log('✅ RLS habilitado')
    }
    
    // 2. Remover políticas existentes
    console.log('2️⃣ Removendo políticas existentes...')
    const policies = [
      'Public read access for vehicle photos',
      'Authenticated users can upload vehicle photos', 
      'Users can update vehicle photos',
      'Users can delete vehicle photos'
    ]
    
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON storage.objects;`
      })
      if (error) {
        console.log(`⚠️ Erro ao remover política ${policy}:`, error.message)
      }
    }
    
    // 3. Criar política de leitura pública
    console.log('3️⃣ Criando política de leitura pública...')
    const { error: readError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Public read access for vehicle photos" ON storage.objects
            FOR SELECT USING (bucket_id = 'vehicle-photos');`
    })
    
    if (readError) {
      console.error('❌ Erro ao criar política de leitura:', readError)
    } else {
      console.log('✅ Política de leitura criada')
    }
    
    // 4. Criar política de upload
    console.log('4️⃣ Criando política de upload...')
    const { error: uploadError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Authenticated users can upload vehicle photos" ON storage.objects
            FOR INSERT WITH CHECK (
              bucket_id = 'vehicle-photos' 
              AND auth.role() = 'authenticated'
            );`
    })
    
    if (uploadError) {
      console.error('❌ Erro ao criar política de upload:', uploadError)
    } else {
      console.log('✅ Política de upload criada')
    }
    
    // 5. Criar política de atualização
    console.log('5️⃣ Criando política de atualização...')
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can update vehicle photos" ON storage.objects
            FOR UPDATE USING (
              bucket_id = 'vehicle-photos' 
              AND auth.role() = 'authenticated'
            );`
    })
    
    if (updateError) {
      console.error('❌ Erro ao criar política de atualização:', updateError)
    } else {
      console.log('✅ Política de atualização criada')
    }
    
    // 6. Criar política de exclusão
    console.log('6️⃣ Criando política de exclusão...')
    const { error: deleteError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Users can delete vehicle photos" ON storage.objects
            FOR DELETE USING (
              bucket_id = 'vehicle-photos' 
              AND auth.role() = 'authenticated'
            );`
    })
    
    if (deleteError) {
      console.error('❌ Erro ao criar política de exclusão:', deleteError)
    } else {
      console.log('✅ Política de exclusão criada')
    }
    
    // 7. Verificar políticas criadas
    console.log('7️⃣ Verificando políticas criadas...')
    const { data: policiesList, error: listError } = await supabase.rpc('exec_sql', {
      sql: `SELECT policyname FROM pg_policies 
            WHERE tablename = 'objects' AND schemaname = 'storage';`
    })
    
    if (listError) {
      console.error('❌ Erro ao listar políticas:', listError)
    } else {
      console.log('📋 Políticas encontradas:', policiesList)
    }
    
    console.log('🎉 Configuração de storage concluída!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

setupStoragePolicies()
