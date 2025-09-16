// Hook para usar inteligência FIPE
import { useState, useEffect } from 'react'
import { fipeDynamicData, type ProcessedModel, type ProcessedVersion, type ProcessedYear } from '@/lib/fipe-dynamic-data'

export function useFipeProcessedModels(brandCode: string | null) {
  const [models, setModels] = useState<ProcessedModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandCode) {
      setModels([])
      return
    }

    const loadModels = async () => {
      try {
        setLoading(true)
        setError(null)
        const processedModels = await fipeDynamicData.getProcessedModels(brandCode)
        setModels(processedModels)
      } catch (err) {
        setError('Erro ao carregar modelos processados')
        console.error('Erro ao carregar modelos processados:', err)
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [brandCode])

  return { models, loading, error }
}

export function useFipeProcessedVersions(
  brandCode: string | null, 
  modelCode: string | null, 
  selectedModel: string | null
) {
  const [versions, setVersions] = useState<ProcessedVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandCode || !modelCode || !selectedModel) {
      setVersions([])
      return
    }

    const loadVersions = async () => {
      try {
        setLoading(true)
        setError(null)
        const processedVersions = await fipeDynamicData.getProcessedVersions(brandCode, modelCode, selectedModel)
        setVersions(processedVersions)
      } catch (err) {
        setError('Erro ao carregar versões processadas')
        console.error('Erro ao carregar versões processadas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadVersions()
  }, [brandCode, modelCode, selectedModel])

  return { versions, loading, error }
}

export function useFipeVersionsGroupedByFuel(
  brandCode: string | null, 
  modelCode: string | null, 
  selectedModel: string | null
) {
  const [groupedVersions, setGroupedVersions] = useState<{ [fuel: string]: ProcessedVersion[] }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandCode || !modelCode || !selectedModel) {
      setGroupedVersions({})
      return
    }

    const loadGroupedVersions = async () => {
      try {
        setLoading(true)
        setError(null)
        const grouped = await fipeDynamicData.getVersionsGroupedByFuel(brandCode, modelCode, selectedModel)
        setGroupedVersions(grouped)
      } catch (err) {
        setError('Erro ao carregar versões agrupadas')
        console.error('Erro ao carregar versões agrupadas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadGroupedVersions()
  }, [brandCode, modelCode, selectedModel])

  return { groupedVersions, loading, error }
}

export function useFipeUniqueYears(
  brandCode: string | null, 
  modelCode: string | null, 
  selectedModel: string | null
) {
  const [years, setYears] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandCode || !modelCode || !selectedModel) {
      setYears([])
      return
    }

    const loadYears = async () => {
      try {
        setLoading(true)
        setError(null)
        const uniqueYears = await fipeDynamicData.getUniqueYears(brandCode, modelCode, selectedModel)
        setYears(uniqueYears)
      } catch (err) {
        setError('Erro ao carregar anos')
        console.error('Erro ao carregar anos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadYears()
  }, [brandCode, modelCode, selectedModel])

  return { years, loading, error }
}

export function useFipeVersionsByYear(
  brandCode: string | null, 
  modelCode: string | null, 
  selectedModel: string | null,
  targetYear: number | null
) {
  const [versions, setVersions] = useState<ProcessedVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandCode || !modelCode || !selectedModel || !targetYear) {
      setVersions([])
      return
    }

    const loadVersions = async () => {
      try {
        setLoading(true)
        setError(null)
        const versionsByYear = await fipeDynamicData.getVersionsByYear(brandCode, modelCode, selectedModel, targetYear)
        setVersions(versionsByYear)
      } catch (err) {
        setError('Erro ao carregar versões do ano')
        console.error('Erro ao carregar versões do ano:', err)
      } finally {
        setLoading(false)
      }
    }

    loadVersions()
  }, [brandCode, modelCode, selectedModel, targetYear])

  return { versions, loading, error }
}

export function useFipeYearsWithVersions(
  brandCode: string | null, 
  modelCode: string | null, 
  selectedModel: string | null
) {
  const [yearsWithVersions, setYearsWithVersions] = useState<ProcessedYear[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandCode || !modelCode || !selectedModel) {
      setYearsWithVersions([])
      return
    }

    const loadYearsWithVersions = async () => {
      try {
        setLoading(true)
        setError(null)
        const processedYears = await fipeDynamicData.getProcessedYearsWithVersions(brandCode, modelCode, selectedModel)
        setYearsWithVersions(processedYears)
      } catch (err) {
        setError('Erro ao carregar anos com versões')
        console.error('Erro ao carregar anos com versões:', err)
      } finally {
        setLoading(false)
      }
    }

    loadYearsWithVersions()
  }, [brandCode, modelCode, selectedModel])

  return { yearsWithVersions, loading, error }
}
