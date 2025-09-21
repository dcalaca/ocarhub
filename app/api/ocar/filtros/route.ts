import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const marca = searchParams.get('marca')
    const modelo_base = searchParams.get('modelo_base')
    const versao = searchParams.get('versao')
    const ano = searchParams.get('ano')

    // Validar parâmetros
    const anoNumber = ano ? parseInt(ano) : null
    if (ano && isNaN(anoNumber!)) {
      return NextResponse.json(
        { error: 'Parâmetro ano deve ser um número válido' },
        { status: 400 }
      )
    }

    // Chamar função SQL
    const { data, error } = await supabase.rpc('ocarhub_filtros', {
      p_marca: marca || null,
      p_modelo_base: modelo_base || null,
      p_versao: versao || null,
      p_ano: anoNumber
    })

    if (error) {
      console.error('Erro na função ocarhub_filtros:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro no endpoint /api/ocar/filtros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marca, modelo_base, versao, ano } = body

    // Validar parâmetros
    if (ano && isNaN(parseInt(ano))) {
      return NextResponse.json(
        { error: 'Parâmetro ano deve ser um número válido' },
        { status: 400 }
      )
    }

    // Chamar função SQL
    const { data, error } = await supabase.rpc('ocar_filtros_existing', {
      p_marca: marca || null,
      p_modelo_base: modelo_base || null,
      p_versao: versao || null,
      p_ano: ano ? parseInt(ano) : null
    })

    if (error) {
      console.error('Erro na função ocarhub_filtros:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro no endpoint /api/ocar/filtros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
