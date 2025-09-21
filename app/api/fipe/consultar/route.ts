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
    const modelo = searchParams.get('modelo');

    if (!marca || !veiculo || !ano || !modelo) {
      return NextResponse.json({ 
        error: 'Marca, veículo, ano e modelo são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar preço FIPE através das 3 tabelas relacionadas
    const { data, error } = await supabase
      .from('ocar_fipe_prices')
      .select(`
        year,
        reference_month,
        fipe_code,
        price,
        ocar_fipe_models!inner(
          name,
          ocar_fipe_brands!inner(name)
        )
      `)
      .eq('ocar_fipe_models.ocar_fipe_brands.name', marca)
      .ilike('ocar_fipe_models.name', `${veiculo}%`) // Buscar modelos que começam com o nome do veículo
      .eq('year', parseInt(ano))
      .ilike('ocar_fipe_models.name', `%${modelo}%`) // Buscar modelos que contenham o texto do modelo
      .order('year', { ascending: false })
      .order('reference_month', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao consultar FIPE:', error);
      return NextResponse.json({ error: 'Erro ao consultar FIPE' }, { status: 500 });
    }

    // Formatar resposta
    const resultado = data?.map(item => ({
      marca: item.ocar_fipe_models.ocar_fipe_brands.name,
      modelo: item.ocar_fipe_models.name,
      ano: item.year,
      fipe_code: item.fipe_code,
      reference_month: item.reference_month,
      price: item.price,
      status: 'ATUAL'
    })) || [];

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro na API de consulta FIPE:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
