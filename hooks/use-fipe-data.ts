// Hook para carregar dados dinâmicos da FIPE
import { useState, useEffect } from 'react'
import { fipeDynamicData, type FipeBrand, type FipeModel, type FipeYear } from '@/lib/fipe-dynamic-data'

export function useFipeBrands() {
  const [brands, setBrands] = useState<FipeBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true)
        setError(null)
        const brandsData = await fipeDynamicData.getBrands()
        setBrands(brandsData)
      } catch (err) {
        setError('Erro ao carregar marcas')
        console.error('Erro ao carregar marcas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBrands()
  }, [])

  return { brands, loading, error }
}

export function useFipeModels(brandName: string | null) {
  const [models, setModels] = useState<FipeModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandCode, setBrandCode] = useState<string | null>(null)

  // Cache de marcas para evitar consultas repetidas
  useEffect(() => {
    if (!brandName) {
      setModels([])
      setBrandCode(null)
      return
    }

    const loadBrandCode = async () => {
      try {
        const brands = await fipeDynamicData.getBrands()
        const selectedBrand = brands.find(brand => brand.name === brandName)
        setBrandCode(selectedBrand?.code || null)
      } catch (err) {
        console.error('Erro ao carregar código da marca:', err)
        setBrandCode(null)
      }
    }

    loadBrandCode()
  }, [brandName])

  // Carregar modelos quando tiver o código da marca
  useEffect(() => {
    if (!brandCode) {
      setModels([])
      return
    }

    const loadModels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const modelsData = await fipeDynamicData.getModelsByBrand(brandCode)
        setModels(modelsData)
      } catch (err) {
        setError('Erro ao carregar modelos')
        console.error('Erro ao carregar modelos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [brandCode])

  return { models, loading, error }
}

export function useFipeYears(brandName: string | null, modelName: string | null) {
  const [years, setYears] = useState<FipeYear[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandCode, setBrandCode] = useState<string | null>(null)
  const [modelCode, setModelCode] = useState<string | null>(null)

  // Carregar código da marca
  useEffect(() => {
    if (!brandName) {
      setBrandCode(null)
      return
    }

    const loadBrandCode = async () => {
      try {
        const brands = await fipeDynamicData.getBrands()
        const selectedBrand = brands.find(brand => brand.name === brandName)
        setBrandCode(selectedBrand?.code || null)
      } catch (err) {
        console.error('Erro ao carregar código da marca:', err)
        setBrandCode(null)
      }
    }

    loadBrandCode()
  }, [brandName])

  // Carregar código do modelo
  useEffect(() => {
    if (!brandCode || !modelName) {
      setModelCode(null)
      return
    }

    const loadModelCode = async () => {
      try {
        const models = await fipeDynamicData.getModelsByBrand(brandCode)
        const selectedModel = models.find(model => model.name === modelName)
        setModelCode(selectedModel?.code || null)
      } catch (err) {
        console.error('Erro ao carregar código do modelo:', err)
        setModelCode(null)
      }
    }

    loadModelCode()
  }, [brandCode, modelName])

  // Carregar anos quando tiver ambos os códigos
  useEffect(() => {
    if (!brandCode || !modelCode) {
      setYears([])
      return
    }

    const loadYears = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const yearsData = await fipeDynamicData.getYearsByModel(brandCode, modelCode)
        setYears(yearsData)
      } catch (err) {
        setError('Erro ao carregar anos')
        console.error('Erro ao carregar anos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadYears()
  }, [brandCode, modelCode])

  return { years, loading, error }
}
