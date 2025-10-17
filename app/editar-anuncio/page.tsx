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

  // Funções de formatação
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return ''
    
    // Converte para número e formata como moeda brasileira
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

  const parseCurrency = (formattedValue: string) => {
    // Remove símbolos de moeda e espaços, mantém apenas números
    return formattedValue.replace(/[^\d]/g, '')
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
        preco: parseFloat(price),
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
            <CardContent className="space-y-4">
              {/* Preço */}
              <div>
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Preço *
                </Label>
                <Input
                  id="price"
                  type="text"
                  value={formatCurrency(price)}
                  onChange={(e) => {
                    const rawValue = parseCurrency(e.target.value)
                    setPrice(rawValue)
                  }}
                  placeholder="Ex: R$ 45.000"
                />
              </div>

              {/* Quilometragem */}
              <div>
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
                  className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
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
                  selected={opcionais}
                  onSelectionChange={setOpcionais}
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
                <div className="text-xs text-muted-foreground">
                  {photos.length} fotos
                </div>
              </div>
              
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma foto disponível</p>
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
