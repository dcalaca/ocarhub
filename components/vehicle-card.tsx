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
import React, { useCallback, useMemo, useState, useEffect } from "react"

interface VehicleCardProps {
  vehicle: Vehicle
  className?: string
  showRemoveFromFavorites?: boolean
  onFavoriteUpdate?: () => void
}

const VehicleCard = React.memo(function VehicleCard({ vehicle, className, showRemoveFromFavorites, onFavoriteUpdate }: VehicleCardProps) {
  const { user, toggleFavorito, isFavorito, toggleCurtida, isCurtido } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Estados locais otimizados
  const [isCurrentlyFavorited, setIsCurrentlyFavorited] = useState(false)
  const [isCurrentlyLiked, setIsCurrentlyLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(vehicle.likes || 0)

  // Memoizar valores computados para evitar recálculos desnecessários
  const isFavorited = useMemo(() => user ? isFavorito(vehicle.id) : false, [user, vehicle.id, isFavorito])
  const isLiked = useMemo(() => user ? isCurtido(vehicle.id) : false, [user, vehicle.id, isCurtido])
  const formattedPrice = useMemo(() => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(vehicle.preco), 
    [vehicle.preco]
  )

  // Consolidar todos os useEffects em um único efeito otimizado
  useEffect(() => {
    setIsCurrentlyFavorited(isFavorited)
    setIsCurrentlyLiked(isLiked)
    setLocalLikes(vehicle.likes || 0)
  }, [isFavorited, isLiked, vehicle.likes])

  // Memoizar callbacks para evitar re-criações desnecessárias
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({ 
        title: "Login Necessário", 
        description: "Faça login para favoritar veículos.", 
        variant: "destructive" 
      })
      router.push("/login")
      return
    }

    try {
      const newFavoriteState = !isCurrentlyFavorited
      await toggleFavorito(vehicle.id)
      setIsCurrentlyFavorited(newFavoriteState)
      
      toast({
        title: newFavoriteState ? "Adicionado aos Favoritos" : "Removido dos Favoritos",
        description: `${vehicle.marca} ${vehicle.modelo} foi ${
          newFavoriteState ? "adicionado à sua lista" : "removido da sua lista"
        }.`,
      })
      
      onFavoriteUpdate?.()
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive"
      })
    }
  }, [user, isCurrentlyFavorited, vehicle.id, vehicle.marca, vehicle.modelo, toggleFavorito, toast, router, onFavoriteUpdate])

  const handleToggleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({ 
        title: "Login Necessário", 
        description: "Faça login para curtir veículos.", 
        variant: "destructive" 
      })
      router.push("/login")
      return
    }

    try {
      const newLikedState = !isCurrentlyLiked
      await toggleCurtida(vehicle.id)
      
      setIsCurrentlyLiked(newLikedState)
      setLocalLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))

      toast({
        title: newLikedState ? "Veículo Curtido!" : "Curtida Removida",
        description: `Você ${newLikedState ? "curtiu" : "removeu a curtida de"} ${vehicle.marca} ${vehicle.modelo}.`,
      })
    } catch (error) {
      console.error('Erro ao curtir:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a curtida.",
        variant: "destructive"
      })
    }
  }, [user, isCurrentlyLiked, vehicle.id, vehicle.marca, vehicle.modelo, toggleCurtida, toast, router])

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const shareUrl = `${window.location.origin}/veiculo/${vehicle.id}`
    const shareText = `Confira este ${vehicle.marca} ${vehicle.modelo} por ${formattedPrice} na Ocar! ${shareUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${vehicle.marca} ${vehicle.modelo} na Ocar`,
          text: `Confira este ${vehicle.marca} ${vehicle.modelo} que encontrei na Ocar!`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Link Copiado!",
          description: "Link e informações do veículo copiados para a área de transferência.",
        })
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error('Erro ao compartilhar:', error)
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar o veículo.",
          variant: "destructive",
        })
      }
    }
  }, [vehicle.id, vehicle.marca, vehicle.modelo, formattedPrice, toast])

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
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            <p className="text-xl md:text-2xl font-bold text-purple-700 mb-2 md:mb-3">{formattedPrice}</p>

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
})

export { VehicleCard }
