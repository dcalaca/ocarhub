// Serviço para integração com API da Infosimples
// Documentação: https://api.infosimples.com/consultas/docs/

export interface InfosimplesConfig {
  token: string
  timeout?: number
  ignoreSiteReceipt?: boolean
}

export interface InfosimplesResponse<T = any> {
  code: number
  code_message: string
  data: T[]
  data_count: number
  errors: string[]
  site_receipts: string[]
  header: {
    api_version: string
    product: string
    service: string
    parameters: any
    client_name: string
    token_name: string
    billable: boolean
    price: number
    requested_at: string
    elapsed_time_in_milliseconds: number
    remote_ip: string
    signature: string
  }
}

export interface VehicleHistoryData {
  placa: string
  renavam?: string
  chassi?: string
  marca?: string
  modelo?: string
  ano?: string
  cor?: string
  municipio?: string
  uf?: string
  situacao?: string
  multas?: MultaData[]
  ipva?: IPVAData[]
  licenciamento?: LicenciamentoData[]
  restricoes?: RestricaoData[]
  gravames?: GravameData[]
}

export interface MultaData {
  numero_auto?: string
  data_infracao?: string
  data_vencimento?: string
  valor?: number
  situacao?: string
  descricao?: string
  local?: string
  orgao?: string
  pontos?: number
  veiculo?: string
}

export interface IPVAData {
  ano?: string
  valor?: number
  situacao?: string
  data_vencimento?: string
  parcela?: string
  valor_pago?: number
  data_pagamento?: string
}

export interface LicenciamentoData {
  ano?: string
  situacao?: string
  data_vencimento?: string
  valor?: number
  observacoes?: string
}

export interface RestricaoData {
  tipo?: string
  descricao?: string
  data?: string
  orgao?: string
  situacao?: string
}

export interface GravameData {
  credor?: string
  data_gravame?: string
  valor?: number
  situacao?: string
  observacoes?: string
}

export class InfosimplesService {
  private static readonly BASE_URL = 'https://api.infosimples.com/api/v2/consultas'
  private static readonly TOKEN = process.env.INFOSIMPLES_API_TOKEN || 'TdVpXpssXTPb3S6AWTIfIKxDnkiuI5iLBKtyFd63'

  // Consultar multas por placa
  static async consultarMultas(placa: string, estado?: string): Promise<InfosimplesResponse<MultaData>> {
    return this.makeRequestViaAPI('multas', placa, estado)
  }

  // Consultar IPVA por placa
  static async consultarIPVA(placa: string, estado?: string): Promise<InfosimplesResponse<IPVAData>> {
    return this.makeRequestViaAPI('ipva', placa, estado)
  }

  // Consultar licenciamento por placa
  static async consultarLicenciamento(placa: string, estado?: string): Promise<InfosimplesResponse<LicenciamentoData>> {
    return this.makeRequestViaAPI('licenciamento', placa, estado)
  }

  // Consultar restrições por placa
  static async consultarRestricoes(placa: string, estado?: string): Promise<InfosimplesResponse<RestricaoData>> {
    return this.makeRequestViaAPI('restricoes', placa, estado)
  }

  // Consultar gravames por placa
  static async consultarGravames(placa: string, estado?: string): Promise<InfosimplesResponse<GravameData>> {
    return this.makeRequestViaAPI('gravames', placa, estado)
  }

  // Consultar dados completos do veículo
  static async consultarVeiculo(placa: string, estado?: string): Promise<InfosimplesResponse<VehicleHistoryData>> {
    return this.makeRequestViaAPI('veiculo', placa, estado)
  }

  // Consulta unificada de histórico veicular
  static async consultarHistoricoCompleto(placa: string, estado?: string): Promise<{
    veiculo: VehicleHistoryData | null
    multas: MultaData[]
    ipva: IPVAData[]
    licenciamento: LicenciamentoData[]
    restricoes: RestricaoData[]
    gravames: GravameData[]
    custo_total: number
    erros: string[]
    sem_saldo_infosimples?: boolean
  }> {
    const placaLimpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const erros: string[] = []
    let custoTotal = 0

    try {
      console.log('🔍 Consultando histórico para placa:', placaLimpa)
      
      // Tentar fazer consulta real primeiro
      try {
        const dadosReais = await this.consultarDadosReais(placaLimpa, estado)
        return {
          ...dadosReais,
          custo_total: 25.00,
          erros
        }
      } catch (error: any) {
        console.log('❌ Erro na consulta real:', error.message)
        
        // Verificar se é erro de saldo insuficiente
        if (error.message.includes('601') || error.message.includes('603') || error.message.includes('606') || 
            error.message.includes('saldo') || error.message.includes('crédito')) {
          console.log('💰 Erro de saldo detectado - retornando dados vazios')
          return {
            veiculo: null,
            multas: [],
            ipva: [],
            licenciamento: [],
            restricoes: [],
            gravames: [],
            custo_total: 0,
            erros: ['Sem saldo na Infosimples para realizar a consulta'],
            sem_saldo_infosimples: true
          }
        }
        
        // Para outros erros, retornar dados vazios também
        return {
          veiculo: null,
          multas: [],
          ipva: [],
          licenciamento: [],
          restricoes: [],
          gravames: [],
          custo_total: 0,
          erros: ['Erro na consulta: ' + error.message],
          sem_saldo_infosimples: false
        }
      }
    } catch (error) {
      console.error('Erro na consulta de histórico completo:', error)
      throw new Error('Erro ao consultar histórico veicular')
    }
  }

  // Método para consultar dados reais da Infosimples
  private static async consultarDadosReais(placa: string, estado?: string): Promise<{
    veiculo: VehicleHistoryData | null
    multas: MultaData[]
    ipva: IPVAData[]
    licenciamento: LicenciamentoData[]
    restricoes: RestricaoData[]
    gravames: GravameData[]
  }> {
    const erros: string[] = []
    
    // Consultar dados do veículo
    const veiculoData = await this.makeRequestViaAPI<VehicleHistoryData>('veiculo', placa, estado)
    const veiculo = veiculoData.data?.[0] || null

    // Consultar multas
    const multasData = await this.makeRequestViaAPI<MultaData>('multas', placa, estado)
    const multas = multasData.data || []

    // Consultar IPVA
    const ipvaData = await this.makeRequestViaAPI<IPVAData>('ipva', placa, estado)
    const ipva = ipvaData.data || []

    // Consultar licenciamento
    const licenciamentoData = await this.makeRequestViaAPI<LicenciamentoData>('licenciamento', placa, estado)
    const licenciamento = licenciamentoData.data || []

    // Consultar restrições
    const restricoesData = await this.makeRequestViaAPI<RestricaoData>('restricoes', placa, estado)
    const restricoes = restricoesData.data || []

    // Consultar gravames
    const gravamesData = await this.makeRequestViaAPI<GravameData>('gravames', placa, estado)
    const gravames = gravamesData.data || []

    return {
      veiculo,
      multas,
      ipva,
      licenciamento,
      restricoes,
      gravames
    }
  }

  // Método privado para fazer requisições via API route
  private static async makeRequestViaAPI<T>(tipo: string, placa: string, estado?: string): Promise<InfosimplesResponse<T>> {
    try {
      const response = await fetch('/api/infosimples/consultar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placa,
          estado,
          tipo
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Verificar se houve erro na API
      if (data.code !== 200) {
        throw new Error(`API Error ${data.code}: ${data.code_message}`)
      }

      return data
    } catch (error) {
      console.error('Erro na requisição para Infosimples via API route:', error)
      throw error
    }
  }

  // Método privado para fazer requisições diretas (mantido para compatibilidade)
  private static async makeRequest<T>(service: string, parameters: any): Promise<InfosimplesResponse<T>> {
    const url = `${this.BASE_URL}/${service}`
    
    const requestData = {
      token: this.TOKEN,
      timeout: 60,
      ignore_site_receipt: 0,
      ...parameters
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Verificar se houve erro na API
      if (data.code !== 200) {
        throw new Error(`API Error ${data.code}: ${data.code_message}`)
      }

      return data
    } catch (error) {
      console.error('Erro na requisição para Infosimples:', error)
      throw error
    }
  }

  // Verificar saldo da conta
  static async verificarSaldo(): Promise<{ saldo: number; creditos: number }> {
    try {
      const response = await fetch('https://api.infosimples.com/api/v2/conta', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        saldo: data.saldo || 0,
        creditos: data.creditos || 0
      }
    } catch (error) {
      console.error('Erro ao verificar saldo:', error)
      return { saldo: 0, creditos: 0 }
    }
  }

  // Validar formato de placa
  static validarPlaca(placa: string): { valida: boolean; formatada?: string; erro?: string } {
    const placaLimpa = placa.replace(/[^A-Z0-9]/g, '').toUpperCase()
    
    // Verificar se tem 7 caracteres (formato antigo) ou 8 caracteres (formato Mercosul)
    if (placaLimpa.length === 7) {
      // Formato antigo: ABC1234 ou ABC1D23 (com letra no meio)
      const regexAntigo = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/
      if (regexAntigo.test(placaLimpa)) {
        return { valida: true, formatada: placaLimpa }
      }
    } else if (placaLimpa.length === 8) {
      // Formato Mercosul: ABC1D23 ou ABC1D2A (aceita letra no final também)
      const regexMercosul = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/
      if (regexMercosul.test(placaLimpa)) {
        return { valida: true, formatada: placaLimpa }
      }
    }
    
    return { 
      valida: false, 
      erro: 'Placa inválida. Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul)' 
    }
  }

  // Obter estados disponíveis para consulta
  static getEstadosDisponiveis(): { sigla: string; nome: string; disponivel: boolean }[] {
    return [
      { sigla: 'AC', nome: 'Acre', disponivel: true },
      { sigla: 'AL', nome: 'Alagoas', disponivel: true },
      { sigla: 'AM', nome: 'Amazonas', disponivel: true },
      { sigla: 'AP', nome: 'Amapá', disponivel: true },
      { sigla: 'BA', nome: 'Bahia', disponivel: true },
      { sigla: 'CE', nome: 'Ceará', disponivel: true },
      { sigla: 'DF', nome: 'Distrito Federal', disponivel: true },
      { sigla: 'ES', nome: 'Espírito Santo', disponivel: true },
      { sigla: 'GO', nome: 'Goiás', disponivel: true },
      { sigla: 'MA', nome: 'Maranhão', disponivel: true },
      { sigla: 'MG', nome: 'Minas Gerais', disponivel: true },
      { sigla: 'MS', nome: 'Mato Grosso do Sul', disponivel: true },
      { sigla: 'MT', nome: 'Mato Grosso', disponivel: true },
      { sigla: 'PA', nome: 'Pará', disponivel: true },
      { sigla: 'PB', nome: 'Paraíba', disponivel: true },
      { sigla: 'PE', nome: 'Pernambuco', disponivel: true },
      { sigla: 'PI', nome: 'Piauí', disponivel: true },
      { sigla: 'PR', nome: 'Paraná', disponivel: true },
      { sigla: 'RJ', nome: 'Rio de Janeiro', disponivel: true },
      { sigla: 'RN', nome: 'Rio Grande do Norte', disponivel: true },
      { sigla: 'RO', nome: 'Rondônia', disponivel: true },
      { sigla: 'RR', nome: 'Roraima', disponivel: true },
      { sigla: 'RS', nome: 'Rio Grande do Sul', disponivel: true },
      { sigla: 'SC', nome: 'Santa Catarina', disponivel: true },
      { sigla: 'SE', nome: 'Sergipe', disponivel: true },
      { sigla: 'SP', nome: 'São Paulo', disponivel: true },
      { sigla: 'TO', nome: 'Tocantins', disponivel: true }
    ]
  }
}
