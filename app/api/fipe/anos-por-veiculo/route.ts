import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca');
    const veiculo = searchParams.get('veiculo');

    if (!marca || !veiculo) {
      return NextResponse.json({ 
        error: 'Marca e veículo são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar anos através das 3 tabelas relacionadas (sem modelo específico)
    const { data, error } = await supabase
      .from('ocar_fipe_prices')
      .select(`
        year,
        ocar_fipe_models!inner(
          name,
          ocar_fipe_brands!inner(name)
        )
      `)
      .eq('ocar_fipe_models.ocar_fipe_brands.name', marca)
      .ilike('ocar_fipe_models.name', `${veiculo}%`) // Buscar modelos que começam com o nome do veículo
      .order('year', { ascending: false });

    if (error) {
      console.error('Erro ao buscar anos:', error);
      return NextResponse.json({ error: 'Erro ao buscar anos' }, { status: 500 });
    }

    // Extrair anos únicos e priorizar anos mais recentes
    const anosUnicos = [...new Set(data?.map(item => item.year) || [])]
      .filter(ano => ano && ano > 1990) // Filtrar anos válidos
      .sort((a, b) => b - a) // Ordenar do mais recente para o mais antigo
      .map(ano => ({ ano }));

    return NextResponse.json(anosUnicos);
  } catch (error) {
    console.error('Erro na API de anos por veículo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
