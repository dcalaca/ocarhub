import { supabase } from './supabase'

export interface VehicleHistoryReport {
  id: string
  placa: string
  status: 'clean' | 'issues' | 'severe'
  score: number
  resumo: string
  acidentes: number
  multas: number
  leiloes: boolean
  roubo_furto: boolean
  proprietarios: number
  recomendacao: string
  valor_fipe: number
  valor_mercado: number
  variacao: number
  created_at: string
  updated_at: string
}

export interface TechnicalSpecs {
  motor: string
  potencia: string
  torque: string
  combustivel: string[]
  cambio: string
  tracao: string
  consumo_cidade: string
  consumo_estrada: string
  aceleracao: string
  velocidade_maxima: string
  comprimento: string
  largura: string
  altura: string
  peso: string
  capacidade_porta_malas: string
  numero_portas: number
  numero_lugares: number
}

export class VehicleHistoryService {
  // Consultar histórico veicular por placa
  static async consultarHistoricoVeicular(placa: string): Promise<VehicleHistoryReport | null> {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicle_history')
        .select('*')
        .eq('placa', placa.toUpperCase())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Placa não encontrada, simular consulta
          return await this.simulateHistoryReport(placa)
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao consultar histórico veicular:', error)
      throw error
    }
  }

  // Simular relatório de histórico (para desenvolvimento)
  private static async simulateHistoryReport(placa: string): Promise<VehicleHistoryReport> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Gerar dados simulados baseados na placa
    const randomScore = Math.floor(Math.random() * 40) + 60
    const status = randomScore >= 80 ? 'clean' : randomScore >= 60 ? 'issues' : 'severe'
    
    const mockData: VehicleHistoryReport = {
      id: `hist_${Date.now()}`,
      placa: placa.toUpperCase(),
      status,
      score: randomScore,
      resumo: this.generateResumo(status, randomScore),
      acidentes: Math.floor(Math.random() * 3),
      multas: Math.floor(Math.random() * 5),
      leiloes: Math.random() > 0.8,
      roubo_furto: Math.random() > 0.9,
      proprietarios: Math.floor(Math.random() * 3) + 1,
      recomendacao: this.generateRecomendacao(status, randomScore),
      valor_fipe: 45000 + Math.floor(Math.random() * 20000),
      valor_mercado: 42000 + Math.floor(Math.random() * 18000),
      variacao: -6.7 + Math.random() * 13.4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Salvar no banco para futuras consultas
    try {
      await supabase
        .from('ocar_vehicle_history')
        .insert(mockData)
    } catch (error) {
      console.warn('Erro ao salvar histórico simulado:', error)
    }

    return mockData
  }

  private static generateResumo(status: string, score: number): string {
    if (status === 'clean') {
      return 'Veículo com histórico limpo, sem registros de acidentes graves ou problemas significativos.'
    } else if (status === 'issues') {
      return 'Veículo com alguns registros menores, mas sem problemas graves que impeçam a compra.'
    } else {
      return 'Veículo com histórico problemático, recomenda-se cautela na compra.'
    }
  }

  private static generateRecomendacao(status: string, score: number): string {
    if (status === 'clean') {
      return 'Veículo aprovado para compra. Histórico limpo e confiável.'
    } else if (status === 'issues') {
      return 'Veículo aprovado com ressalvas. Verificar detalhes específicos antes da compra.'
    } else {
      return 'Não recomendado para compra. Histórico problemático com riscos elevados.'
    }
  }

  // Buscar especificações técnicas do veículo
  static async getTechnicalSpecs(marca: string, modelo: string, ano: number): Promise<TechnicalSpecs | null> {
    try {
      // Simular busca de especificações técnicas
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Dados simulados baseados no veículo
      const mockSpecs: TechnicalSpecs = {
        motor: this.generateMotorSpec(marca, modelo),
        potencia: `${Math.floor(Math.random() * 50) + 80} cv`,
        torque: `${(Math.random() * 5 + 10).toFixed(1)} kgfm`,
        combustivel: ['Gasolina', 'Etanol'],
        cambio: Math.random() > 0.5 ? 'Manual' : 'Automático',
        tracao: 'Dianteira',
        consumo_cidade: `${(Math.random() * 3 + 8).toFixed(1)} km/l`,
        consumo_estrada: `${(Math.random() * 3 + 10).toFixed(1)} km/l`,
        aceleracao: `${(Math.random() * 3 + 10).toFixed(1)}s (0-100 km/h)`,
        velocidade_maxima: `${Math.floor(Math.random() * 30) + 150} km/h`,
        comprimento: `${Math.floor(Math.random() * 500) + 4000} mm`,
        largura: `${Math.floor(Math.random() * 100) + 1600} mm`,
        altura: `${Math.floor(Math.random() * 100) + 1400} mm`,
        peso: `${Math.floor(Math.random() * 200) + 1000} kg`,
        capacidade_porta_malas: `${Math.floor(Math.random() * 100) + 250} litros`,
        numero_portas: Math.random() > 0.5 ? 4 : 2,
        numero_lugares: 5
      }

      return mockSpecs
    } catch (error) {
      console.error('Erro ao buscar especificações técnicas:', error)
      throw error
    }
  }

  private static generateMotorSpec(marca: string, modelo: string): string {
    const motors = [
      '1.0 8V Flex',
      '1.0 Turbo Flex',
      '1.4 8V Flex',
      '1.4 Turbo Flex',
      '1.6 16V Flex',
      '1.8 16V Flex',
      '2.0 16V Flex'
    ]
    return motors[Math.floor(Math.random() * motors.length)]
  }

  // Salvar relatório de histórico
  static async saveHistoryReport(report: Omit<VehicleHistoryReport, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicle_history')
        .insert(report)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao salvar relatório de histórico:', error)
      throw error
    }
  }

  // Atualizar relatório de histórico
  static async updateHistoryReport(id: string, updates: Partial<VehicleHistoryReport>) {
    try {
      const { data, error } = await supabase
        .from('ocar_vehicle_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao atualizar relatório de histórico:', error)
      throw error
    }
  }
}
