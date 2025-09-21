"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { VehicleService } from "@/lib/vehicle-service"
import { Vehicle } from "@/types"
import { 
  Heart, 
  Share2, 
  ThumbsUp, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings,
  Phone,
  MessageCircle,
  ArrowLeft,
  Star,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, toggleFavorito, toggleCurtida } = useAuth()
  const { toast } = useToast()
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [views, setViews] = useState(0)

  const vehicleId = params.id as string

  useEffect(() => {
    if (vehicleId) {
      loadVehicle()
    }
  }, [vehicleId])

  const loadVehicle = async () => {
    try {
      setLoading(true)
      console.log('🔍 Carregando veículo:', vehicleId)
      
      const vehicleData = await VehicleService.getVehicleById(vehicleId)
      console.log('✅ Veículo carregado:', vehicleData)
      
      if (vehicleData) {
        setVehicle(vehicleData)
        setViews(vehicleData.views || 0)
        
        // Verificar se está favoritado e curtido
        if (user) {
          setIsFavorited(user.favoritos?.includes(vehicleId) || false)
          setIsLiked(user.curtidas?.includes(vehicleId) || false)
        }
        
        // Incrementar visualizações
        await VehicleService.incrementViews(vehicleId)
        setViews(prev => prev + 1)
      } else {
        toast({
          title: "Veículo não encontrado",
          description: "Este anúncio pode ter sido removido ou não existe.",
          variant: "destructive",
        })
        router.push('/buscar')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar veículo:', error)
      toast({
        title: "Erro ao carregar veículo",
        description: "Não foi possível carregar os detalhes do veículo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar veículos.",
        variant: "destructive",
      })
      return
    }

    try {
      await toggleFavorito(vehicleId)
      setIsFavorited(!isFavorited)
      toast({
        title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: isFavorited 
          ? "Veículo removido da sua lista de favoritos." 
          : "Veículo adicionado à sua lista de favoritos.",
      })
    } catch (error) {
      console.error('❌ Erro ao favoritar:', error)
      toast({
        title: "Erro ao favoritar",
        description: "Não foi possível favoritar este veículo.",
        variant: "destructive",
      })
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir veículos.",
        variant: "destructive",
      })
      return
    }

    try {
      await toggleCurtida(vehicleId)
      setIsLiked(!isLiked)
      toast({
        title: isLiked ? "Curtida removida" : "Curtida adicionada",
        description: isLiked 
          ? "Você removeu a curtida deste veículo." 
          : "Você curtiu este veículo!",
      })
    } catch (error) {
      console.error('❌ Erro ao curtir:', error)
      toast({
        title: "Erro ao curtir",
        description: "Não foi possível curtir este veículo.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copiado!",
        description: "O link do veículo foi copiado para a área de transferência.",
      })
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error)
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-video bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-video bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Veículo não encontrado</h1>
          <p className="text-gray-600 mb-6">Este anúncio pode ter sido removido ou não existe.</p>
          <Button onClick={() => router.push('/buscar')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para busca
          </Button>
        </div>
      </div>
    )
  }

  const images = vehicle.fotos && vehicle.fotos.length > 0 ? vehicle.fotos : ['/placeholder-car.jpg']
  const currentImage = images[currentImageIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {views} visualizações
              </Badge>
              <Badge variant={vehicle.status === 'ativo' ? 'default' : 'secondary'}>
                {vehicle.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={currentImage}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-video relative rounded overflow-hidden ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${vehicle.marca} ${vehicle.modelo} - Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Veículo */}
          <div className="space-y-6">
            {/* Título e Preço */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.marca} {vehicle.modelo} {vehicle.versao}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {vehicle.ano} • {vehicle.cor} • {formatMileage(vehicle.quilometragem)}
              </p>
              
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-4xl font-bold text-primary">
                  {formatPrice(vehicle.preco)}
                </div>
                {vehicle.fipe && (
                  <div className="text-sm text-gray-500">
                    <div className="text-xs text-gray-400">FIPE</div>
                    <div className="font-medium">{formatPrice(vehicle.fipe)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Interação */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleFavorite}
                variant={isFavorited ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favoritado' : 'Favoritar'}
              </Button>
              
              <Button 
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Curtido' : 'Curtir'}
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>

            {/* Informações Detalhadas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Veículo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Ano:</span>
                  <span className="font-medium">{vehicle.ano}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Quilometragem:</span>
                  <span className="font-medium">{formatMileage(vehicle.quilometragem)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Combustível:</span>
                  <span className="font-medium">{vehicle.combustivel?.join(', ') || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Câmbio:</span>
                  <span className="font-medium">{vehicle.cambio || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Localização:</span>
                  <span className="font-medium">{vehicle.cidade}, {vehicle.estado}</span>
                </div>
                
                {vehicle.placa_parcial && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Placa:</span>
                    <span className="font-medium">{vehicle.placa_parcial}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Descrição */}
            {vehicle.observacoes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Descrição</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{vehicle.observacoes}</p>
              </Card>
            )}

            {/* Botões de Contato */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Ver Telefone
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
