import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Criando tabela wishlist_veiculos...')
    
    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS wishlist_veiculos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100),
        versao VARCHAR(100),
        ano_min INTEGER,
        ano_max INTEGER,
        preco_min DECIMAL(12,2),
        preco_max DECIMAL(12,2),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_veiculos(user_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_marca ON wishlist_veiculos(marca);
      CREATE INDEX IF NOT EXISTS idx_wishlist_ativo ON wishlist_veiculos(ativo);
      CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist_veiculos(created_at);
    `

    const createTriggerSQL = `
      CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_update_wishlist_updated_at ON wishlist_veiculos;
      CREATE TRIGGER trigger_update_wishlist_updated_at
        BEFORE UPDATE ON wishlist_veiculos
        FOR EACH ROW
        EXECUTE FUNCTION update_wishlist_updated_at();
    `

    // Executar SQL via Supabase
    const { data: tableResult, error: tableError } = await supabase.rpc('exec', {
      sql: createTableSQL
    })

    if (tableError) {
      console.error('❌ Erro ao criar tabela:', tableError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao criar tabela',
        details: tableError.message 
      }, { status: 500 })
    }

    const { data: indexResult, error: indexError } = await supabase.rpc('exec', {
      sql: createIndexesSQL
    })

    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError)
    }

    const { data: triggerResult, error: triggerError } = await supabase.rpc('exec', {
      sql: createTriggerSQL
    })

    if (triggerError) {
      console.error('❌ Erro ao criar trigger:', triggerError)
    }

    console.log('✅ Tabela wishlist_veiculos criada com sucesso!')

    return NextResponse.json({ 
      success: true, 
      message: 'Tabela wishlist_veiculos criada com sucesso!',
      tableResult,
      indexResult,
      triggerResult
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
