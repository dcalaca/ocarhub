"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import Header from "@/components/header"

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
  const [suggestedVehicles, setSuggestedVehicles] = useState<Vehicle[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const vehicleId = params.id as string

  useEffect(() => {
    if (vehicleId) {
      loadVehicle()
      loadSuggestions()
    }
  }, [vehicleId])

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      console.log('🔍 Carregando sugestões de veículos...')
      
      // Buscar veículos similares (mesma marca ou modelo)
      const suggestions = await VehicleService.searchVehicles({
        status: 'ativo'
      })
      
      // Filtrar o veículo atual e limitar a 4 sugestões
      const filteredSuggestions = suggestions
        .filter(v => v.id !== vehicleId)
        .slice(0, 4)
      
      console.log('✅ Sugestões carregadas:', filteredSuggestions)
      setSuggestedVehicles(filteredSuggestions)
    } catch (error) {
      console.error('❌ Erro ao carregar sugestões:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-video bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Veículo não encontrado</h1>
          <p className="text-muted-foreground mb-6">Este anúncio pode ter sido removido ou não existe.</p>
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
    <div className="min-h-screen bg-background">
      {/* Header Oficial */}
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-card border-b">
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
              <Badge 
                className={vehicle.status === 'ativo' 
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' 
                  : 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                }
              >
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
            <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
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
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {vehicle.marca} {vehicle.modelo} {vehicle.versao}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {vehicle.ano} • {vehicle.cor} • {formatMileage(vehicle.quilometragem)}
              </p>
              
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-4xl font-bold text-primary">
                  {formatPrice(vehicle.preco)}
                </div>
              </div>
              
              {/* Valor FIPE destacado */}
              {vehicle.fipe && (
                <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Valor FIPE:</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(vehicle.fipe)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preço de referência da tabela FIPE
                  </p>
                </div>
              )}
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
              <h3 className="text-lg font-semibold mb-4 text-foreground">Informações do Veículo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ano:</span>
                  <span className="font-medium text-foreground">{vehicle.ano}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Quilometragem:</span>
                  <span className="font-medium text-foreground">{formatMileage(vehicle.quilometragem)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Combustível:</span>
                  <span className="font-medium text-foreground">{vehicle.combustivel?.join(', ') || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Câmbio:</span>
                  <span className="font-medium text-foreground">{vehicle.cambio || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Localização:</span>
                  <span className="font-medium text-foreground">{vehicle.cidade}, {vehicle.estado}</span>
                </div>
                
                {vehicle.placa_parcial && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Placa:</span>
                    <span className="font-medium text-foreground">{vehicle.placa_parcial}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Descrição */}
            {vehicle.observacoes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.observacoes}</p>
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
        
        {/* Sugestões de Anúncios */}
        {suggestedVehicles.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Sugestões para você</h2>
              <Button 
                variant="outline" 
                onClick={() => router.push('/buscar')}
              >
                Ver todos
              </Button>
            </div>
            
            {loadingSuggestions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedVehicles.map((suggestion) => (
                  <Card key={suggestion.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                    <Link href={`/veiculo/${suggestion.id}`}>
                      <CardHeader className="p-0">
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          <Image
                            src={suggestion.fotos && suggestion.fotos.length > 0 ? suggestion.fotos[0] : '/placeholder-car.jpg'}
                            alt={`${suggestion.marca} ${suggestion.modelo}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">
                          {suggestion.marca} {suggestion.modelo}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.ano} • {suggestion.cor} • {formatMileage(suggestion.quilometragem)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(suggestion.preco)}
                          </span>
                          {suggestion.fipe && (
                            <span className="text-sm text-muted-foreground">
                              FIPE: {formatPrice(suggestion.fipe)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
