"use client"

import { useEffect } from "react"

import { useState } from "react"

// Simulação de API com cache inteligente
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class VehicleCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 1000 * 60 * 30 // 30 minutos

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Cache global
const vehicleCache = new VehicleCache()

// Simulação de delay de rede
const simulateNetworkDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// API simulada que será substituída pela FIPE futuramente
export class VehicleAPI {
  // Carrega apenas as marcas (rápido)
  static async getBrands(): Promise<string[]> {
    const cacheKey = "brands"
    const cached = vehicleCache.get<string[]>(cacheKey)

    if (cached) {
      console.log("📦 Marcas carregadas do cache")
      return cached
    }

    console.log("🌐 Carregando marcas da API...")
    await simulateNetworkDelay(200)

    // Importa apenas quando necessário
    const { getAllBrands } = await import("./data/vehicles-database")
    const brands = getAllBrands()

    vehicleCache.set(cacheKey, brands, 1000 * 60 * 60) // Cache por 1 hora
    return brands
  }

  // Carrega modelos apenas da marca selecionada
  static async getModelsByBrand(brand: string): Promise<string[]> {
    const cacheKey = `models-${brand}`
    const cached = vehicleCache.get<string[]>(cacheKey)

    if (cached) {
      console.log(`📦 Modelos da ${brand} carregados do cache`)
      return cached
    }

    console.log(`🌐 Carregando modelos da ${brand}...`)
    await simulateNetworkDelay(300)

    const { getModelsByBrand } = await import("./data/vehicles-database")
    const models = getModelsByBrand(brand)

    vehicleCache.set(cacheKey, models, 1000 * 60 * 30) // Cache por 30 min
    return models
  }

  // Carrega versões apenas do modelo selecionado
  static async getVersionsByModel(brand: string, model: string): Promise<string[]> {
    const cacheKey = `versions-${brand}-${model}`
    const cached = vehicleCache.get<string[]>(cacheKey)

    if (cached) {
      console.log(`📦 Versões do ${brand} ${model} carregadas do cache`)
      return cached
    }

    console.log(`🌐 Carregando versões do ${brand} ${model}...`)
    await simulateNetworkDelay(400)

    const { getVersionsByModel } = await import("./data/vehicles-database")
    const versions = getVersionsByModel(brand, model)

    vehicleCache.set(cacheKey, versions, 1000 * 60 * 15) // Cache por 15 min
    return versions
  }

  // Carrega anos apenas da versão selecionada
  static async getYearsByVersion(brand: string, model: string, version: string): Promise<number[]> {
    const cacheKey = `years-${brand}-${model}-${version}`
    const cached = vehicleCache.get<number[]>(cacheKey)

    if (cached) {
      console.log(`📦 Anos do ${brand} ${model} ${version} carregados do cache`)
      return cached
    }

    console.log(`🌐 Carregando anos do ${brand} ${model} ${version}...`)
    await simulateNetworkDelay(200)

    const { getYearsByVersion } = await import("./data/vehicles-database")
    const years = getYearsByVersion(brand, model, version)

    vehicleCache.set(cacheKey, years, 1000 * 60 * 60) // Cache por 1 hora
    return years
  }

  // Busca detalhes do veículo
  static async getVehicleDetails(brand: string, model: string, version: string) {
    const cacheKey = `details-${brand}-${model}-${version}`
    const cached = vehicleCache.get(cacheKey)

    if (cached) {
      console.log(`📦 Detalhes do ${brand} ${model} ${version} carregados do cache`)
      return cached
    }

    console.log(`🌐 Carregando detalhes do ${brand} ${model} ${version}...`)
    await simulateNetworkDelay(150)

    const { getVehicleDetails } = await import("./data/vehicles-database")
    const details = getVehicleDetails(brand, model, version)

    vehicleCache.set(cacheKey, details, 1000 * 60 * 60) // Cache por 1 hora
    return details
  }

  // Busca inteligente com filtros
  static async searchVehicles(query: string, limit = 10): Promise<any[]> {
    const cacheKey = `search-${query}-${limit}`
    const cached = vehicleCache.get(cacheKey)

    if (cached) {
      console.log(`📦 Busca "${query}" carregada do cache`)
      return cached
    }

    console.log(`🔍 Buscando "${query}"...`)
    await simulateNetworkDelay(500)

    // Busca inteligente nos dados
    const { vehiclesDatabase } = await import("./data/vehicles-database")
    const results: any[] = []

    const searchTerm = query.toLowerCase()

    vehiclesDatabase.forEach((brand) => {
      if (brand.nome.toLowerCase().includes(searchTerm)) {
        brand.modelos.forEach((model) => {
          results.push({
            brand: brand.nome,
            model: model.nome,
            category: model.categoria,
            type: "brand-match",
          })
        })
      } else {
        brand.modelos.forEach((model) => {
          if (model.nome.toLowerCase().includes(searchTerm)) {
            results.push({
              brand: brand.nome,
              model: model.nome,
              category: model.categoria,
              type: "model-match",
            })
          }
        })
      }
    })

    const limitedResults = results.slice(0, limit)
    vehicleCache.set(cacheKey, limitedResults, 1000 * 60 * 5) // Cache por 5 min
    return limitedResults
  }

  // Limpa cache (útil para desenvolvimento)
  static clearCache(): void {
    vehicleCache.clear()
    console.log("🗑️ Cache limpo")
  }

  // Estatísticas do cache
  static getCacheStats() {
    return vehicleCache.getStats()
  }
}

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
