// Serviço para integração com a API da FIPE
// https://fipe.parallelum.com.br/api/v2

interface FipeReference {
  code: string
  month: string
}

interface FipeBrand {
  code: string
  name: string
}

interface FipeModel {
  code: string
  name: string
}

interface FipeYear {
  code: string
  name: string
}

interface FipeVehicleInfo {
  brand: string
  codeFipe: string
  fuel: string
  fuelAcronym: string
  model: string
  modelYear: number
  price: string
  priceHistory: Array<{
    referenceMonth: string
    vehicleType: number
  }>
}

export class FipeService {
  private readonly baseUrl = 'https://fipe.parallelum.com.br/api/v2'
  private readonly apiToken = process.env.FIPE_API_TOKEN

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Adicionar token se disponível
    if (this.apiToken) {
      headers['X-Subscription-Token'] = this.apiToken
    }

    try {
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`Erro na API FIPE: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao consultar API FIPE:', error)
      throw new Error('Erro ao consultar tabela FIPE. Tente novamente.')
    }
  }

  // Obter referências de meses disponíveis
  async getReferences(): Promise<FipeReference[]> {
    return this.makeRequest<FipeReference[]>('/references')
  }

  // Obter marcas por tipo de veículo
  async getBrands(vehicleType: 'cars' | 'motorcycles' | 'trucks' = 'cars', reference?: number): Promise<FipeBrand[]> {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest<FipeBrand[]>(`/${vehicleType}/brands${params}`)
  }

  // Obter modelos por marca
  async getModelsByBrand(
    vehicleType: 'cars' | 'motorcycles' | 'trucks' = 'cars',
    brandId: string,
    reference?: number
  ): Promise<FipeModel[]> {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest<FipeModel[]>(`/${vehicleType}/brands/${brandId}/models${params}`)
  }

  // Obter anos por modelo
  async getYearsByModel(
    vehicleType: 'cars' | 'motorcycles' | 'trucks' = 'cars',
    brandId: string,
    modelId: string,
    reference?: number
  ): Promise<FipeYear[]> {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest<FipeYear[]>(`/${vehicleType}/brands/${brandId}/models/${modelId}/years${params}`)
  }

  // Obter informações da FIPE (preço)
  async getVehicleInfo(
    vehicleType: 'cars' | 'motorcycles' | 'trucks' = 'cars',
    brandId: string,
    modelId: string,
    yearId: string,
    reference?: number
  ): Promise<FipeVehicleInfo> {
    const params = reference ? `?reference=${reference}` : ''
    return this.makeRequest<FipeVehicleInfo>(`/${vehicleType}/brands/${brandId}/models/${modelId}/years/${yearId}${params}`)
  }

  // Buscar veículo por marca, modelo e ano (método principal)
  async searchVehicle(
    brandName: string,
    modelName: string,
    year: number,
    vehicleType: 'cars' | 'motorcycles' | 'trucks' = 'cars'
  ): Promise<{ price: number; fipeCode: string; fuel: string; modelYear: number } | null> {
    try {
      // 1. Obter marcas
      const brands = await this.getBrands(vehicleType)
      const brand = brands.find(b => 
        b.name.toLowerCase().includes(brandName.toLowerCase()) ||
        brandName.toLowerCase().includes(b.name.toLowerCase())
      )

      if (!brand) {
        console.error('Marca não encontrada:', brandName)
        return null
      }

      // 2. Obter modelos da marca
      const models = await this.getModelsByBrand(vehicleType, brand.code)
      const model = models.find(m => 
        m.name.toLowerCase().includes(modelName.toLowerCase()) ||
        modelName.toLowerCase().includes(m.name.toLowerCase())
      )

      if (!model) {
        console.error('Modelo não encontrado:', modelName)
        return null
      }

      // 3. Obter anos do modelo
      const years = await this.getYearsByModel(vehicleType, brand.code, model.code)
      const yearMatch = years.find(y => {
        const yearFromCode = parseInt(y.code.split('-')[0])
        return yearFromCode === year
      })

      if (!yearMatch) {
        console.error('Ano não encontrado:', year)
        return null
      }

      // 4. Obter informações da FIPE
      const vehicleInfo = await this.getVehicleInfo(vehicleType, brand.code, model.code, yearMatch.code)

      // 5. Converter preço para número
      const priceString = vehicleInfo.price.replace('R$ ', '').replace('.', '').replace(',', '.')
      const price = parseFloat(priceString)

      return {
        price,
        fipeCode: vehicleInfo.codeFipe,
        fuel: vehicleInfo.fuel,
        modelYear: vehicleInfo.modelYear
      }
    } catch (error) {
      console.error('Erro ao buscar veículo na FIPE:', error)
      return null
    }
  }

  // Método simplificado para busca rápida
  async quickSearch(brandName: string, modelName: string, year: number): Promise<{ price: number; fipeCode: string } | null> {
    const result = await this.searchVehicle(brandName, modelName, year)
    
    if (!result) return null

    return {
      price: result.price,
      fipeCode: result.fipeCode
    }
  }

  // Obter anos por código FIPE
  async getYearsByFipeCode(vehicleType: string, fipeCode: string): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await this.makeRequest(`/${vehicleType}/${fipeCode}/years`)
      return response
    } catch (error) {
      console.error('Erro ao buscar anos por código FIPE:', error)
      throw error
    }
  }

  // Obter detalhes do veículo por código FIPE
  async getVehicleDetailsByFipeCode(vehicleType: string, fipeCode: string, yearId: string): Promise<{
    brand: string
    codeFipe: string
    fuel: string
    fuelAcronym: string
    model: string
    modelYear: number
    price: string
    priceHistory: Array<{
      referenceMonth: string
      vehicleType: number
    }>
  }> {
    try {
      const response = await this.makeRequest(`/${vehicleType}/${fipeCode}/years/${yearId}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar detalhes por código FIPE:', error)
      throw error
    }
  }

  // Obter histórico do veículo por código FIPE
  async getVehicleHistoryByFipeCode(vehicleType: string, fipeCode: string, yearId: string): Promise<{
    brand: string
    codeFipe: string
    fuel: string
    fuelAcronym: string
    model: string
    modelYear: number
    price: string
    priceHistory: Array<{
      referenceMonth: string
      vehicleType: number
    }>
  }> {
    try {
      const response = await this.makeRequest(`/${vehicleType}/${fipeCode}/years/${yearId}/history`)
      return response
    } catch (error) {
      console.error('Erro ao buscar histórico por código FIPE:', error)
      throw error
    }
  }
}

// Instância singleton
export const fipeService = new FipeService()
