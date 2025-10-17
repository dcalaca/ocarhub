"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Vehicle } from "@/types"
import { Header } from "@/components/header"
import { VehicleCard } from "@/components/vehicle-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Importado para "Termo de Busca"
import { Car, Shield, TrendingUp, MessageCircle, Search, ListFilter } from "lucide-react" // Adicionado ListFilter para Busca Avançada
import { VehiclesService } from "@/lib/vehicles-service"
import { useNavigation } from "@/hooks/use-navigation"
import Link from "next/link"

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { navigateToSearch, navigateToPath } = useNavigation()

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      console.log('🔍 Carregando veículos da página inicial...')
      
      // Buscar veículos em destaque (otimizado)
      const featuredData = await VehiclesService.getVehicles({
        status: 'ativo',
        plano: 'destaque',
        limit: 6
      })
      
      // Ordenar por data de criação
      const featured = featuredData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
      
      // Buscar veículos recentes (otimizado)
      const recentData = await VehiclesService.getVehicles({
        status: 'ativo',
        limit: 6
      })
      
      const recent = recentData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
      
      setFeaturedVehicles(featured)
      setRecentVehicles(recent)
      console.log(`✅ ${featured.length} veículos em destaque e ${recent.length} veículos recentes carregados`)
    } catch (error) {
      console.error('❌ Erro ao carregar veículos:', error)
      setFeaturedVehicles([])
      setRecentVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSearch = () => {
    if (searchTerm.trim()) {
      navigateToSearch({ term: searchTerm.trim() })
    }
  }

  const handleAdvancedSearchClick = () => {
    // Navega para a página de busca, que deve ter os filtros avançados
    navigateToPath("/buscar")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 text-white py-20 md:py-32 content-with-header">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg font-poppins">Encontre o carro dos seus sonhos</h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-10 md:mb-12 font-poppins">
            A plataforma mais moderna para comprar e vender veículos
          </p>

          {/* Busca Rápida - Conforme a última imagem */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 rounded-xl shadow-2xl font-poppins">
            <h2 className="text-2xl font-semibold mb-4 text-white">Busca Rápida</h2>
            <p className="text-purple-200 mb-5 text-sm">Digite o nome da marca ou modelo para buscar rapidamente</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="termo-busca" className="block text-sm font-medium text-purple-200 mb-1 text-left">
                  Termo de Busca
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    id="termo-busca"
                    placeholder="Ex: Toyota Corolla, Honda Civic..."
                    className="flex-grow bg-white/10 text-white placeholder-purple-200 border-white/20 focus:ring-2 focus:ring-purple-400 focus:border-transparent h-12 text-base font-poppins"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleQuickSearch()}
                  />
                  <Button
                    size="icon"
                    onClick={handleQuickSearch}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-12 w-12 flex-shrink-0 font-poppins"
                    aria-label="Buscar"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleAdvancedSearchClick}
                variant="outline"
                className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 h-12 text-base font-semibold font-poppins"
              >
                <ListFilter className="mr-2 h-5 w-5" />
                Busca Avançada
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seções de Veículos em Destaque e Recentes (sem alterações) */}
      {featuredVehicles.length > 0 && (
        <section className="py-16 font-poppins">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Veículos em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild className="font-poppins">
                <Link href="/buscar?plano=destaque">Ver todos os destaques</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30 font-poppins">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Anúncios Recentes</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-muted rounded-t-lg" />
                  <CardContent className="p-3">
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Nenhum anúncio recente encontrado.</p>
          )}
          <div className="text-center mt-8">
            <Button variant="outline" asChild className="font-poppins">
              <Link href="/buscar">Ver todos os recentes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Seções Diferenciais, CTA e Footer (sem alterações) */}
      <section className="py-16 font-poppins">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por que escolher a Ocar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Histórico Veicular", desc: "Verificação completa: multas, sinistros, leilões." },
              { icon: MessageCircle, title: "Chat em Tempo Real", desc: "Converse diretamente com vendedores." },
              { icon: TrendingUp, title: "Preço FIPE", desc: "Comparação com a FIPE para preços justos." },
            ].map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-purple-600 text-white font-poppins">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para anunciar seu veículo?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Cadastre seu anúncio gratuitamente e alcance milhares de compradores
          </p>
          <Button size="lg" variant="secondary" asChild className="bg-white text-purple-700 hover:bg-purple-50 font-poppins">
            <Link href="/anunciar" className="inline-flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Anunciar Agora
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 border-t border-gray-700 py-12 font-poppins">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="relative w-10 h-10">
                  <img src="/logo-ocar-v2.jpg" alt="Ocar Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-bold text-white">Ocar</span>
              </Link>
              <p className="text-sm">A plataforma mais moderna para comprar e vender veículos no Brasil.</p>
            </div>
            {[
              {
                title: "Comprar",
                links: [
                  { href: "/buscar", label: "Buscar veículos" },
                  { href: "/favoritos", label: "Favoritos" },
                  { href: "/financiamento", label: "Financiamento" },
                ],
              },
              {
                title: "Vender",
                links: [
                  { href: "/anunciar", label: "Anunciar" },
                  { href: "/planos", label: "Planos" },
                  { href: "/dicas", label: "Dicas de venda" },
                ],
              },
              {
                title: "Suporte",
                links: [
                  { href: "/ajuda", label: "Central de ajuda" },
                  { href: "/contato", label: "Contato" },
                  { href: "/termos", label: "Termos de uso" },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-white text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Ocar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
