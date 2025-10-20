"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { VehicleSelector } from "@/components/vehicle-selector"
import { PhotoUpload } from "@/components/photo-upload"
import { CacheDebug } from "@/components/cache-debug"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useMercadoPago } from "@/hooks/use-mercadopago"
import {
  Car,
  Star,
  Zap,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Camera,
  Gauge,
  Settings,
  FileText,
  MapPin,
  Save,
} from "lucide-react"
import Link from "next/link"
import {
  getAllBrands,
  getModelsByBrand,
  getYearsByModel,
  getVersionsByModel,
  getTransmissionsByModel,
} from "@/lib/data/car-brands"
import { useFipeBrands, useFipeModels, useFipeYears } from "@/hooks/use-fipe-data"
import { useFipeProcessedModels, useFipeProcessedVersions, useFipeUniqueYears, useFipeVersionsByYear } from "@/hooks/use-fipe-intelligence"
import { FipeVehicleSelector } from "@/components/fipe-vehicle-selector"
import { OpcionaisSelector } from "@/components/opcionais-selector"
import { cores, combustiveis } from "@/lib/data/filters"
import { VehicleService } from "@/lib/vehicle-service"
import { PlansService, type Plan } from "@/lib/plans-service"
import { ImageUploadService } from "@/lib/image-upload-service"

export default function AnunciarPage() {
  const { user, debitSaldo, refreshSaldo } = useAuth()
  const { toast } = useToast()
  const { loading: loadingMercadoPago, processPayment } = useMercadoPago()
  const searchParams = useSearchParams()
  
  // Estados de modo de edição
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [loadingVehicleData, setLoadingVehicleData] = useState(false)
  const [currentTab, setCurrentTab] = useState("info")
  const [planoSelecionado, setPlanoSelecionado] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [formCompleted, setFormCompleted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [savingStep, setSavingStep] = useState('')
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{
    limite: number
    anunciosRestantes: number
    planoNome: string
  } | null>(null)
  const [isSavingTemp, setIsSavingTemp] = useState(false)

  // Dados do veículo
  const [brandId, setBrandId] = useState("")
  const [modelId, setModelId] = useState("")
  const [year, setYear] = useState("")
  const [price, setPrice] = useState("")
  const [fipeData, setFipeData] = useState<{ price: number; fipeCode: string } | null>(null)
  const [mileage, setMileage] = useState("")
  const [color, setColor] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [transmission, setTransmission] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [owners, setOwners] = useState("1")
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [location, setLocation] = useState("")

  // Opções dinâmicas
  const [brands, setBrands] = useState<{ value: string; label: string; image: string }[]>([])
  const [models, setModels] = useState<{ value: string; label: string }[]>([])
  const [years, setYears] = useState<{ value: string; label: string }[]>([])
  const [versions, setVersions] = useState<{ value: string; label: string }[]>([])
  const [fuelTypes, setFuelTypes] = useState<{ value: string; label: string }[]>([])
  const [transmissions, setTransmissions] = useState<{ value: string; label: string }[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [useDynamicFilters, setUseDynamicFilters] = useState(true)

  // Estados para opcionais
  const [selectedOpcionais, setSelectedOpcionais] = useState<string[]>([])
  const [selectedCarroceria, setSelectedCarroceria] = useState("")
  const [selectedTipoVendedor, setSelectedTipoVendedor] = useState("")
  const [selectedCaracteristicas, setSelectedCaracteristicas] = useState<string[]>([])
  const [selectedBlindagem, setSelectedBlindagem] = useState("")
  const [selectedLeilao, setSelectedLeilao] = useState("")

  // Chave para localStorage
  const STORAGE_KEY = 'anuncio-temp-data'

  // Função para salvar dados temporariamente
  const saveTempData = () => {
    setIsSavingTemp(true)
    
    const tempData = {
      brandId,
      modelId,
      year,
      selectedVersion,
      price,
      mileage,
      color,
      fuelType,
      transmission,
      licensePlate,
      owners,
      description,
      location,
      selectedOpcionais,
      selectedCarroceria,
      selectedTipoVendedor,
      selectedCaracteristicas,
      selectedBlindagem,
      selectedLeilao,
      planoSelecionado,
      useDynamicFilters,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempData))
      console.log('💾 Dados salvos temporariamente')
    } catch (error) {
      console.error('❌ Erro ao salvar dados temporários:', error)
    } finally {
      // Remover indicador após um breve delay
      setTimeout(() => setIsSavingTemp(false), 500)
    }
  }

  // Função para carregar dados temporários
  const loadTempData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const tempData = JSON.parse(savedData)
        
        // Verificar se os dados não são muito antigos (24 horas)
        const isExpired = Date.now() - tempData.timestamp > 24 * 60 * 60 * 1000
        if (isExpired) {
          localStorage.removeItem(STORAGE_KEY)
          console.log('🗑️ Dados temporários expirados, removidos')
          return
        }
        
        // Carregar dados salvos
        setBrandId(tempData.brandId || "")
        setModelId(tempData.modelId || "")
        setYear(tempData.year || "")
        setSelectedVersion(tempData.selectedVersion || "")
        setPrice(tempData.price || "")
        setMileage(tempData.mileage || "")
        setColor(tempData.color || "")
        setFuelType(tempData.fuelType || "")
        setTransmission(tempData.transmission || "")
        setLicensePlate(tempData.licensePlate || "")
        setOwners(tempData.owners || "1")
        setDescription(tempData.description || "")
        setLocation(tempData.location || "")
        setSelectedOpcionais(tempData.selectedOpcionais || [])
        setSelectedCarroceria(tempData.selectedCarroceria || "")
        setSelectedTipoVendedor(tempData.selectedTipoVendedor || "")
        setSelectedCaracteristicas(tempData.selectedCaracteristicas || [])
        setSelectedBlindagem(tempData.selectedBlindagem || "")
        setSelectedLeilao(tempData.selectedLeilao || "")
        setPlanoSelecionado(tempData.planoSelecionado || "")
        setUseDynamicFilters(tempData.useDynamicFilters !== undefined ? tempData.useDynamicFilters : true)
        
        console.log('📂 Dados temporários carregados')
        
        toast({
          title: "Dados recuperados",
          description: "Seus dados foram recuperados automaticamente.",
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados temporários:', error)
    }
  }

  // Função para limpar dados temporários
  const clearTempData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('🗑️ Dados temporários limpos')
    } catch (error) {
      console.error('❌ Erro ao limpar dados temporários:', error)
    }
  }

  // Função para lidar com seleção dos filtros dinâmicos
  const handleDynamicSelection = (selection: {
    marca?: string
    veiculo?: string
    ano?: number
    modelo?: string
  }) => {
    if (selection.marca) setBrandId(selection.marca)
    if (selection.veiculo) setSelectedVersion(selection.veiculo)
    if (selection.ano) setYear(selection.ano.toString())
    if (selection.modelo) setModelId(selection.modelo)
  }

  // Estados para armazenar códigos da FIPE
  const [selectedBrandCode, setSelectedBrandCode] = useState("")
  const [selectedModelCode, setSelectedModelCode] = useState("")
  const [selectedVersion, setSelectedVersion] = useState("")

  // Dados dinâmicos da FIPE
  const { brands: fipeBrands, loading: brandsLoading, error: brandsError } = useFipeBrands()
  const { models: fipeModels, loading: modelsLoading, error: modelsError } = useFipeModels(brandId)
  const { years: fipeYears, loading: yearsLoading, error: yearsError } = useFipeYears(brandId, modelId)

  // Dados processados com inteligência
  const { models: processedModels, loading: processedModelsLoading } = useFipeProcessedModels(selectedBrandCode)
  const { years: uniqueYears, loading: uniqueYearsLoading } = useFipeUniqueYears(selectedBrandCode, selectedModelCode, modelId)
  const { versions: versionsByYear, loading: versionsLoading } = useFipeVersionsByYear(selectedBrandCode, selectedModelCode, modelId, year ? parseInt(year) : null)

  // Detectar modo de edição e carregar dados do veículo
  useEffect(() => {
    const editId = searchParams.get('edit')
    console.log('🔍 Verificando parâmetros de edição:', { editId, searchParams: searchParams.toString() })
    
    if (editId) {
      console.log('✅ Modo de edição detectado, ID:', editId)
      setIsEditMode(true)
      setEditingVehicleId(editId)
      loadVehicleData(editId)
    } else {
      console.log('ℹ️ Modo de criação detectado')
      // Carregar dados temporários apenas se não estiver editando
      loadTempData()
    }
  }, [searchParams])

  // Salvar dados automaticamente quando mudarem
  useEffect(() => {
    // Não salvar se estiver em modo de edição ou se não há dados suficientes
    if (isEditMode || !brandId) return
    
    // Debounce para evitar muitas operações de salvamento
    const timeoutId = setTimeout(() => {
      saveTempData()
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [
    brandId, modelId, year, selectedVersion, price, mileage, color, 
    fuelType, transmission, licensePlate, owners, description, location,
    selectedOpcionais, selectedCarroceria, selectedTipoVendedor, 
    selectedCaracteristicas, selectedBlindagem, selectedLeilao, planoSelecionado
  ])

  // Função para carregar dados do veículo para edição
  const loadVehicleData = async (vehicleId: string) => {
    try {
      console.log('🔄 Carregando dados do veículo para edição:', vehicleId)
      setLoadingVehicleData(true)
      const vehicle = await VehicleService.getVehicleById(vehicleId)
      
      console.log('📋 Dados do veículo carregados:', vehicle)
      
      if (vehicle) {
        console.log('✅ Preenchendo campos com dados existentes...')
        // Preencher todos os campos com os dados existentes
        setBrandId(vehicle.marca || "")
        setModelId(vehicle.modelo || "")
        setYear(vehicle.ano?.toString() || "")
        setSelectedVersion(vehicle.versao || "")
        setPrice(vehicle.preco?.toString() || "")
        setMileage(vehicle.quilometragem?.toString() || "")
        setColor(vehicle.cor || "")
        setFuelType(vehicle.combustivel?.[0] || "")
        setTransmission(vehicle.cambio || "")
        setMotor(vehicle.motor || "")
        setOpcionais(vehicle.opcionais || [])
        setLocation(vehicle.cidade || "")
        setState(vehicle.estado || "")
        setObservations(vehicle.observacoes || "")
        setPhotos(vehicle.fotos || [])
        setPlanoSelecionado(vehicle.plano || "")
        
        console.log('✅ Campos preenchidos com sucesso')
        
        toast({
          title: "Dados carregados",
          description: "Os dados do veículo foram carregados para edição.",
        })
      } else {
        console.log('❌ Veículo não encontrado')
        toast({
          title: "Erro",
          description: "Veículo não encontrado.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados do veículo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do veículo.",
        variant: "destructive",
      })
    } finally {
      setLoadingVehicleData(false)
    }
  }

  // Carregar planos do banco de dados
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true)
        const anuncioPlans = await PlansService.getPlansByType('anuncio')
        setPlans(anuncioPlans)
        
        // Selecionar automaticamente o primeiro plano (geralmente o gratuito)
        if (anuncioPlans.length > 0 && !planoSelecionado) {
          setPlanoSelecionado(anuncioPlans[0].id)
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível carregar os planos disponíveis.",
          variant: "destructive",
        })
      } finally {
        setPlansLoading(false)
      }
    }

    loadPlans()
  }, [toast, planoSelecionado])

  // Atualizar saldo ao carregar a página
  useEffect(() => {
    if (user) {
      console.log('🔄 Atualizando saldo na página de anúncios...')
      refreshSaldo()
    }
  }, [user]) // Removido refreshSaldo das dependências para evitar loop infinito

  // Função para verificar limite de anúncios gratuitos por CPF
  const verificarLimiteAnunciosGratuitos = async (cpf: string): Promise<{ podeAnunciar: boolean; anunciosRestantes: number }> => {
    try {
      // Buscar todos os veículos do usuário e filtrar os gratuitos ativos
      const todosVeiculos = await VehicleService.getUserVehicles(user?.id || '')
      const anunciosGratuitosAtivos = todosVeiculos.filter(v => v.plano === 'gratuito' && v.status === 'ativo').length
      
      const planoGratuito = plans.find(p => p.preco === 0)
      const limite = planoGratuito?.limite_anuncios || 3
      const anunciosRestantes = Math.max(0, limite - anunciosGratuitosAtivos)

      return {
        podeAnunciar: anunciosGratuitosAtivos < limite,
        anunciosRestantes
      }
    } catch (error) {
      console.error('Erro ao verificar limite de anúncios:', error)
      return { podeAnunciar: false, anunciosRestantes: 0 }
    }
  }

  // Carregar marcas da FIPE
  useEffect(() => {
    if (fipeBrands.length > 0) {
      setBrands(
        fipeBrands.map((brand) => ({
          value: brand.name, // Usar nome em vez de código
          label: brand.name,
          image: `/brands/${brand.id}.svg`, // Assumindo que temos logos para as marcas
        })),
      )
    } else {
      // Fallback para dados estáticos
      const allBrands = getAllBrands()
      setBrands(
        allBrands.map((brand) => ({
          value: brand.id,
          label: brand.name,
          image: brand.logo,
        })),
      )
    }

    // Carregar combustíveis (lista fixa)
    setFuelTypes(
      combustiveis.map((fuel) => ({
        value: fuel,
        label: fuel,
      })),
    )
  }, [fipeBrands])

  // Carregar modelos quando a marca mudar
  useEffect(() => {
    if (brandId) {
      // Encontrar o código da marca selecionada
      const selectedBrand = fipeBrands.find(brand => brand.name === brandId)
      if (selectedBrand) {
        setSelectedBrandCode(selectedBrand.code)
      }

      // Usar modelos processados com inteligência se disponíveis
      if (processedModels.length > 0) {
        setModels(
          processedModels.map((model) => ({
            value: model.name, // Nome limpo do modelo
            label: model.name,
          })),
        )
      } else if (fipeModels.length > 0) {
        setModels(
          fipeModels.map((model) => ({
            value: model.name, // Usar nome em vez de código
            label: model.name,
          })),
        )
      } else {
        // Fallback para dados estáticos
        const brandModels = getModelsByBrand(brandId)
        setModels(
          brandModels.map((model) => ({
            value: model.id,
            label: model.name,
          })),
        )
      }
      setModelId("")
      setYear("")
      setSelectedVersion("")
    } else {
      setModels([])
    }
  }, [brandId, processedModels, fipeModels, fipeBrands])

  // Carregar anos quando o modelo mudar
  useEffect(() => {
    if (brandId && modelId) {
      // Encontrar o código do modelo selecionado
      const selectedModel = fipeModels.find(model => model.name === modelId)
      if (selectedModel) {
        setSelectedModelCode(selectedModel.code)
      }

      // Usar anos únicos processados com inteligência se disponíveis
      if (uniqueYears.length > 0) {
        setYears(
          uniqueYears.map((year) => ({
            value: year.toString(),
            label: year.toString(),
          })),
        )
      } else if (fipeYears.length > 0) {
        setYears(
          fipeYears.map((year) => ({
            value: year.name, // Usar nome em vez de código
            label: year.name,
          })),
        )
      } else {
        // Fallback para dados estáticos
        const modelYears = getYearsByModel(brandId, modelId)
        setYears(
          modelYears.map((year) => ({
            value: year.toString(),
            label: year.toString(),
          })),
        )
      }

      // Carregar tipos de combustível (lista fixa)
      setFuelTypes(
        combustiveis.map((fuel) => ({
          value: fuel,
          label: fuel,
        })),
      )

      // Carregar transmissões (usar dados estáticos por enquanto)
      const modelTransmissions = getTransmissionsByModel(brandId, modelId)
      console.log('🔧 Carregando transmissões para:', { brandId, modelId, modelTransmissions })
      
      // Se não houver transmissões específicas do modelo, usar lista padrão
      const transmissionsList = modelTransmissions.length > 0 ? modelTransmissions : ['Manual', 'Automático', 'CVT', 'Semi-automático']
      console.log('🔧 Lista de transmissões final:', transmissionsList)
      
      setTransmissions(
        transmissionsList.map((transmission) => ({
          value: transmission,
          label: transmission,
        })),
      )

      setYear("")
      setSelectedVersion("")
    } else {
      setYears([])
      setFuelTypes([])
      setTransmissions([])
    }
  }, [brandId, modelId, uniqueYears, fipeYears, fipeModels])

  // Carregar versões quando o ano mudar
  useEffect(() => {
    if (brandId && modelId && year) {
      // Usar versões processadas com inteligência se disponíveis
      if (versionsByYear.length > 0) {
        setVersions(
          versionsByYear.map((version) => ({
            value: version.name, // Nome limpo da versão
            label: version.name,
          })),
        )
      } else {
        // Fallback para dados estáticos
        const modelVersions = getVersionsByModel(brandId, modelId)
        setVersions(
          modelVersions.map((version) => ({
            value: version.id,
            label: version.name,
          })),
        )
      }
      setSelectedVersion("")
    } else {
      setVersions([])
    }
  }, [brandId, modelId, year, versionsByYear])

  // Calcular progresso do formulário
  useEffect(() => {
    let completed = 0
    const total = 9 // Campos obrigatórios (incluindo versão e câmbio)

    const fields = {
      brandId: !!brandId,
      modelId: !!modelId,
      year: !!year,
      selectedVersion: !!selectedVersion,
      price: !!price,
      mileage: !!mileage,
      color: !!color,
      fuelType: !!fuelType,
      transmission: !!transmission
    }

    if (brandId) completed++
    if (modelId) completed++
    if (year) completed++
    if (selectedVersion) completed++
    if (price) completed++
    if (mileage) completed++
    if (color) completed++
    if (fuelType) completed++
    if (transmission) completed++

    const percentage = Math.floor((completed / total) * 100)
    console.log('📊 Validação do formulário:', { fields, completed, total, percentage, formCompleted: percentage === 100 })
    setProgress(percentage)
    setFormCompleted(percentage === 100)
  }, [brandId, modelId, year, selectedVersion, price, mileage, color, fuelType, transmission])

  const handlePublicarAnuncio = async () => {
    // Proteção contra duplo submit
    if (loading) {
      console.log('⚠️ Publicação já em andamento, ignorando duplo clique')
      return
    }

    console.log('🚀 Iniciando publicação do anúncio...')
    console.log('👤 Usuário:', user)
    console.log('📋 Formulário completo:', formCompleted)
    console.log('📦 Plano selecionado:', planoSelecionado)

    // Mostrar feedback imediato
    setLoading(true)
    setSavingStep('Iniciando publicação...')
    
    // Toast imediato para feedback
    toast({
      title: "Publicando anúncio...",
      description: "Aguarde enquanto processamos seu anúncio",
    })
    
    if (!user) {
      console.log('❌ Usuário não logado')
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para anunciar",
        variant: "destructive",
      })
      return
    }

    if (!formCompleted) {
      console.log('❌ Formulário incompleto')
      console.log('📊 Dados do formulário:', {
        brandId, modelId, year, selectedVersion, price, mileage, color, fuelType, transmission
      })
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const plano = plans.find(p => p.id === planoSelecionado)
    if (!plano) {
      console.log('❌ Plano não encontrado para ID:', planoSelecionado)
      console.log('📋 Planos disponíveis:', plans.map(p => ({ id: p.id, nome: p.nome, preco: p.preco })))
      toast({
        title: "Plano não encontrado",
        description: "Selecione um plano válido para continuar.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    console.log('📦 Plano selecionado:', {
      id: plano.id,
      nome: plano.nome,
      preco: plano.preco,
      limite_anuncios: plano.limite_anuncios,
      tipo: plano.tipo
    })

    // Verificar limite de anúncios gratuitos se for plano gratuito
    if (plano.preco === 0) {
      console.log('🔍 Verificando limite de anúncios gratuitos...')
      setSavingStep('Verificando limite de anúncios...')
      
      try {
        const { podeAnunciar, anunciosRestantes } = await verificarLimiteAnunciosGratuitos(user.cpf || "")
        console.log('📊 Resultado da verificação:', { podeAnunciar, anunciosRestantes })
        
        if (!podeAnunciar) {
          console.log('❌ Limite de anúncios atingido')
          console.log('📊 Detalhes do limite:', {
            limite: plano.limite_anuncios,
            anunciosRestantes,
            planoNome: plano.nome
          })
          
          // Mostrar modal com informações do limite
          setLimitInfo({
            limite: plano.limite_anuncios,
            anunciosRestantes,
            planoNome: plano.nome
          })
          setShowLimitModal(true)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('❌ Erro ao verificar limite de anúncios:', error)
        toast({
          title: "Erro na verificação",
          description: "Erro ao verificar limite de anúncios. Tente novamente.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
    }

    // Para planos pagos, usar Mercado Pago em vez de validar saldo
    if (plano.preco > 0) {
      console.log('💳 Plano pago detectado, iniciando pagamento via Mercado Pago:', {
        precoPlano: plano.preco,
        planoNome: plano.nome
      })
      
      // Criar o veículo primeiro (sem cobrança ainda)
      let veiculoCriado = null
      if (user?.id) {
        console.log('🚗 Salvando veículo no Supabase...')
        setSavingStep('Salvando dados do veículo...')
        
        const vehicleData = {
          marca: brands.find(b => b.value === brandId)?.label || '',
          modelo: models.find(m => m.value === modelId)?.label || '',
          versao: selectedVersion || 'Não informado',
          ano: parseInt(year),
          cor: color,
          quilometragem: parseInt(mileage),
          motor: `${fuelType} ${transmission}`,
          combustivel: [fuelType],
          cambio: transmission,
          opcionais: selectedOpcionais,
          carroceria: selectedCarroceria,
          tipo_vendedor: selectedTipoVendedor,
          caracteristicas: selectedCaracteristicas,
          blindagem: selectedBlindagem === 'Sim',
          leilao: selectedLeilao === 'Sim',
          preco: parseFloat(price),
          fipe: fipeData?.price,
          placa_parcial: licensePlate,
          numero_proprietarios: parseInt(owners),
          observacoes: description,
          fotos: [],
          plano: plano.nome.toLowerCase() as 'gratuito' | 'destaque' | 'premium',
          cidade: location.split(',')[0]?.trim() || 'São Paulo',
          estado: location.split(',')[1]?.trim() || 'SP',
          status: 'pendente_pagamento', // Status inicial para planos pagos
        }

        try {
          console.log('📝 Dados do veículo a serem salvos:', vehicleData)
          veiculoCriado = await VehicleService.createVehicle(vehicleData, user.id)
          console.log('✅ Veículo salvo com sucesso:', veiculoCriado)

          // Upload das fotos se houver
          if (photos.length > 0 && veiculoCriado?.id) {
            console.log('📤 Fazendo upload das fotos...')
            setSavingStep('Fazendo upload das fotos...')
            try {
              const photoUrls = await ImageUploadService.uploadImages(photos, veiculoCriado.id)
              console.log('✅ Fotos enviadas com sucesso:', photoUrls)
              
              // Atualizar o veículo com as URLs das fotos
              setSavingStep('Atualizando veículo com fotos...')
              await VehicleService.updateVehicle(veiculoCriado.id, { fotos: photoUrls })
              console.log('✅ Veículo atualizado com as fotos')
              
            } catch (photoError) {
              console.error('❌ Erro no upload das fotos:', photoError)
              toast({
                title: "Aviso",
                description: "Anúncio criado, mas houve erro no upload das fotos. Você pode editá-las depois.",
                variant: "destructive",
              })
            }
          }
        } catch (error) {
          console.error('❌ Erro ao salvar veículo:', error)
          toast({
            title: "Erro ao salvar anúncio",
            description: `Erro: ${error.message}`,
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      // Processar pagamento via Mercado Pago
      if (veiculoCriado?.id) {
        console.log('💳 Iniciando pagamento via Mercado Pago...')
        setSavingStep('Processando pagamento...')
        
        const descricao = `Anúncio ${plano.nome} - ${plano.duracao_dias ? `${plano.duracao_dias} dias` : "vitalício"}`
        
        try {
          const success = await processPayment(plano.preco, descricao)
          
          if (success) {
            toast({
              title: "Redirecionando para pagamento",
              description: "Você será redirecionado para o Mercado Pago",
            })
            
            // Salvar dados do veículo e plano no localStorage para recuperar após pagamento
            localStorage.setItem('pendingVehicle', JSON.stringify({
              vehicleId: veiculoCriado.id,
              planId: plano.id,
              planName: plano.nome,
              planPrice: plano.preco
            }))
            
            setLoading(false)
            return
          } else {
            toast({
              title: "Erro no pagamento",
              description: "Não foi possível processar o pagamento",
              variant: "destructive",
            })
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('❌ Erro no pagamento:', error)
          toast({
            title: "Erro no pagamento",
            description: "Ocorreu um erro ao processar o pagamento",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }
    }

    // Para planos gratuitos, processar normalmente
    if (plano.preco === 0) {
      console.log('🆓 Plano gratuito detectado, processando normalmente')
      
      setSavingStep('Preparando dados do veículo...')
      
      try {
        // Criar o veículo no Supabase
        let veiculoCriado = null
        if (user?.id) {
          console.log('🚗 Salvando veículo no Supabase...')
          setSavingStep('Salvando dados do veículo...')
          
          const vehicleData = {
            marca: brands.find(b => b.value === brandId)?.label || '',
            modelo: models.find(m => m.value === modelId)?.label || '',
            versao: selectedVersion || 'Não informado',
            ano: parseInt(year),
            cor: color,
            quilometragem: parseInt(mileage),
            motor: `${fuelType} ${transmission}`,
            combustivel: [fuelType],
            cambio: transmission,
            opcionais: selectedOpcionais,
            carroceria: selectedCarroceria,
            tipo_vendedor: selectedTipoVendedor,
            caracteristicas: selectedCaracteristicas,
            blindagem: selectedBlindagem === 'Sim',
            leilao: selectedLeilao === 'Sim',
            preco: parseFloat(price),
            fipe: fipeData?.price,
            placa_parcial: licensePlate,
            numero_proprietarios: parseInt(owners),
            observacoes: description,
            fotos: [],
            plano: plano.nome.toLowerCase() as 'gratuito' | 'destaque' | 'premium',
            cidade: location.split(',')[0]?.trim() || 'São Paulo',
            estado: location.split(',')[1]?.trim() || 'SP',
            status: 'ativo', // Status ativo para planos gratuitos
          }

          veiculoCriado = await VehicleService.createVehicle(vehicleData, user.id)
          console.log('✅ Veículo salvo com sucesso:', veiculoCriado)

          // Upload das fotos se houver
          if (photos.length > 0 && veiculoCriado?.id) {
            console.log('📤 Fazendo upload das fotos...')
            setSavingStep('Fazendo upload das fotos...')
            try {
              const photoUrls = await ImageUploadService.uploadImages(photos, veiculoCriado.id)
              console.log('✅ Fotos enviadas com sucesso:', photoUrls)
              
              // Atualizar o veículo com as URLs das fotos
              setSavingStep('Atualizando veículo com fotos...')
              await VehicleService.updateVehicle(veiculoCriado.id, { fotos: photoUrls })
              console.log('✅ Veículo atualizado com as fotos')
              
            } catch (photoError) {
              console.error('❌ Erro no upload das fotos:', photoError)
              toast({
                title: "Aviso",
                description: "Anúncio criado, mas houve erro no upload das fotos. Você pode editá-las depois.",
                variant: "destructive",
              })
            }
          }
        }

        // Sucesso - mostrar toast e redirecionar
        const mensagemDuracao = plano.duracao_dias 
          ? `${plano.duracao_dias} dias` 
          : "vitalício até vender"
        
        setSavingStep('Finalizando...')
        setShowSuccessModal(true)
        
        // Limpar dados temporários após sucesso
        clearTempData()
        
        toast({
          title: "Anúncio publicado com sucesso!",
          description: `Seu anúncio ${plano.nome} está ativo por ${mensagemDuracao}`,
        })

        // Redirecionar para meus anúncios após 3 segundos
        setTimeout(() => {
          window.location.href = "/meus-anuncios"
        }, 3000)
        
      } catch (error) {
        console.error("Erro ao publicar anúncio:", error)
        toast({
          title: "Erro ao publicar",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditMode ? "Editar Anúncio" : "Anunciar Veículo"}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode ? "Atualize os dados do seu veículo" : "Escolha o plano ideal e preencha os dados do seu veículo"}
              </p>
              {isSavingTemp && !isEditMode && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <Save className="w-3 h-3 animate-pulse" />
                  <span>Salvando automaticamente...</span>
                </div>
              )}
              {!isEditMode && (brandId || price || description) && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                        clearTempData()
                        // Resetar todos os campos
                        setBrandId("")
                        setModelId("")
                        setYear("")
                        setSelectedVersion("")
                        setPrice("")
                        setMileage("")
                        setColor("")
                        setFuelType("")
                        setTransmission("")
                        setLicensePlate("")
                        setOwners("1")
                        setDescription("")
                        setLocation("")
                        setSelectedOpcionais([])
                        setSelectedCarroceria("")
                        setSelectedTipoVendedor("")
                        setSelectedCaracteristicas([])
                        setSelectedBlindagem("")
                        setSelectedLeilao("")
                        setPhotos([])
                        
                        toast({
                          title: "Dados limpos",
                          description: "Todos os dados foram removidos. Você pode começar novamente.",
                        })
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    🗑️ Limpar dados e começar do zero
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}% completo</span>
          </div>
        </div>

        {user && (
          <Alert className="mb-6">
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center gap-2">
                <strong>Saldo disponível:</strong>{" "}
                <span className="text-green-600 font-semibold">
                  {(user.saldo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                <button
                  onClick={async () => {
                    console.log('🔄 Atualizando saldo...')
                    const novoSaldo = await refreshSaldo()
                    if (novoSaldo !== undefined) {
                      toast({
                        title: "Saldo atualizado",
                        description: `Novo saldo: ${novoSaldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                      })
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                  title="Atualizar saldo do banco"
                >
                  🔄 Atualizar
                </button>
              </div>
              {(user.saldo || 0) < 35 && (
                <span className="ml-2">
                  <Link href="/conta" className="text-blue-600 hover:underline">
                    Adicionar saldo
                  </Link>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {plansLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando planos...</p>
            </div>
          </div>
        ) : (
          <div id="planos-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plano) => (
              <Card
                key={plano.id}
                className={`cursor-pointer transition-all ${
                  planoSelecionado === plano.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setPlanoSelecionado(plano.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {plano.preco === 0 && <Car className="w-8 h-8 text-gray-600" />}
                    {plano.preco > 0 && plano.preco < 100 && <Star className="w-8 h-8 text-blue-600" />}
                    {plano.preco >= 100 && <Zap className="w-8 h-8 text-yellow-600" />}
                  </div>
                  <CardTitle className="text-xl">{plano.nome}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plano.preco === 0
                      ? "Grátis"
                      : plano.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plano.duracao_dias ? `por ${plano.duracao_dias} dias` : "vitalício até vender"}
                    {plano.preco === 80 && (
                      <span className="block text-xs text-orange-600 mt-1">
                        *Renovação: +45 dias sem destaque
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plano.beneficios.map((beneficio, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {beneficio}
                      </li>
                    ))}
                  </ul>

                  {planoSelecionado === plano.id && <Badge className="w-full mt-4 justify-center">Selecionado</Badge>}

                  {/* Informações especiais para planos premium */}
                  {plano.preco >= 100 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Plano Premium</span>
                      </div>
                      <p className="text-xs text-yellow-700">
                        {plano.duracao_dias ? `Destaque por ${plano.duracao_dias} dias` : "Anúncio vitalício até vender"}
                      </p>
                    </div>
                  )}

                  {plano.preco > 0 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Pagamento via Mercado Pago (PIX, cartão, boleto)
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Informações Básicas</span>
              <span className="sm:hidden">Básicas</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Detalhes Técnicos</span>
              <span className="sm:hidden">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Fotos e Descrição</span>
              <span className="sm:hidden">Fotos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle para escolher entre filtros dinâmicos ou tradicionais */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="dynamic-filters">Filtros Dinâmicos (Webmotors)</Label>
                    <input
                      id="dynamic-filters"
                      type="checkbox"
                      checked={useDynamicFilters}
                      onChange={(e) => setUseDynamicFilters(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <div className="text-xs text-muted-500">
                    {useDynamicFilters ? "Filtros atualizam automaticamente" : "Filtros tradicionais"}
                  </div>
                </div>

                {useDynamicFilters ? (
                  /* Filtros Dinâmicos FIPE */
                  <FipeVehicleSelector
                    onSelectionChange={handleDynamicSelection}
                    initialValues={{}}
                  />
                ) : (
                  /* Filtros Tradicionais */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="brand">
                          Marca <span className="text-red-500">*</span>
                          {brandsLoading && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
                        </Label>
                        <VehicleSelector
                          options={brands}
                          value={brandId}
                          onChange={setBrandId}
                          placeholder={brandsLoading ? "Carregando marcas..." : "Selecione a marca"}
                          showImages={true}
                          disabled={brandsLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="model">
                          Modelo <span className="text-red-500">*</span>
                          {(modelsLoading || processedModelsLoading) && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
                        </Label>
                        <VehicleSelector
                          options={models}
                          value={modelId}
                          onChange={setModelId}
                          placeholder={(modelsLoading || processedModelsLoading) ? "Carregando modelos..." : "Selecione o modelo"}
                          disabled={!brandId || modelsLoading || processedModelsLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="year">
                          Ano <span className="text-red-500">*</span>
                          {(yearsLoading || uniqueYearsLoading) && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
                        </Label>
                        <VehicleSelector
                          options={years}
                          value={year}
                          onChange={setYear}
                          placeholder={(yearsLoading || uniqueYearsLoading) ? "Carregando anos..." : "Selecione o ano"}
                          disabled={!modelId || yearsLoading || uniqueYearsLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="version">
                          Versão <span className="text-red-500">*</span>
                          {versionsLoading && <span className="text-xs text-blue-600 ml-2">Carregando...</span>}
                        </Label>
                        <VehicleSelector
                          options={versions}
                          value={selectedVersion}
                          onChange={setSelectedVersion}
                          placeholder={versionsLoading ? "Carregando versões..." : "Selecione a versão"}
                          disabled={!year || versionsLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Preço <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input
                        id="price"
                        type="text"
                        placeholder="50.000"
                        value={price}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          setPrice(value)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="location"
                        type="text"
                        placeholder="São Paulo, SP"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentTab("details")}>Próximo: Detalhes Técnicos</Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Detalhes Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">
                      Quilometragem <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="mileage"
                        type="text"
                        placeholder="45.000"
                        value={mileage}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          setMileage(value)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">
                      Cor <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={cores.map((cor) => ({ value: cor, label: cor }))}
                      value={color}
                      onChange={setColor}
                      placeholder="Selecione a cor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">
                      Combustível <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={fuelTypes}
                      value={fuelType}
                      onChange={setFuelType}
                      placeholder="Selecione o combustível"
                      disabled={!modelId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission">Câmbio</Label>
                    <VehicleSelector
                      options={transmissions}
                      value={transmission}
                      onChange={setTransmission}
                      placeholder="Selecione o câmbio"
                      disabled={!modelId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">Placa (parcial)</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="licensePlate"
                        type="text"
                        placeholder="ABC-**12"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="pl-10"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owners">Número de proprietários</Label>
                    <RadioGroup value={owners} onValueChange={setOwners} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="owner-1" />
                        <Label htmlFor="owner-1">1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="owner-2" />
                        <Label htmlFor="owner-2">2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="owner-3" />
                        <Label htmlFor="owner-3">3</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4+" id="owner-4" />
                        <Label htmlFor="owner-4">4+</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="history-check">Verificar histórico veicular</Label>
                    <Switch id="history-check" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adicione um selo de confiança ao seu anúncio verificando o histórico completo do veículo.
                    {(() => {
                      const planoSelecionadoData = plans.find(p => p.id === planoSelecionado)
                      return planoSelecionadoData?.preco >= 100 ? (
                        <span className="text-green-600 font-medium"> Incluído no plano Premium!</span>
                      ) : (
                        <span> Custo adicional: R$ 25,00</span>
                      )
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seletor de Opcionais */}
            <OpcionaisSelector
              onOpcionaisChange={setSelectedOpcionais}
              onCarroceriaChange={setSelectedCarroceria}
              onTipoVendedorChange={setSelectedTipoVendedor}
              onCaracteristicasChange={setSelectedCaracteristicas}
              onBlindagemChange={setSelectedBlindagem}
              onLeilaoChange={setSelectedLeilao}
              initialValues={{
                opcionais: selectedOpcionais,
                carroceria: selectedCarroceria,
                tipoVendedor: selectedTipoVendedor,
                caracteristicas: selectedCaracteristicas,
                blindagem: selectedBlindagem,
                leilao: selectedLeilao
              }}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab("info")}>
                Voltar
              </Button>
              <Button onClick={() => setCurrentTab("photos")}>Próximo: Fotos e Descrição</Button>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Fotos e Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PhotoUpload maxPhotos={(() => {
                  const planoSelecionadoData = plans.find(p => p.id === planoSelecionado)
                  return planoSelecionadoData?.preco === 0 ? 5 : planoSelecionadoData?.preco < 100 ? 10 : 20
                })()} onChange={setPhotos} value={photos} />

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva seu veículo, destacando características importantes, estado de conservação e diferenciais..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab("details")}>
                Voltar
              </Button>
              <Button
                onClick={handlePublicarAnuncio}
                disabled={
                  loading ||
                  loadingMercadoPago ||
                  !formCompleted
                }
                className="px-8 min-w-[200px]"
              >
                {loading || loadingMercadoPago ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">
                        {loadingMercadoPago ? "Processando pagamento..." : "Publicando..."}
                      </span>
                    </div>
                    {savingStep && (
                      <div className="text-xs text-white/90 text-center bg-white/10 px-2 py-1 rounded">
                        {savingStep}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Car className="w-4 h-4 mr-2" />
                    {(() => {
                      const planoSelecionadoData = plans.find(p => p.id === planoSelecionado)
                      return (
                        <>
                          {planoSelecionadoData?.preco === 0 ? "Publicar Anúncio" : "Finalizar Anúncio"} {planoSelecionadoData?.nome}
                          {planoSelecionadoData && planoSelecionadoData.preco > 0 && (
                            <span className="ml-2">
                              (
                              {planoSelecionadoData.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              )
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CacheDebug />

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Anúncio Publicado!
            </h3>
            <p className="text-gray-600 mb-4">
              Seu anúncio foi publicado com sucesso e está ativo.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Redirecionando para seus anúncios...
            </div>
          </div>
        </div>
      )}

      {/* Modal de Limite de Anúncios */}
      {showLimitModal && limitInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <span className="font-semibold text-red-800 text-sm sm:text-base">Atenção!</span>
              </div>
              <p className="text-red-700 text-xs sm:text-sm">
                Você não pode criar mais anúncios gratuitos. Contrate um plano pago para continuar.
              </p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
              🚫 Limite de 3 Anúncios Atingido
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-center text-sm sm:text-base">
              Você atingiu o limite de <strong className="text-red-600">{limitInfo.limite} anúncios gratuitos</strong> permitidos.
            </p>
            <p className="text-gray-700 mb-4 sm:mb-6 text-center font-medium text-sm sm:text-base">
              Para continuar anunciando, você precisa <strong className="text-blue-600">contratar um plano pago</strong>.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Anúncios restantes:</span>
                <span className="text-xs sm:text-sm font-bold text-red-600">{limitInfo.anunciosRestantes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-center text-sm sm:text-base">💳 Contrate um plano pago para continuar anunciando:</h4>
              <div className="space-y-2 sm:space-y-3">
                {plans.filter(p => p.preco > 0).map((plano) => (
                  <div 
                    key={plano.id}
                    className="border rounded-lg p-3 sm:p-4 hover:border-blue-500 cursor-pointer transition-colors"
                    onClick={() => {
                      setPlanoSelecionado(plano.id)
                      setShowLimitModal(false)
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{plano.nome}</h5>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{plano.descricao}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {plano.limite_anuncios} anúncios • {plano.duracao_dias ? `${plano.duracao_dias} dias` : 'Vitalício'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-bold text-blue-600">
                          {plano.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        {plano.destaque && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowLimitModal(false)
                  // Scroll para a seção de planos
                  document.getElementById('planos-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
              >
                💳 Ver Planos Pagos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}