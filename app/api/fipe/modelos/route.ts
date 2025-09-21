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

    if (!marca) {
      return NextResponse.json({ error: 'Marca é obrigatória' }, { status: 400 });
    }

    // Buscar veículos (nomes únicos) por marca
    const { data, error } = await supabase.rpc('listar_veiculos_por_marca', {
      p_marca: marca
    });

    if (error) {
      console.error('Erro ao buscar veículos:', error);
      return NextResponse.json({ error: 'Erro ao buscar veículos' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de veículos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
