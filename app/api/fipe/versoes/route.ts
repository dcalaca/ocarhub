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
    const modelo = searchParams.get('modelo');

    if (!marca || !modelo) {
      return NextResponse.json({ error: 'Marca e modelo são obrigatórios' }, { status: 400 });
    }

    // Buscar versões por marca e modelo
    const { data, error } = await supabase
      .from('ocar_fipe_prices')
      .select(`
        fipe_code,
        ocar_fipe_models!inner(
          name,
          ocar_fipe_brands!inner(name)
        )
      `)
      .eq('ocar_fipe_models.ocar_fipe_brands.name', marca)
      .ilike('ocar_fipe_models.name', `%${modelo}%`)
      .order('fipe_code');

    if (error) {
      console.error('Erro ao buscar versões:', error);
      return NextResponse.json({ error: 'Erro ao buscar versões' }, { status: 500 });
    }

    // Extrair versões únicas
    const versoesUnicas = [...new Set(data?.map(item => item.fipe_code) || [])]
      .map(fipeCode => {
        const item = data?.find(d => d.fipe_code === fipeCode);
        return {
          id: fipeCode,
          name: item?.ocar_fipe_models.name || modelo
        };
      });

    return NextResponse.json(versoesUnicas);
  } catch (error) {
    console.error('Erro na API de versões:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}