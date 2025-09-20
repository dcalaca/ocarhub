import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixPricesTable() {
  console.log('🔧 Verificando e corrigindo tabela ocar_fipe_prices...\n')

  try {
    // Primeiro, vamos tentar inserir um registro de teste para ver se a tabela existe
    console.log('🧪 Testando inserção na ocar_fipe_prices...')
    
    const { data: testInsert, error: testError } = await supabase
      .from('ocar_fipe_prices')
      .insert({
        model_id: '00000000-0000-0000-0000-000000000000', // UUID inválido para teste
        version: 'Teste',
        year: 2024,
        fipe_code: 'TESTE',
        reference_month: '2024-01',
        price: 1000.00
      })
      .select()

    if (testError) {
      console.log('   Erro ao inserir:', testError.message)
      
      if (testError.message.includes('relation "ocar_fipe_prices" does not exist')) {
        console.log('   ❌ Tabela ocar_fipe_prices não existe!')
        console.log('   📝 Execute este SQL no Supabase SQL Editor:')
        console.log(`
CREATE TABLE IF NOT EXISTS public.ocar_fipe_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.ocar_fipe_models(id),
  version VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fipe_code VARCHAR(20) NOT NULL,
  reference_month VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (model_id, version, year, reference_month)
);

-- Comentário da tabela
COMMENT ON TABLE public.ocar_fipe_prices IS 'Tabela de preços FIPE normalizada';
        `)
      } else {
        console.log('   ⚠️ Outro erro:', testError.message)
      }
    } else {
      console.log('   ✅ Tabela existe e funcionando!')
      
      // Remover o registro de teste
      await supabase
        .from('ocar_fipe_prices')
        .delete()
        .eq('fipe_code', 'TESTE')
    }

  } catch (error) {
    console.error('Erro ao verificar tabela ocar_fipe_prices:', error.message)
  }
}

fixPricesTable()
