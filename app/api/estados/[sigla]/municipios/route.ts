import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { sigla: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '1000');

    const sigla = params.sigla.toUpperCase();

    let query = supabase
      .from('ocar_municipios')
      .select(`
        id,
        codigo_ibge,
        nome,
        latitude,
        longitude,
        ocar_estados!inner(
          id,
          nome,
          sigla,
          regiao
        )
      `)
      .eq('ocar_estados.sigla', sigla)
      .order('nome')
      .limit(limit);

    // Buscar por nome se especificado
    if (search) {
      query = query.ilike('nome', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar municípios do estado:', error);
      return NextResponse.json({ error: 'Erro ao buscar municípios do estado' }, { status: 500 });
    }

    // Formatar resposta
    const municipios = data?.map(municipio => ({
      id: municipio.id,
      codigo_ibge: municipio.codigo_ibge,
      nome: municipio.nome,
      latitude: municipio.latitude,
      longitude: municipio.longitude,
      estado: {
        id: municipio.ocar_estados.id,
        nome: municipio.ocar_estados.nome,
        sigla: municipio.ocar_estados.sigla,
        regiao: municipio.ocar_estados.regiao
      }
    })) || [];

    return NextResponse.json(municipios);
  } catch (error) {
    console.error('Erro na API de municípios por estado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
