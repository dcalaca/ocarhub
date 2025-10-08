import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface FipeConsultaResult {
  marca: string
  modelo: string
  ano: number
  fipe_code: string
  reference_month: string
  price: number
  status: string
}

export class FipeConsultaService {
  private static latestMonth: string | null = null
  private static lastUpdate: number = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  // Obter o mês de referência mais recente (com cache)
  static async getLatestReferenceMonth(): Promise<string> {
    const now = Date.now()
    
    // Verificar se o cache ainda é válido
    if (this.latestMonth && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.latestMonth
    }

    try {
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .select('referencia_mes')
        .order('referencia_mes', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Erro ao buscar mês mais recente:', error)
        return '2025-10' // Fallback para outubro de 2025
      }

      this.latestMonth = data?.referencia_mes || '2025-10'
      this.lastUpdate = now
      
      return this.latestMonth
    } catch (error) {
      console.error('Erro na consulta do mês mais recente:', error)
      return '2025-10' // Fallback para outubro de 2025
    }
  }

  // Consultar FIPE com mês mais recente
  static async consultarFipe(
    marca: string,
    veiculo: string,
    ano: number,
    modelo: string
  ): Promise<FipeConsultaResult[]> {
    try {
      // Obter mês mais recente
      const latestMonth = await this.getLatestReferenceMonth()

      // Buscar dados na tabela ocar_transbordo
      const { data, error } = await supabase
        .from('ocar_transbordo')
        .select(`
          marca,
          modelo,
          ano,
          codigo_fipe,
          referencia_mes,
          preco
        `)
        .eq('marca', marca)
        .ilike('modelo', `%${veiculo}%`)
        .eq('ano', ano)
        .ilike('modelo', `%${modelo}%`)
        .eq('referencia_mes', latestMonth) // Sempre buscar o mês mais recente
        .order('ano', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Erro ao consultar FIPE:', error)
        throw new Error('Erro ao consultar FIPE')
      }

      // Formatar resposta
      const resultado: FipeConsultaResult[] = data?.map(item => ({
        marca: item.marca,
        modelo: item.modelo,
        ano: item.ano,
        fipe_code: item.codigo_fipe,
        reference_month: item.referencia_mes,
        price: item.preco,
        status: 'ATUAL'
      })) || []

      return resultado
    } catch (error) {
      console.error('Erro na consulta FIPE:', error)
      throw error
    }
  }

  // Verificar se há dados atualizados
  static async verificarAtualizacao(): Promise<{
    latestMonth: string
    totalRegistros: number
    ultimaAtualizacao: string
  }> {
    try {
      const latestMonth = await this.getLatestReferenceMonth()

      const { data, error } = await supabase
        .from('ocar_transbordo')
        .select('referencia_mes, created_at')
        .eq('referencia_mes', latestMonth)

      if (error) {
        throw new Error('Erro ao verificar atualização')
      }

      const totalRegistros = data?.length || 0
      const ultimaAtualizacao = data?.[0]?.created_at || new Date().toISOString()

      return {
        latestMonth,
        totalRegistros,
        ultimaAtualizacao: new Date(ultimaAtualizacao).toLocaleDateString('pt-BR')
      }
    } catch (error) {
      console.error('Erro ao verificar atualização:', error)
      throw error
    }
  }
}

export default FipeConsultaService
