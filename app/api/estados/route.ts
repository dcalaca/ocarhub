import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regiao = searchParams.get('regiao');
    const search = searchParams.get('search');

    let query = supabase
      .from('ocar_estados')
      .select(`
        id,
        codigo_ibge,
        nome,
        sigla,
        regiao,
        created_at
      `)
      .order('nome');

    // Filtrar por região se especificada
    if (regiao) {
      query = query.eq('regiao', regiao);
    }

    // Buscar por nome se especificado
    if (search) {
      query = query.ilike('nome', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar estados:', error);
      return NextResponse.json({ error: 'Erro ao buscar estados' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de estados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
