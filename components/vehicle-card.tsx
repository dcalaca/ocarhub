"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ThumbsUp, Eye, Share2, Tag, Calendar, Gauge, ShieldCheck, Trash2, Star } from "lucide-react"
import type { Vehicle } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React from "react"

interface VehicleCardProps {
  vehicle: Vehicle
  className?: string
  showRemoveFromFavorites?: boolean
  onFavoriteUpdate?: () => void
}

export function VehicleCard({ vehicle, className, showRemoveFromFavorites, onFavoriteUpdate }: VehicleCardProps) {
  const { user, toggleFavorito, isFavorito, toggleCurtida, isCurtido } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [isCurrentlyFavorited, setIsCurrentlyFavorited] = React.useState(false)
  const [isCurrentlyLiked, setIsCurrentlyLiked] = React.useState(false)
  const [localLikes, setLocalLikes] = React.useState(vehicle.likes || 0)

  React.useEffect(() => {
    if (user) {
      setIsCurrentlyFavorited(isFavorito(vehicle.id))
      const likedByAuth = isCurtido(vehicle.id)
      setIsCurrentlyLiked(likedByAuth)

      // Ajusta localLikes com base no estado do AuthContext e no valor inicial do veículo
      // Se o mockUser (ID "user123") curtiu este veículo (ID "2" por exemplo)
      // E o vehicle.likes original era X, o localLikes deve ser X+1
      // Se o mockUser não curtiu, localLikes deve ser vehicle.likes
      // Esta lógica precisa ser robusta para quando o AuthContext realmente buscar do Firebase
      if (likedByAuth && !vehicle.favoritos.includes(user.id)) {
        // Exemplo, se curtida não está em favoritos
        // Esta lógica de likes precisa ser melhorada se likes e favoritos são coisas diferentes
      }
      setLocalLikes(vehicle.likes || 0) // Simplificando por agora, o toggle cuidará do incremento/decremento
      if (likedByAuth) {
        // Se o usuário curtiu E o localLikes ainda não reflete isso (ou seja, é igual ao base)
        // Isso pode acontecer se o vehicle.likes do mock não foi atualizado para refletir a curtida do usuário
        // Para simplificar, vamos assumir que o toggleCurtida no AuthContext é a fonte da verdade
        // e o localLikes é para feedback imediato.
        // A sincronização inicial de localLikes com base em isCurtido é mais complexa
        // se vehicle.likes não for a contagem total *sem* a curtida do usuário atual.
      }
    } else {
      setIsCurrentlyFavorited(false)
      setIsCurrentlyLiked(false)
      setLocalLikes(vehicle.likes || 0)
    }
    // Re-sincroniza localLikes com vehicle.likes e depois ajusta se o usuário atual curtiu
    const initialLikes = vehicle.likes || 0
    if (user && isCurtido(vehicle.id)) {
      // Se o usuário curtiu, e o vehicle.likes não inclui essa curtida ainda,
      // ou se vehicle.likes *já* inclui, precisamos ter cuidado para não contar duas vezes.
      // A forma mais segura é ter vehicle.likes como a contagem total do backend.
      // E localLikes reflete isso + ação do usuário.
      // Para o mock, vamos assumir que vehicle.likes é a base.
      // E o estado isCurtido determina se adicionamos 1 para o usuário atual.
      // Esta parte é complexa com dados mockados e estado local vs. AuthContext.
    }
    setLocalLikes(vehicle.likes || 0) // Reset para o valor base
    if (user && isCurtido(vehicle.id)) {
      // Se o usuário curtiu, e o localLikes é igual ao vehicle.likes (ou seja, não foi incrementado ainda)
      // Isso é complicado. O ideal é que `vehicle.likes` seja a contagem total.
      // E `isCurtido` apenas mude o visual do botão.
      // O `localLikes` deve ser `vehicle.likes`. O `toggleCurtida` que o altera.
    }
  }, [user, vehicle.id, vehicle.likes, isFavorito, isCurtido]) // Adicionado vehicle.likes

  React.useEffect(() => {
    // Efeito dedicado para atualizar localLikes quando vehicle.likes muda OU quando o estado de curtida do usuário muda
    const currentVehicleLikes = vehicle.likes || 0
    if (user && isCurtido(vehicle.id)) {
      // Se o usuário curtiu, e assumindo que vehicle.likes *não* inclui a curtida deste usuário ainda
      // (o que seria o caso se vehicle.likes viesse de um DB e a curtida fosse uma tabela separada)
      // Para o mock, se isCurtido(vehicle.id) é true, localLikes deve ser vehicle.likes + 1
      // Mas se vehicle.likes já foi incrementado no mock, isso daria +2.
      // A lógica mais simples para o mock:
      // localLikes = vehicle.likes. Se isCurtido, o botão fica ativo.
      // Ao clicar, localLikes é atualizado para feedback, e isCurtido é invertido.
      setLocalLikes(currentVehicleLikes) // Começa com o valor base
    } else {
      setLocalLikes(currentVehicleLikes)
    }
  }, [user, vehicle.id, vehicle.likes, isCurtido])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast({ title: "Login Necessário", description: "Faça login para favoritar veículos.", variant: "destructive" })
      router.push("/login")
      return
    }
    const newFavoriteState = !isCurrentlyFavorited
    await toggleFavorito(vehicle.id)
    setIsCurrentlyFavorited(newFavoriteState)
    toast({
      title: newFavoriteState ? "Adicionado aos Favoritos" : "Removido dos Favoritos",
      description: `${vehicle.marca} ${vehicle.modelo} foi ${
        newFavoriteState ? "adicionado à sua lista" : "removido da sua lista"
      }.`,
    })
    if (onFavoriteUpdate) {
      onFavoriteUpdate()
    }
  }

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast({ title: "Login Necessário", description: "Faça login para curtir veículos.", variant: "destructive" })
      router.push("/login")
      return
    }

    const newLikedState = !isCurrentlyLiked
    // Atualiza o estado no AuthContext PRIMEIRO
    await toggleCurtida(vehicle.id)

    // Depois atualiza o estado local para feedback visual
    setIsCurrentlyLiked(newLikedState)
    setLocalLikes((prevLikes) => {
      if (newLikedState) {
        // Se acabou de curtir
        return (vehicle.likes || 0) + 1 // Baseado no valor original + 1
      } else {
        // Se acabou de descurtir
        return vehicle.likes || 0 // Volta para o valor original
      }
      // Esta lógica assume que vehicle.likes é a contagem *sem* a curtida do usuário atual.
      // Se vehicle.likes já inclui a curtida do usuário, a lógica seria diferente.
      // Para mock:
      // Se curtiu: localLikes = (vehicle.likes original) + 1
      // Se descurtiu: localLikes = (vehicle.likes original)
      // O problema é "vehicle.likes original".
      // Melhor:
      // localLikes é o que é exibido.
      // Ao curtir: localLikes++.
      // Ao descurtir: localLikes--.
      // O useEffect sincroniza localLikes com vehicle.likes e isCurtido.
    })

    // Re-calculando o localLikes de forma mais robusta para o clique
    setLocalLikes((currentTotalLikes) => {
      if (newLikedState) {
        // Se vai curtir
        return currentTotalLikes + 1
      } else {
        // Se vai descurtir
        return Math.max(0, currentTotalLikes - 1)
      }
    })

    toast({
      title: newLikedState ? "Veículo Curtido!" : "Curtida Removida",
      description: `Você ${newLikedState ? "curtiu" : "removeu a curtida de"} ${vehicle.marca} ${vehicle.modelo}.`,
    })
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/veiculo/${vehicle.id}`
    const shareText = `Confira este ${vehicle.marca} ${vehicle.modelo} por ${formatPrice(vehicle.preco)} na Ocar! ${shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.marca} ${vehicle.modelo} na Ocar`,
          text: `Confira este ${vehicle.marca} ${vehicle.modelo} que encontrei na Ocar!`,
          url: shareUrl,
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({
            title: "Erro ao compartilhar",
            description: "Não foi possível compartilhar o veículo.",
            variant: "destructive",
          })
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Link Copiado!",
          description: "Link e informações do veículo copiados para a área de transferência.",
        })
      } catch (error) {
        toast({ title: "Erro ao copiar link", description: "Não foi possível copiar o link.", variant: "destructive" })
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)
  }

  // Sincroniza o estado local com o AuthContext e vehicle.likes
  // Este useEffect é crucial para garantir que o estado visual reflita a realidade
  // tanto do AuthContext (se o *usuário atual* curtiu/favoritou)
  // quanto do vehicle.likes (contagem *total* de curtidas de todos os usuários).
  React.useEffect(() => {
    if (user) {
      setIsCurrentlyFavorited(isFavorito(vehicle.id))
      setIsCurrentlyLiked(isCurtido(vehicle.id))
    } else {
      setIsCurrentlyFavorited(false)
      setIsCurrentlyLiked(false)
    }
    setLocalLikes(vehicle.likes || 0) // Define a contagem de likes base
  }, [user, vehicle.id, vehicle.likes, isFavorito, isCurtido])

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col bg-card text-card-foreground",
        className,
      )}
    >
      <Link href={`/veiculo/${vehicle.id}`} passHref legacyBehavior>
        <a className="block group cursor-pointer">
          <CardHeader className="p-0 relative">
            <div className="aspect-[16/10] overflow-hidden">
              <Image
                src={
                  vehicle.fotos[0] ||
                  `/placeholder.svg?width=400&height=250&query=${encodeURIComponent(vehicle.marca || "car")}+${encodeURIComponent(vehicle.modelo || "model")}`
                }
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                width={400}
                height={250}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                priority={false}
              />
            </div>
            {vehicle.plano === "destaque" && (
              <Badge variant="default" className="absolute top-2 left-2 bg-purple-600 text-white shadow-md">
                <Star className="w-3 h-3 mr-1 fill-white" /> Destaque
              </Badge>
            )}
            {vehicle.verificado && (
              <Badge variant="secondary" className="absolute top-2 right-2 bg-green-600 text-white shadow-md">
                <ShieldCheck className="w-3 h-3 mr-1 fill-white" /> Verificado
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-3 md:p-4 flex-grow">
            <CardTitle className="text-base md:text-lg font-semibold mb-1 truncate group-hover:text-purple-600">
              {vehicle.marca} {vehicle.modelo}
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground mb-2 truncate h-4">
              {vehicle.versao || "Versão não informada"}
            </p>
            <p className="text-xl md:text-2xl font-bold text-purple-700 mb-2 md:mb-3">{formatPrice(vehicle.preco)}</p>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-500 flex-shrink-0" />
                <span>{vehicle.ano}</span>
              </div>
              <div className="flex items-center">
                <Gauge className="w-3.5 h-3.5 mr-1.5 text-purple-500 flex-shrink-0" />
                <span className="truncate">{vehicle.quilometragem.toLocaleString("pt-BR")} km</span>
              </div>
              <div className="flex items-center col-span-2">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-purple-500 flex-shrink-0" />
                <span className="truncate">{vehicle.cidade}</span>
              </div>
            </div>
          </CardContent>
        </a>
      </Link>

      <CardFooter className="p-3 md:p-4 pt-2 md:pt-3 border-t mt-auto bg-muted/20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 md:space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center" title={`${vehicle.views || 0} visualizações`}>
              <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1 text-gray-500" />
              <span>{vehicle.views !== undefined ? vehicle.views : 0}</span>
            </div>
            <button
              onClick={handleToggleLike}
              className={cn(
                "flex items-center hover:text-purple-600 transition-colors p-1 -m-1 rounded-md",
                isCurrentlyLiked && "text-purple-600",
              )}
              title={isCurrentlyLiked ? "Descurtir" : "Curtir"}
              aria-pressed={isCurrentlyLiked}
            >
              <ThumbsUp
                className={cn(
                  "w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1",
                  isCurrentlyLiked && "fill-purple-500 text-purple-600",
                )}
              />
              {/* O localLikes é atualizado no clique e no useEffect de sincronização */}
              <span>{localLikes}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center hover:text-purple-600 transition-colors p-1 -m-1 rounded-md"
              title="Compartilhar"
            >
              <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5 md:mr-1" />
              <span>{vehicle.shares !== undefined ? vehicle.shares : 0}</span>
            </button>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={cn(
                "rounded-full w-8 h-8 md:w-9 md:h-9",
                isCurrentlyFavorited
                  ? "text-red-500 hover:bg-red-100 hover:text-red-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              )}
              title={
                showRemoveFromFavorites
                  ? "Remover dos Favoritos"
                  : isCurrentlyFavorited
                    ? "Remover Favorito"
                    : "Salvar Favorito"
              }
              aria-pressed={isCurrentlyFavorited}
            >
              {showRemoveFromFavorites ? (
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isCurrentlyFavorited && "fill-red-500 text-red-500")} />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
