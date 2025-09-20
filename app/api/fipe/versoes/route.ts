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
      return NextResponse.json({ error: 'Marca e veículo são obrigatórios' }, { status: 400 });
    }

    // Buscar modelos por veículo
    const { data, error } = await supabase.rpc('listar_modelos_por_veiculo', {
      p_marca: marca,
      p_veiculo: veiculo
    });

    if (error) {
      console.error('Erro ao buscar modelos:', error);
      return NextResponse.json({ error: 'Erro ao buscar modelos' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de modelos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}