"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { OpcionaisSelector } from "@/components/opcionais-selector"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { VehicleService } from "@/lib/vehicle-service"
import { ImageUploadService } from "@/lib/image-upload-service"
import { cores, combustiveis } from "@/lib/data/filters"
import {
  Car,
  Save,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Camera,
  MapPin,
  DollarSign,
  Gauge,
  Palette,
  Fuel,
  Settings,
  X,
  Plus,
  Upload,
} from "lucide-react"
import Link from "next/link"

export default function EditarAnuncioPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Estados do veículo
  const [vehicleData, setVehicleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Campos editáveis
  const [price, setPrice] = useState("")
  const [mileage, setMileage] = useState("")
  const [color, setColor] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [transmission, setTransmission] = useState("")
  const [motor, setMotor] = useState("")
  const [opcionais, setOpcionais] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [state, setState] = useState("")
  const [observations, setObservations] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  // Funções para gerenciar fotos
  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)
    
    try {
      const newPhotos: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            title: "Arquivo muito grande",
            description: `A foto ${file.name} é muito grande. Máximo 5MB.`,
            variant: "destructive",
          })
          continue
        }

        const photoUrl = await ImageUploadService.uploadImage(file, vehicleData?.id || 'temp')
        newPhotos.push(photoUrl)
      }

      setPhotos(prev => [...prev, ...newPhotos])
      
      toast({
        title: "Fotos adicionadas",
        description: `${newPhotos.length} foto(s) adicionada(s) com sucesso`,
      })
    } catch (error) {
      console.error('Erro ao fazer upload das fotos:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload das fotos",
        variant: "destructive",
      })
    } finally {
      setUploadingPhotos(false)
    }
  }

  // Funções de formatação
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número ou vírgula
    const numericValue = value.replace(/[^\d,]/g, '')
    if (!numericValue) return ''
    
    // Se tem vírgula, trata como decimal
    if (numericValue.includes(',')) {
      const parts = numericValue.split(',')
      const integerPart = parts[0].replace(/\D/g, '')
      const decimalPart = parts[1] ? parts[1].slice(0, 2) : ''
      
      if (!integerPart) return ''
      
      const number = parseFloat(`${integerPart}.${decimalPart}`)
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: decimalPart ? decimalPart.length : 0,
        maximumFractionDigits: 2
      }).format(number)
    }
    
    // Sem vírgula, trata como inteiro
    const number = parseInt(numericValue)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number)
  }

  const formatMileage = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return ''
    
    // Formata com pontos como separadores de milhares
    const number = parseInt(numericValue)
    return new Intl.NumberFormat('pt-BR').format(number)
  }

  const formatPriceForDisplay = (value: string) => {
    if (!value) return ''
    
    // Se já tem formatação, retorna como está
    if (value.includes('R$')) return value
    
    // Se tem vírgula, formata como decimal
    if (value.includes(',')) {
      const parts = value.split(',')
      const integerPart = parts[0].replace(/\D/g, '')
      const decimalPart = parts[1] ? parts[1].slice(0, 2) : ''
      
      if (!integerPart) return value
      
      const number = parseFloat(`${integerPart}.${decimalPart}`)
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: decimalPart ? decimalPart.length : 0,
        maximumFractionDigits: 2
      }).format(number)
    }
    
    // Se é só número, formata como inteiro
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return value
    
    const number = parseInt(numericValue)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number)
  }

  const parsePriceForSave = (value: string) => {
    if (!value) return ''
    
    // Remove formatação e mantém apenas números e vírgula
    const cleanValue = value.replace(/[^\d,]/g, '')
    
    // Se tem vírgula, converte para ponto para salvar no banco
    if (cleanValue.includes(',')) {
      return cleanValue.replace(',', '.')
    }
    
    return cleanValue
  }

  const parseMileage = (formattedValue: string) => {
    // Remove pontos, mantém apenas números
    return formattedValue.replace(/[^\d]/g, '')
  }

  // Carregar dados do veículo
  useEffect(() => {
    const vehicleId = searchParams.get('id')
    if (vehicleId) {
      loadVehicleData(vehicleId)
    } else {
      toast({
        title: "Erro",
        description: "ID do veículo não fornecido.",
        variant: "destructive",
      })
      router.push('/meus-anuncios')
    }
  }, [searchParams, router, toast])

  const loadVehicleData = async (vehicleId: string) => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados do veículo:', vehicleId)
      
      const vehicle = await VehicleService.getVehicleById(vehicleId)
      
      if (vehicle) {
        setVehicleData(vehicle)
        // Preencher apenas campos editáveis
        setPrice(vehicle.preco ? formatPriceForDisplay(vehicle.preco.toString()) : "")
        setMileage(vehicle.quilometragem?.toString() || "")
        setColor(vehicle.cor || "")
        setFuelType(vehicle.combustivel?.[0] || "")
        setTransmission(vehicle.cambio || "")
        setMotor(vehicle.motor || "")
        setOpcionais(vehicle.opcionais || [])
        setLocation(vehicle.cidade || "")
        setState(vehicle.estado || "")
        setObservations(vehicle.observacoes || "")
        setPhotos(Array.isArray(vehicle.fotos) ? vehicle.fotos : [])
        
        console.log('✅ Dados carregados com sucesso')
      } else {
        toast({
          title: "Erro",
          description: "Veículo não encontrado.",
          variant: "destructive",
        })
        router.push('/meus-anuncios')
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do veículo.",
        variant: "destructive",
      })
      router.push('/meus-anuncios')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!vehicleData) return

    try {
      setSaving(true)
      
      // Upload de fotos se houver novas
      let photoUrls = photos
      if (photos.length > 0 && photos.some(photo => photo.startsWith('blob:'))) {
        console.log('📸 Fazendo upload das fotos...')
        photoUrls = await ImageUploadService.uploadMultipleImages(photos)
      }

      // Atualizar apenas campos editáveis
      const updates = {
        preco: parseFloat(parsePriceForSave(price)),
        quilometragem: parseInt(mileage),
        cor: color,
        combustivel: [fuelType],
        cambio: transmission,
        motor: motor,
        opcionais: opcionais,
        cidade: location,
        estado: state,
        observacoes: observations,
        fotos: photoUrls,
        updated_at: new Date().toISOString()
      }

      await VehicleService.updateVehicle(vehicleData.id, updates)
      
      toast({
        title: "Sucesso",
        description: "Anúncio atualizado com sucesso!",
      })
      
      router.push('/meus-anuncios')
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados do veículo...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicleData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Veículo não encontrado.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/meus-anuncios">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Editar Anúncio</h1>
              <p className="text-muted-foreground">
                {vehicleData.marca} {vehicleData.modelo} {vehicleData.ano}
              </p>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Campos não editáveis:</strong> Marca, Modelo, Ano, Versão e Placa não podem ser alterados após a criação do anúncio.
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preço */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Preço *
                </Label>
                <Input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value)
                  }}
                  placeholder="Ex: R$ 45.000 ou R$ 45.000,50"
                />
              </div>

              {/* Quilometragem */}
              <div className="space-y-2">
                <Label htmlFor="mileage" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Quilometragem *
                </Label>
                <Input
                  id="mileage"
                  type="text"
                  value={formatMileage(mileage)}
                  onChange={(e) => {
                    const rawValue = parseMileage(e.target.value)
                    setMileage(rawValue)
                  }}
                  placeholder="Ex: 50.000"
                />
              </div>

              {/* Cor */}
              <div>
                <Label htmlFor="color" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor *
                </Label>
                <select
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                >
                  <option value="">Selecione a cor</option>
                  {cores.map((cor) => (
                    <option key={cor} value={cor}>
                      {cor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Combustível */}
              <div>
                <Label htmlFor="fuel" className="flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Combustível *
                </Label>
                <select
                  id="fuel"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                >
                  <option value="">Selecione o combustível</option>
                  {combustiveis.map((combustivel) => (
                    <option key={combustivel} value={combustivel}>
                      {combustivel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Câmbio */}
              <div>
                <Label htmlFor="transmission">Câmbio *</Label>
                <select
                  id="transmission"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background text-foreground border-input"
                >
                  <option value="">Selecione o câmbio</option>
                  <option value="Manual">Manual</option>
                  <option value="Automático">Automático</option>
                  <option value="CVT">CVT</option>
                  <option value="Semi-automático">Semi-automático</option>
                </select>
              </div>

              {/* Motor */}
              <div>
                <Label htmlFor="motor">Motor</Label>
                <Input
                  id="motor"
                  value={motor}
                  onChange={(e) => setMotor(e.target.value)}
                  placeholder="Ex: 1.6 Flex"
                />
              </div>
            </CardContent>
          </Card>

          {/* Localização e Detalhes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização e Detalhes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cidade */}
              <div>
                <Label htmlFor="location">Cidade *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Paulo"
                />
              </div>

              {/* Estado */}
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Ex: SP"
                />
              </div>

              {/* Opcionais */}
              <div>
                <Label>Opcionais</Label>
                <OpcionaisSelector
                  onOpcionaisChange={setOpcionais}
                  onCarroceriaChange={() => {}}
                  onTipoVendedorChange={() => {}}
                  onCaracteristicasChange={() => {}}
                  onBlindagemChange={() => {}}
                  onLeilaoChange={() => {}}
                  initialValues={{
                    opcionais: opcionais
                  }}
                />
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais sobre o veículo..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fotos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Fotos do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Fotos do veículo</h3>
                  <p className="text-xs text-muted-foreground">Fotos atuais do anúncio</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {photos.length} fotos
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddPhotos}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploadingPhotos}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhotos}
                    className="flex items-center gap-1"
                  >
                    {uploadingPhotos ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Adicionar
                  </Button>
                </div>
              </div>
              
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md group">
                      <Image
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma foto disponível</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="mt-4"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Primeira Foto
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 mt-8">
          <Link href="/meus-anuncios">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button 
            onClick={handleSave} 
            disabled={saving || !price || !mileage || !color || !fuelType || !transmission || !location || !state}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
