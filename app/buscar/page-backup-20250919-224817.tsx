'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SmartFilterInput } from '@/components/smart-filter-input'
import { DynamicVehicleFiltersFipe } from '@/components/dynamic-vehicle-filters-fipe'
import { 
  Car, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign,
  RefreshCw,
  Star
} from 'lucide-react'
import { Metadata } from 'next'

interface Veiculo {
  id: string
  marca: string
  modelo: string
  ano: number
  preco: number
  localizacao: string
  imagem: string
  destaque: boolean
  fipePrice?: number
}

export default function BuscarPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(false)
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    marca: '',
    veiculo: '',
    ano: '',
    modelo: '',
    precoMin: '',
    precoMax: '',
    localizacao: ''
  })

  // Dados de exemplo (em produção viria da API)
  useEffect(() => {
    setVeiculos([
      {
        id: '1',
        marca: 'Honda',
        modelo: 'Civic Sed LX 1.8 Aut 4p',
        ano: 2020,
        preco: 85000,
        localizacao: 'São Paulo, SP',
        imagem: '/placeholder-car.jpg',
        destaque: true,
        fipePrice: 82000
      },
      {
        id: '2',
        marca: 'Toyota',
        modelo: 'Corolla XEI 2.0 Flex 16V Aut',
        ano: 2019,
        preco: 75000,
        localizacao: 'Rio de Janeiro, RJ',
        imagem: '/placeholder-car.jpg',
        destaque: false,
        fipePrice: 78000
      },
      {
        id: '3',
        marca: 'Volkswagen',
        modelo: 'Golf 1.4 TSI Highline',
        ano: 2021,
        preco: 95000,
        localizacao: 'Belo Horizonte, MG',
        imagem: '/placeholder-car.jpg',
        destaque: true,
        fipePrice: 92000
      }
    ])
  }, [])

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltrosAtivos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const limparFiltros = () => {
    setFiltrosAtivos({
      marca: '',
      veiculo: '',
      ano: '',
      modelo: '',
      precoMin: '',
      precoMax: '',
      localizacao: ''
    })
  }

  const buscarVeiculos = () => {
    setLoading(true)
    // Simular busca
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco)
  }

  const calcularDiferencaFipe = (preco: number, fipePrice?: number) => {
    if (!fipePrice) return null
    const diferenca = preco - fipePrice
    const percentual = (diferenca / fipePrice) * 100
    return { diferenca, percentual }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buscar Veículos
          </h1>
          <p className="text-gray-600">
            Encontre o veículo ideal usando nossos filtros inteligentes
          </p>
        </div>

        <Tabs defaultValue="filtros" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="filtros" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </TabsTrigger>
            <TabsTrigger value="fipe" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Busca por FIPE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filtros" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Marca */}
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input
                      placeholder="Ex: Honda, Toyota, Volkswagen"
                      value={filtrosAtivos.marca}
                      onChange={(e) => handleFiltroChange('marca', e.target.value)}
                    />
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input
                      placeholder="Ex: Civic, Corolla, Golf"
                      value={filtrosAtivos.modelo}
                      onChange={(e) => handleFiltroChange('modelo', e.target.value)}
                    />
                  </div>

                  {/* Ano */}
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 2020"
                      value={filtrosAtivos.ano}
                      onChange={(e) => handleFiltroChange('ano', e.target.value)}
                    />
                  </div>

                  {/* Preço Mínimo */}
                  <div className="space-y-2">
                    <Label>Preço Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 50000"
                      value={filtrosAtivos.precoMin}
                      onChange={(e) => handleFiltroChange('precoMin', e.target.value)}
                    />
                  </div>

                  {/* Preço Máximo */}
                  <div className="space-y-2">
                    <Label>Preço Máximo</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 100000"
                      value={filtrosAtivos.precoMax}
                      onChange={(e) => handleFiltroChange('precoMax', e.target.value)}
                    />
                  </div>

                  {/* Localização */}
                  <div className="space-y-2">
                    <Label>Localização</Label>
                    <Input
                      placeholder="Ex: São Paulo, SP"
                      value={filtrosAtivos.localizacao}
                      onChange={(e) => handleFiltroChange('localizacao', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={buscarVeiculos} disabled={loading} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Buscando...' : 'Buscar Veículos'}
                  </Button>
                  <Button variant="outline" onClick={limparFiltros}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fipe" className="space-y-6">
            <DynamicVehicleFiltersFipe
              onSelectionComplete={(selection) => {
                console.log('Seleção FIPE:', selection)
                // Aqui você pode implementar a busca baseada na seleção FIPE
              }}
              showFipePrice={true}
            />
          </TabsContent>
        </Tabs>

        {/* Resultados */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Resultados ({veiculos.length} veículos encontrados)
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Mais Recentes
              </Button>
              <Button variant="outline" size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Menor Preço
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {veiculos.map((veiculo) => {
              const diferencaFipe = calcularDiferencaFipe(veiculo.preco, veiculo.fipePrice)
              
              return (
                <Card key={veiculo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {veiculo.destaque && (
                    <div className="bg-yellow-500 text-white px-3 py-1 text-sm font-medium flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Destaque
                    </div>
                  )}
                  
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <Car className="h-16 w-16 text-gray-400" />
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {veiculo.ano}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {veiculo.localizacao}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">
                            {formatarPreco(veiculo.preco)}
                          </span>
                          {veiculo.fipePrice && (
                            <Badge variant="secondary" className="text-xs">
                              FIPE: {formatarPreco(veiculo.fipePrice)}
                            </Badge>
                          )}
                        </div>
                        
                        {diferencaFipe && (
                          <div className="text-sm">
                            {diferencaFipe.diferenca > 0 ? (
                              <span className="text-red-600">
                                +{formatarPreco(diferencaFipe.diferenca)} ({diferencaFipe.percentual.toFixed(1)}% acima da FIPE)
                              </span>
                            ) : (
                              <span className="text-green-600">
                                {formatarPreco(Math.abs(diferencaFipe.diferenca))} ({Math.abs(diferencaFipe.percentual).toFixed(1)}% abaixo da FIPE)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button className="w-full mt-4">
                        <Search className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}