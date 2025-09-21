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
    const modelo = searchParams.get('modelo');

    if (!marca || !veiculo || !modelo) {
      return NextResponse.json({ error: 'Marca, veículo e modelo são obrigatórios' }, { status: 400 });
    }

    // Buscar versões (códigos FIPE) por modelo
    const { data, error } = await supabase.rpc('listar_versoes_por_modelo', {
      p_marca: marca,
      p_veiculo: veiculo,
      p_modelo: modelo
    });

    if (error) {
      console.error('Erro ao buscar versões:', error);
      return NextResponse.json({ error: 'Erro ao buscar versões' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de versões:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
