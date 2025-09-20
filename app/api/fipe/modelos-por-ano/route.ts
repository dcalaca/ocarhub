import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca');
    const veiculo = searchParams.get('veiculo');
    const ano = searchParams.get('ano');

    if (!marca || !veiculo || !ano) {
      return NextResponse.json({ 
        error: 'Marca, veículo e ano são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar modelos através das 3 tabelas relacionadas
    const { data, error } = await supabase
      .from('ocar_fipe_prices')
      .select(`
        ocar_fipe_models!inner(
          id,
          name,
          ocar_fipe_brands!inner(name)
        )
      `)
      .eq('ocar_fipe_models.ocar_fipe_brands.name', marca)
      .ilike('ocar_fipe_models.name', `${veiculo}%`) // Buscar modelos que começam com o nome do veículo
      .eq('year', parseInt(ano));

    if (error) {
      console.error('Erro ao buscar modelos:', error);
      return NextResponse.json({ error: 'Erro ao buscar modelos' }, { status: 500 });
    }

    // Extrair modelos únicos e remover o nome do veículo do início
    const modelosUnicos = [...new Set(data?.map(item => ({
      id: item.ocar_fipe_models.id,
      name: item.ocar_fipe_models.name
    })) || [])].map(modelo => ({
      id: modelo.id,
      name: modelo.name.startsWith(veiculo) 
        ? modelo.name.substring(veiculo.length).trim()
        : modelo.name
    }));

    return NextResponse.json(modelosUnicos);
  } catch (error) {
    console.error('Erro na API de modelos por ano:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
