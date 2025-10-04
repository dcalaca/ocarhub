import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route Infosimples chamada')
    
    const body = await request.json()
    console.log('📝 Body recebido:', body)
    
    const { placa, estado, tipo, renavam, login_cpf, login_cnpj, login_senha } = body

    if (!placa) {
      return NextResponse.json(
        { error: 'Placa é obrigatória' },
        { status: 400 }
      )
    }

    if (tipo === 'debitos' && !renavam) {
      return NextResponse.json(
        { error: 'RENAVAM é obrigatório para consulta de débitos' },
        { status: 400 }
      )
    }

    const token = process.env.INFOSIMPLES_API_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: 'Token da Infosimples não configurado' },
        { status: 500 }
      )
    }

    // Determinar o serviço baseado no tipo
    let service = ''
    switch (tipo) {
      case 'multas':
        service = estado ? `detran/${estado.toLowerCase()}/multas` : 'detran/sp/multas' // Default SP
        break
      case 'ipva':
        service = estado ? `detran/${estado.toLowerCase()}/ipva` : 'detran/sp/ipva' // Default SP
        break
      case 'licenciamento':
        service = estado ? `detran/${estado.toLowerCase()}/licenciamento` : 'detran/sp/licenciamento' // Default SP
        break
      case 'restricoes':
        // Usar API unificada de restrições
        service = 'detran/restricoes'
        break
      case 'debitos':
        service = estado ? `detran/${estado.toLowerCase()}/debitos` : 'detran/sp/debitos' // Default SP
        break
      case 'gravames':
        service = estado ? `detran/${estado.toLowerCase()}/gravame` : 'detran/sp/gravame' // Default SP
        break
      case 'veiculo':
        service = estado ? `detran/${estado.toLowerCase()}/veiculo` : 'detran/sp/veiculo' // Default SP
        break
      case 'multas_sp':
        service = 'pref/sp/sao-paulo/multas-guias'
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de consulta inválido' },
          { status: 400 }
        )
    }

    const url = `https://api.infosimples.com/api/v2/consultas/${service}`
    console.log('🌐 URL:', url)
    
    const requestData = {
      token,
      timeout: 60,
      ignore_site_receipt: 0,
      placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      ...(renavam && { renavam: renavam.replace(/[^0-9]/g, '') }),
      ...(login_cpf && { login_cpf: login_cpf.replace(/[^0-9]/g, '') }),
      ...(login_cnpj && { login_cnpj: login_cnpj.replace(/[^0-9]/g, '') }),
      ...(login_senha && { login_senha }),
      ...(estado && { estado: estado.toUpperCase() })
    }
    console.log('📤 Dados da requisição:', requestData)

    console.log('🚀 Fazendo requisição...')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    
    console.log('📥 Status da resposta:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro da API:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Dados recebidos:', data)
    
    // Verificar se houve erro na API
    if (data.code !== 200) {
      console.log('❌ Erro da API Infosimples:', data.code, data.code_message)
      throw new Error(`API Error ${data.code}: ${data.code_message}`)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API route:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao consultar dados do veículo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}