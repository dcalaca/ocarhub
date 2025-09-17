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
    const startsWithModel = lowerVersionName.startsWith(lowerModelName)
    
    // Para anos, ser mais flexível - aceitar se contém o modelo em qualquer lugar
    // Isso garante que versões como "Civic 2022" sejam incluídas
    const containsModel = lowerVersionName.includes(lowerModelName)
    
    return startsWithModel || containsModel
  }

  // Extrair nome da versão sem o modelo
  private static extractVersionName(fullName: string, modelName: string): string {
    let versionName = fullName
    
    console.log(`🔍 extractVersionName - Processing: "${fullName}" with model: "${modelName}"`)
    
    // Remover o nome do modelo do início da string
    const lowerModelName = modelName.toLowerCase()
    const lowerFullName = fullName.toLowerCase()
    
    if (lowerFullName.startsWith(lowerModelName)) {
      // Remover o nome do modelo do início
      versionName = fullName.substring(modelName.length).trim()
      
      // Remover caracteres especiais do início se houver
      versionName = versionName.replace(/^[.\s\-_\/]+/, '').trim()
      console.log(`🔍 extractVersionName - After removing model: "${versionName}"`)
    } else if (lowerFullName.includes(lowerModelName)) {
      // Se o modelo está no meio, remover apenas a primeira ocorrência
      const modelIndex = lowerFullName.indexOf(lowerModelName)
      versionName = fullName.substring(0, modelIndex) + fullName.substring(modelIndex + modelName.length)
      versionName = versionName.trim()
      console.log(`🔍 extractVersionName - After removing model from middle: "${versionName}"`)
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
      console.log(`🔍 extractVersionName - Using original name: "${versionName}"`)
    } else {
      console.log(`🔍 extractVersionName - Final version name: "${versionName}"`)
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
    if (!name || typeof name !== 'string') {
      console.warn('🔍 extractYear - Invalid name provided:', name)
      return new Date().getFullYear()
    }
    
    console.log(`🔍 extractYear - Processing name: "${name}"`)
    
    // Tentar extrair ano de 4 dígitos (1900-2099)
    const yearMatch = name.match(/\b(19|20)\d{2}\b/)
    if (yearMatch) {
      const year = parseInt(yearMatch[0])
      console.log(`🔍 extractYear - Found year in name: ${year}`)
      return year
    }
    
    // Tentar extrair qualquer sequência de 4 dígitos
    const anyYearMatch = name.match(/(\d{4})/)
    if (anyYearMatch) {
      const year = parseInt(anyYearMatch[1])
      // Validar se está em um range razoável
      if (year >= 1990 && year <= 2030) {
        console.log(`🔍 extractYear - Found valid year in name: ${year}`)
        return year
      }
    }
    
    // Tentar extrair ano de 2 dígitos (assumindo 20xx)
    const twoDigitMatch = name.match(/\b(\d{2})\b/)
    if (twoDigitMatch) {
      const year = parseInt(twoDigitMatch[1])
      // Se for menor que 30, assumir 20xx, senão 19xx
      const fullYear = year < 30 ? 2000 + year : 1900 + year
      if (fullYear >= 1990 && fullYear <= 2030) {
        console.log(`🔍 extractYear - Found 2-digit year in name: ${fullYear}`)
        return fullYear
      }
    }
    
    // Tentar extrair do código (ex: "2022-3", "2022/3")
    const codeYearMatch = name.match(/(\d{4})[-/]/)
    if (codeYearMatch) {
      const year = parseInt(codeYearMatch[1])
      if (year >= 1990 && year <= 2030) {
        console.log(`🔍 extractYear - Found year in code: ${year}`)
        return year
      }
    }
    
    console.warn(`🔍 extractYear - No valid year found in: "${name}"`)
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
    if (!years || years.length === 0) {
      console.log('🔍 getUniqueYears - Nenhum ano encontrado, retornando array vazio')
      return []
    }
    
    // Para anos, ser mais inclusivo - incluir todos os anos que contenham o modelo
    console.log('🔍 getUniqueYears - Processando todos os anos disponíveis')
    const finalYears = years.filter(year => {
      if (!year || !year.name) return false
      
      // Incluir se o nome contém o modelo ou se é um ano válido
      const containsModel = year.name.toLowerCase().includes(selectedModel.toLowerCase())
      const hasValidYear = this.extractYear(year.name) >= 1990 && this.extractYear(year.name) <= 2030
      
      return containsModel || hasValidYear
    })
    
    console.log('🔍 getUniqueYears - Anos filtrados:', finalYears.length)
    
    // Extrair anos únicos
    const uniqueYears = new Set<number>()
    finalYears.forEach((year, index) => {
      // Validação mais robusta do objeto de ano
      if (!year) {
        console.warn(`🔍 getUniqueYears - Skipping null/undefined year at index ${index}:`, year)
        return
      }
      
      if (typeof year !== 'object') {
        console.warn(`🔍 getUniqueYears - Skipping non-object year at index ${index}:`, year)
        return
      }
      
      if (!year.name || typeof year.name !== 'string') {
        console.warn(`🔍 getUniqueYears - Skipping year with invalid name at index ${index}:`, year)
        return
      }
      
      const extractedYear = this.extractYear(year.name)
      
      // Verificar se o ano extraído é válido
      if (isNaN(extractedYear) || extractedYear < 1990 || extractedYear > 2030) {
        console.log(`🔍 getUniqueYears - Filtered out invalid year from "${year.name}": ${extractedYear}`)
        return
      }
      
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
    console.log('🔍 getVersionsByYear - Sample years:', years.slice(0, 5))
    
    // Buscar todas as versões que contêm o nome do modelo e têm o ano específico
    const versionsForYear = years.filter(year => {
      if (!year || !year.name) return false
      const yearName = year.name.toLowerCase()
      const modelName = selectedModel.toLowerCase()
      const containsModel = yearName.includes(modelName)
      const extractedYear = this.extractYear(year.name)
      const isTargetYear = extractedYear === targetYear
      
      console.log(`🔍 getVersionsByYear - Year "${year.name}": contains "${selectedModel}"? ${containsModel}, year: ${extractedYear}, is target? ${isTargetYear}`)
      
      return containsModel && isTargetYear
    })
    
    console.log('🔍 getVersionsByYear - Versions for year count:', versionsForYear.length)
    console.log('🔍 getVersionsByYear - Versions found:', versionsForYear.map(v => v.name))
    
    // Se não encontrou versões com filtro de modelo, tentar sem filtro de modelo
    if (versionsForYear.length === 0) {
      console.log('🔍 getVersionsByYear - No versions found with model filter, trying without model filter')
      const versionsWithoutModelFilter = years.filter(year => {
        if (!year || !year.name) return false
        const extractedYear = this.extractYear(year.name)
        const isTargetYear = extractedYear === targetYear
        
        console.log(`🔍 getVersionsByYear (no model filter) - Year "${year.name}": year: ${extractedYear}, is target? ${isTargetYear}`)
        
        return isTargetYear
      })
      
      console.log('🔍 getVersionsByYear - Versions without model filter count:', versionsWithoutModelFilter.length)
      console.log('🔍 getVersionsByYear - Versions without model filter:', versionsWithoutModelFilter.map(v => v.name))
      
      // Usar as versões sem filtro de modelo se encontrou alguma
      if (versionsWithoutModelFilter.length > 0) {
        const processedVersions = versionsWithoutModelFilter.map(year => {
          const cleanVersion = this.extractVersionName(year.name, selectedModel)
          const fuelType = this.extractFuelType(year.name)
          const yearValue = this.extractYear(year.name)
          
          console.log(`🔍 getVersionsByYear - Processing (no model filter): "${year.name}" -> version: "${cleanVersion}"`)
          
          return {
            name: cleanVersion,
            code: year.code,
            fullName: year.name,
            fuelType,
            year: yearValue
          }
        })
        
        console.log('🔍 getVersionsByYear - Final processed versions (no model filter):', processedVersions)
        return processedVersions
      }
    }
    
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
