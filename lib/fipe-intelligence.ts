// Serviço de inteligência para processar nomes de modelos e versões da FIPE
// Separa o nome do modelo das versões para interface mais limpa

export interface ProcessedModel {
  name: string // Nome limpo do modelo (ex: "Civic")
  code: string // Código original
  fullName: string // Nome completo original
}

export interface ProcessedVersion {
  name: string // Nome da versão sem o modelo (ex: "LX 1.0")
  code: string // Código original
  fullName: string // Nome completo original
  fuelType?: string // Tipo de combustível extraído
  year: number // Ano extraído (obrigatório)
}

export interface ProcessedYear {
  year: number // Ano do veículo
  versions: ProcessedVersion[] // Versões disponíveis para este ano
}

export class FipeIntelligence {
  // Processar modelos para extrair nome limpo
  static processModels(models: Array<{ code: string; name: string }>): ProcessedModel[] {
    const processed = models.map(model => {
      const cleanName = this.extractModelName(model.name)
      return {
        name: cleanName,
        code: model.code,
        fullName: model.name
      }
    })

    // Agrupar modelos similares e manter apenas um representante
    const grouped = new Map<string, ProcessedModel>()
    
    processed.forEach(model => {
      const key = model.name.toLowerCase()
      if (!grouped.has(key)) {
        grouped.set(key, model)
      }
    })

    return Array.from(grouped.values())
  }

  // Processar versões baseado no modelo selecionado
  static processVersions(
    versions: Array<{ code: string; name: string }>, 
    selectedModel: string
  ): ProcessedVersion[] {
    console.log('🔍 processVersions - Input:', { versionsCount: versions.length, selectedModel })
    console.log('🔍 processVersions - Sample versions:', versions.slice(0, 3))
    
    const filteredVersions = versions.filter(version => {
      const isMatch = this.isVersionOfModel(version.name, selectedModel)
      console.log(`🔍 processVersions - Filtering: "${version.name}" starts with "${selectedModel}"? ${isMatch}`)
      return isMatch
    })
    
    console.log('🔍 processVersions - Filtered versions count:', filteredVersions.length)
    
    const processedVersions = filteredVersions.map(version => {
      const cleanVersion = this.extractVersionName(version.name, selectedModel)
      const fuelType = this.extractFuelType(version.name)
      const year = this.extractYear(version.name)
      
      console.log(`🔍 processVersions - Processing: "${version.name}" -> year: ${year}`)
      
      return {
        name: cleanVersion,
        code: version.code,
        fullName: version.name,
        fuelType,
        year
      }
    })
    
    console.log('🔍 processVersions - Final processed versions:', processedVersions)
    return processedVersions
  }

  // Processar todas as versões e agrupar por modelo
  static processAllVersionsByModel(
    versions: Array<{ code: string; name: string }>
  ): { [modelName: string]: ProcessedVersion[] } {
    const grouped: { [modelName: string]: ProcessedVersion[] } = {}
    
    versions.forEach(version => {
      // Extrair o nome do modelo (primeira palavra)
      const modelName = this.extractModelName(version.name)
      
      if (!grouped[modelName]) {
        grouped[modelName] = []
      }
      
      // Processar a versão
      const cleanVersion = this.extractVersionName(version.name, modelName)
      const fuelType = this.extractFuelType(version.name)
      const year = this.extractYear(version.name)
      
      grouped[modelName].push({
        name: cleanVersion,
        code: version.code,
        fullName: version.name,
        fuelType,
        year
      })
    })
    
    return grouped
  }

  // Extrair nome limpo do modelo (apenas o primeiro nome)
  private static extractModelName(fullName: string): string {
    // Extrair apenas a primeira palavra do nome
    const firstWord = fullName.split(' ')[0]
    
    // Se a primeira palavra for muito curta, pegar as duas primeiras
    if (firstWord.length < 3) {
      const words = fullName.split(' ')
      if (words.length > 1) {
        return words.slice(0, 2).join(' ')
      }
    }
    
    return firstWord
  }

  // Verificar se uma versão pertence ao modelo
  private static isVersionOfModel(versionName: string, modelName: string): boolean {
    const lowerModelName = modelName.toLowerCase()
    const lowerVersionName = versionName.toLowerCase()
    
    // Verificar se a versão começa com o nome do modelo
    return lowerVersionName.startsWith(lowerModelName)
  }

  // Extrair nome da versão sem o modelo
  private static extractVersionName(fullName: string, modelName: string): string {
    let versionName = fullName
    
    // Remover o nome do modelo do início da string
    const lowerModelName = modelName.toLowerCase()
    const lowerFullName = fullName.toLowerCase()
    
    if (lowerFullName.startsWith(lowerModelName)) {
      // Remover o nome do modelo do início
      versionName = fullName.substring(modelName.length).trim()
      
      // Remover caracteres especiais do início se houver
      versionName = versionName.replace(/^[.\s\-_\/]+/, '').trim()
    }
    
    // Limpar especificações técnicas desnecessárias
    versionName = versionName
      .replace(/\s+\d+\.\d+\s*L?\s*V?\s*/g, ' ') // Remove "1.0", "2.0L", "16V", etc.
      .replace(/\s+[A-Z]{2,4}\s*/g, ' ') // Remove siglas como "TDI", "TSI", "MPI", etc.
      .replace(/\s+\d+[A-Z]+\s*/g, ' ') // Remove "200TSI", "250TSI", etc.
      .replace(/\s+[A-Z]+[A-Z0-9]*\s*/g, ' ') // Remove outras siglas
      .replace(/\s+\d+\s*CVT\s*/g, ' ') // Remove "CVT"
      .replace(/\s+MANUAL\s*/gi, ' ') // Remove "MANUAL"
      .replace(/\s+AUTOMÁTICO\s*/gi, ' ') // Remove "AUTOMÁTICO"
      .replace(/\s+AUTOMATICO\s*/gi, ' ') // Remove "AUTOMATICO"
      .replace(/\s+FLEX\s*/gi, ' ') // Remove "FLEX"
      .replace(/\s+GASOLINA\s*/gi, ' ') // Remove "GASOLINA"
      .replace(/\s+DIESEL\s*/gi, ' ') // Remove "DIESEL"
      .replace(/\s+ETANOL\s*/gi, ' ') // Remove "ETANOL"
      .replace(/\s+\d+P\s*/g, ' ') // Remove "4P", "2P", etc.
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim()

    // Se ficou vazio, usar o nome original
    if (!versionName || versionName.length < 2) {
      versionName = fullName
    }

    return versionName
  }

  // Extrair tipo de combustível
  private static extractFuelType(name: string): string | undefined {
    const fuelTypes = ['FLEX', 'GASOLINA', 'DIESEL', 'ETANOL', 'HÍBRIDO', 'ELÉTRICO']
    
    for (const fuel of fuelTypes) {
      if (name.toUpperCase().includes(fuel)) {
        return fuel
      }
    }
    
    return undefined
  }

  // Extrair ano
  private static extractYear(name: string): number {
    const yearMatch = name.match(/\b(19|20)\d{2}\b/)
    if (yearMatch) {
      return parseInt(yearMatch[0])
    }
    
    // Se não encontrar ano no nome, tentar extrair do código (ex: "2022-3")
    const codeYearMatch = name.match(/(\d{4})/)
    if (codeYearMatch) {
      return parseInt(codeYearMatch[1])
    }
    
    // Fallback: usar ano atual se não encontrar
    return new Date().getFullYear()
  }

  // Agrupar versões por tipo de combustível
  static groupVersionsByFuel(versions: ProcessedVersion[]): { [fuel: string]: ProcessedVersion[] } {
    const grouped: { [fuel: string]: ProcessedVersion[] } = {}
    
    versions.forEach(version => {
      const fuel = version.fuelType || 'Outros'
      if (!grouped[fuel]) {
        grouped[fuel] = []
      }
      grouped[fuel].push(version)
    })
    
    return grouped
  }

  // Ordenar versões por relevância
  static sortVersionsByRelevance(versions: ProcessedVersion[]): ProcessedVersion[] {
    return versions.sort((a, b) => {
      // Priorizar versões com ano mais recente
      return b.year - a.year
    })
  }

  // Processar anos e agrupar versões por ano
  static processYearsWithVersions(
    years: Array<{ code: string; name: string }>, 
    selectedModel: string
  ): ProcessedYear[] {
    // Processar todas as versões
    const versions = this.processVersions(years, selectedModel)
    
    // Agrupar por ano
    const yearsMap = new Map<number, ProcessedVersion[]>()
    
    versions.forEach(version => {
      if (!yearsMap.has(version.year)) {
        yearsMap.set(version.year, [])
      }
      yearsMap.get(version.year)!.push(version)
    })
    
    // Converter para array e ordenar por ano (mais recente primeiro)
    const processedYears: ProcessedYear[] = Array.from(yearsMap.entries())
      .map(([year, versions]) => ({
        year,
        versions: versions.sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => b.year - a.year)
    
    return processedYears
  }

  // Obter lista única de anos
  static getUniqueYears(years: Array<{ code: string; name: string }>, selectedModel: string): number[] {
    console.log('🔍 getUniqueYears - Input:', { yearsCount: years.length, selectedModel })
    console.log('🔍 getUniqueYears - Sample years:', years.slice(0, 3))
    
    // Se não há anos, retornar array vazio
    if (years.length === 0) {
      console.log('🔍 getUniqueYears - Nenhum ano encontrado, retornando array vazio')
      return []
    }
    
    // Buscar todos os anos que têm carros que começam com o nome do modelo
    const yearsWithModel = years.filter(year => {
      const yearName = year.name.toLowerCase()
      const modelName = selectedModel.toLowerCase()
      const startsWithModel = yearName.startsWith(modelName)
      console.log(`🔍 getUniqueYears - Year "${year.name}" starts with "${selectedModel}"? ${startsWithModel}`)
      return startsWithModel
    })
    
    console.log('🔍 getUniqueYears - Years with model count:', yearsWithModel.length)
    
    // Se não encontrou nenhum ano com o modelo, tentar uma busca mais flexível
    let finalYears = yearsWithModel
    if (yearsWithModel.length === 0) {
      console.log('🔍 getUniqueYears - Nenhum ano encontrado com filtro restritivo, tentando busca flexível')
      
      // Busca flexível: procurar por qualquer parte do nome do modelo
      finalYears = years.filter(year => {
        const yearName = year.name.toLowerCase()
        const modelName = selectedModel.toLowerCase()
        const containsModel = yearName.includes(modelName)
        console.log(`🔍 getUniqueYears - Year "${year.name}" contains "${selectedModel}"? ${containsModel}`)
        return containsModel
      })
      
      console.log('🔍 getUniqueYears - Years with flexible search count:', finalYears.length)
    }
    
    // Se ainda não encontrou nada, usar todos os anos disponíveis
    if (finalYears.length === 0) {
      console.log('🔍 getUniqueYears - Nenhum ano encontrado com busca flexível, usando todos os anos disponíveis')
      finalYears = years
    }
    
    // Extrair anos únicos
    const uniqueYears = new Set<number>()
    finalYears.forEach(year => {
      const extractedYear = this.extractYear(year.name)
      uniqueYears.add(extractedYear)
      console.log(`🔍 getUniqueYears - Extracted year from "${year.name}": ${extractedYear}`)
    })
    
    const result = Array.from(uniqueYears).sort((a, b) => b - a) // Ordenar do mais recente para o mais antigo
    console.log('🔍 getUniqueYears - Final unique years result:', result)
    
    return result
  }

  // Obter versões de um ano específico
  static getVersionsByYear(
    years: Array<{ code: string; name: string }>, 
    selectedModel: string, 
    targetYear: number
  ): ProcessedVersion[] {
    console.log('🔍 getVersionsByYear - Input:', { yearsCount: years.length, selectedModel, targetYear })
    
    // Buscar todas as versões que começam com o nome do modelo e têm o ano específico
    const versionsForYear = years.filter(year => {
      const yearName = year.name.toLowerCase()
      const modelName = selectedModel.toLowerCase()
      const startsWithModel = yearName.startsWith(modelName)
      const extractedYear = this.extractYear(year.name)
      const isTargetYear = extractedYear === targetYear
      
      console.log(`🔍 getVersionsByYear - Year "${year.name}": starts with "${selectedModel}"? ${startsWithModel}, year: ${extractedYear}, is target? ${isTargetYear}`)
      
      return startsWithModel && isTargetYear
    })
    
    console.log('🔍 getVersionsByYear - Versions for year count:', versionsForYear.length)
    
    // Processar as versões encontradas
    const processedVersions = versionsForYear.map(year => {
      const cleanVersion = this.extractVersionName(year.name, selectedModel)
      const fuelType = this.extractFuelType(year.name)
      const yearValue = this.extractYear(year.name)
      
      console.log(`🔍 getVersionsByYear - Processing: "${year.name}" -> version: "${cleanVersion}"`)
      
      return {
        name: cleanVersion,
        code: year.code,
        fullName: year.name,
        fuelType,
        year: yearValue
      }
    })
    
    console.log('🔍 getVersionsByYear - Final processed versions:', processedVersions)
    return processedVersions
  }
}
