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

  useEffect(() => {
    if (!brandName) {
      setModels([])
      return
    }

    const loadModels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Primeiro, obter as marcas para encontrar o código
        const brands = await fipeDynamicData.getBrands()
        const selectedBrand = brands.find(brand => brand.name === brandName)
        
        if (selectedBrand) {
          const modelsData = await fipeDynamicData.getModelsByBrand(selectedBrand.code)
          setModels(modelsData)
        } else {
          setModels([])
        }
      } catch (err) {
        setError('Erro ao carregar modelos')
        console.error('Erro ao carregar modelos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [brandName])

  return { models, loading, error }
}

export function useFipeYears(brandName: string | null, modelName: string | null) {
  const [years, setYears] = useState<FipeYear[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandName || !modelName) {
      setYears([])
      return
    }

    const loadYears = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Primeiro, obter as marcas para encontrar o código da marca
        const brands = await fipeDynamicData.getBrands()
        const selectedBrand = brands.find(brand => brand.name === brandName)
        
        if (selectedBrand) {
          // Depois, obter os modelos para encontrar o código do modelo
          const models = await fipeDynamicData.getModelsByBrand(selectedBrand.code)
          const selectedModel = models.find(model => model.name === modelName)
          
          if (selectedModel) {
            const yearsData = await fipeDynamicData.getYearsByModel(selectedBrand.code, selectedModel.code)
            setYears(yearsData)
          } else {
            setYears([])
          }
        } else {
          setYears([])
        }
      } catch (err) {
        setError('Erro ao carregar anos')
        console.error('Erro ao carregar anos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadYears()
  }, [brandName, modelName])

  return { years, loading, error }
}
