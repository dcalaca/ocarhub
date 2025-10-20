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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhotoUpload } from "@/components/photo-upload"
import { CacheDebug } from "@/components/cache-debug"
import { cores, combustiveis, cambios } from "@/lib/data/filters"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useMercadoPago } from "@/hooks/use-mercadopago"
import {
  Car,
  Star,
  Zap,
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
import { useFipeBrands, useFipeModels, useFipeYears } from "@/hooks/use-fipe-data"
import { useFipeProcessedModels, useFipeProcessedVersions, useFipeUniqueYears, useFipeVersionsByYear } from "@/hooks/use-fipe-intelligence"
import { FipeVehicleSelector } from "@/components/fipe-vehicle-selector"
import { OpcionaisSelector } from "@/components/opcionais-selector"
import { VehicleService } from "@/lib/vehicle-service"
import { PlansService, type Plan } from "@/lib/plans-service"
import { ImageUploadService } from "@/lib/image-upload-service"

export default function AnunciarPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { loading: loadingMercadoPago, processPayment } = useMercadoPago()
  const searchParams = useSearchParams()
  
  // Estados de modo de edição
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [loadingVehicleData, setLoadingVehicleData] = useState(false)
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
  const [dataLoaded, setDataLoaded] = useState(false)

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
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)

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
      timestamp: Date.now()
    }
    
    console.log('💾 Salvando dados temporários:', {
      brandId, modelId, year, selectedVersion, price, mileage, color,
      fuelType, transmission, licensePlate, owners, description, location,
      selectedOpcionais, selectedCarroceria, selectedTipoVendedor,
      selectedCaracteristicas, selectedBlindagem, selectedLeilao, planoSelecionado
    })
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempData))
      console.log('✅ Dados salvos temporariamente com sucesso')
    } catch (error) {
      console.error('❌ Erro ao salvar dados temporários:', error)
    } finally {
      // Remover indicador após um breve delay
      setTimeout(() => setIsSavingTemp(false), 500)
    }
  }

  // Função para carregar dados temporários
  const loadTempData = () => {
    let savedData = null
    try {
      savedData = localStorage.getItem(STORAGE_KEY)
      console.log('📂 Tentando carregar dados temporários:', savedData ? 'Dados encontrados' : 'Nenhum dado salvo')
      
      if (savedData) {
        const tempData = JSON.parse(savedData)
        console.log('📋 Dados temporários encontrados:', tempData)
        
        // Verificar se é um refresh da página (performance.navigation.type === 1)
        const isPageRefresh = typeof window !== 'undefined' && 
          window.performance && 
          window.performance.navigation && 
          window.performance.navigation.type === 1
        
        if (isPageRefresh) {
          console.log('🔄 Refresh da página detectado, não carregando dados salvos')
          localStorage.removeItem(STORAGE_KEY)
          console.log('🗑️ Dados temporários removidos após refresh')
          return
        }
        
        // Carregar dados salvos
        console.log('🔄 Carregando dados salvos...')
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
        
        console.log('✅ Dados temporários carregados com sucesso')
        
        // Marcar que os dados foram carregados
        setDataLoaded(true)
        
        toast({
          title: "Dados recuperados",
          description: "Seus dados foram recuperados automaticamente.",
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados temporários:', error)
    } finally {
      // Se não há dados salvos, marcar como carregado para permitir interações normais
      if (!savedData) {
        console.log('📝 Nenhum dado salvo encontrado, permitindo interações normais')
        setDataLoaded(true)
      }
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
    console.log('🔄 handleDynamicSelection chamado com:', selection)
    console.log('📊 dataLoaded:', dataLoaded)
    
    // Se os dados foram carregados do localStorage, só ignorar se TODOS os campos estão vazios
    if (dataLoaded && !selection.marca && !selection.modelo && !selection.ano && !selection.veiculo) {
      console.log('🚫 Ignorando seleção completamente vazia após carregamento de dados')
      return
    }
    
    if (selection.marca) {
      console.log('🏷️ Atualizando marca:', selection.marca)
      setBrandId(selection.marca)
    }
    if (selection.veiculo) {
      console.log('🚗 Atualizando versão:', selection.veiculo)
      setSelectedVersion(selection.veiculo)
    }
    if (selection.ano) {
      console.log('📅 Atualizando ano:', selection.ano)
      setYear(selection.ano.toString())
    }
    if (selection.modelo) {
      console.log('🔧 Atualizando modelo:', selection.modelo)
      setModelId(selection.modelo)
    }
    
    console.log('✅ Estados atualizados via handleDynamicSelection')
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
      // Se não há dados salvos, marcar como carregado para permitir interações normais
      setTimeout(() => {
        if (!dataLoaded) {
          console.log('📝 Nenhum dado salvo encontrado, permitindo interações normais')
          setDataLoaded(true)
        }
      }, 1000)
    }
  }, [searchParams])

  // Salvar dados automaticamente quando mudarem
  useEffect(() => {
    // Não salvar se estiver em modo de edição
    if (isEditMode) {
      console.log('🚫 Modo de edição ativo, não salvando dados temporários')
      return
    }
    
    console.log('🔄 Dados mudaram, agendando salvamento automático...')
    
    // Debounce para evitar muitas operações de salvamento
    const timeoutId = setTimeout(() => {
      console.log('⏰ Executando salvamento automático...')
      saveTempData()
    }, 1000)
    
    return () => {
      console.log('🔄 Cancelando salvamento anterior...')
      clearTimeout(timeoutId)
    }
  }, [
    brandId, modelId, year, selectedVersion, price, mileage, color, 
    fuelType, transmission, licensePlate, owners, description, location,
    selectedOpcionais, selectedCarroceria, selectedTipoVendedor, 
    selectedCaracteristicas, selectedBlindagem, selectedLeilao, planoSelecionado
  ])

  // Log dos estados principais para debug
  useEffect(() => {
    console.log('📊 Estados principais atualizados:', {
      brandId, modelId, year, selectedVersion, price, mileage, color,
      fuelType, transmission, licensePlate, owners, description, location
    })
  }, [brandId, modelId, year, selectedVersion, price, mileage, color, fuelType, transmission, licensePlate, owners, description, location])

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

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg w-fit">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {isEditMode ? "Editar Anúncio" : "Anunciar Veículo"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
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

          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mt-4">
            <div
              className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}% completo</span>
          </div>
        </div>


        {plansLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando planos...</p>
            </div>
          </div>
        ) : (
          <div id="planos-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
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

        {/* Formulário em página única */}
        <div className="space-y-8">
          {/* Seção 1: Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Informações Básicas do Veículo
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Selecione a marca, modelo, ano e versão do seu veículo
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtros Dinâmicos FIPE - sempre ativados */}
              <FipeVehicleSelector
                key={`fipe-selector-${brandId}-${modelId}-${year}-${selectedVersion}`}
                onSelectionChange={handleDynamicSelection}
                initialValues={{
                  marca: brandId,
                  modelo: modelId,
                  ano: year ? parseInt(year) : undefined,
                  versao: selectedVersion
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Separador Visual */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 rounded-full">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Detalhes Técnicos</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Seção 2: Detalhes Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                Detalhes Técnicos
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Informações sobre quilometragem, cor, combustível e outras características
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" className="max-h-[200px] overflow-y-auto">
                      {cores.map((cor) => (
                        <SelectItem key={cor} value={cor}>
                          {cor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">
                    Combustível <span className="text-red-500">*</span>
                  </Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o combustível" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" className="max-h-[200px] overflow-y-auto">
                      {combustiveis.map((combustivel) => (
                        <SelectItem key={combustivel} value={combustivel}>
                          {combustivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="transmission">Câmbio</Label>
                  <Select value={transmission} onValueChange={setTransmission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o câmbio" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" className="max-h-[200px] overflow-y-auto">
                      {cambios.map((cambio) => (
                        <SelectItem key={cambio} value={cambio}>
                          {cambio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <RadioGroup value={owners} onValueChange={setOwners} className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="owner-1" />
                      <Label htmlFor="owner-1" className="text-sm">1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="owner-2" />
                      <Label htmlFor="owner-2" className="text-sm">2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="owner-3" />
                      <Label htmlFor="owner-3" className="text-sm">3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4+" id="owner-4" />
                      <Label htmlFor="owner-4" className="text-sm">4+</Label>
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

          {/* Separador Visual */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 rounded-full">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Opcionais e Características</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Seção 3: Opcionais */}
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

          {/* Separador Visual */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 rounded-full">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Fotos e Descrição</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Seção 4: Fotos e Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                Fotos e Descrição
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Adicione fotos do seu veículo e uma descrição detalhada
              </p>
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

          {/* Botão de Publicação */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <Button
              onClick={handlePublicarAnuncio}
              disabled={
                loading ||
                loadingMercadoPago ||
                !formCompleted
              }
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 min-w-[280px] sm:min-w-[300px] text-base sm:text-lg"
              size="lg"
            >
              {loading || loadingMercadoPago ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                  <Car className="w-5 h-5 mr-2" />
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
        </div>
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