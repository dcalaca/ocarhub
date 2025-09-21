'use client'

import { useOcarFiltrosSimple } from '@/hooks/use-ocar-filtros-simple'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Car, 
  Filter, 
  RefreshCw, 
  Search,
  Calendar,
  DollarSign,
  Hash
} from 'lucide-react'
import { useState } from 'react'

export function OcarFiltrosWebmotors() {
  const {
    filtros,
    data,
    isLoading,
    error,
    setMarca,
    setModeloBase,
    setVersao,
    setAno,
    resetFiltros,
    hasResultados
  } = useOcarFiltrosSimple()

  const [showResultados, setShowResultados] = useState(false)

  const handleShowResultados = () => {
    setShowResultados(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatReferenceMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${monthNames[parseInt(monthNum) - 1]} de ${year}`
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Marca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Marca</label>
              <Select
                value={filtros.marca || 'all'}
                onValueChange={(value) => setMarca(value === 'all' ? null : value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {data?.marcas?.map((marca) => (
                    <SelectItem key={marca} value={marca}>
                      {marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Modelo</label>
              <Select
                value={filtros.modelo_base || 'all'}
                onValueChange={(value) => setModeloBase(value === 'all' ? null : value)}
                disabled={isLoading || !filtros.marca}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os modelos</SelectItem>
                  {data?.modelos?.map((modelo) => (
                    <SelectItem key={modelo} value={modelo}>
                      {modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Versão */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Versão</label>
              <Select
                value={filtros.versao || 'all'}
                onValueChange={(value) => setVersao(value === 'all' ? null : value)}
                disabled={isLoading || !filtros.modelo_base}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as versões</SelectItem>
                  {data?.versoes?.map((versao) => (
                    <SelectItem key={versao} value={versao}>
                      {versao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={filtros.ano?.toString() || 'all'}
                onValueChange={(value) => setAno(value === 'all' ? null : parseInt(value))}
                disabled={isLoading || !filtros.versao}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {data?.anos?.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleShowResultados}
              disabled={!hasResultados || isLoading}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Ver Resultados ({data?.resultados?.length || 0})
            </Button>
            
            <Button
              variant="outline"
              onClick={resetFiltros}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>

          {/* Status dos filtros */}
          {filtros.marca && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Car className="h-3 w-3" />
                {filtros.marca}
              </Badge>
              {filtros.modelo_base && (
                <Badge variant="secondary">
                  {filtros.modelo_base}
                </Badge>
              )}
              {filtros.versao && (
                <Badge variant="secondary">
                  {filtros.versao}
                </Badge>
              )}
              {filtros.ano && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {filtros.ano}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {showResultados && hasResultados && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Resultados da Busca ({data?.resultados?.length} veículos encontrados)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.resultados?.map((veiculo, index) => (
                <div
                  key={`${veiculo.codigo_fipe}-${index}`}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {veiculo.marca} {veiculo.modelo_base}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {veiculo.versao}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {veiculo.ano}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-4 w-4" />
                          {veiculo.codigo_fipe}
                        </span>
                        <span>
                          Ref: {formatReferenceMonth(veiculo.referencia_mes)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(veiculo.preco)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Preço FIPE
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Carregando dados...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-red-600">
              <p>Erro ao carregar dados</p>
              <p className="text-sm text-gray-500 mt-1">
                Tente novamente em alguns instantes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {showResultados && !hasResultados && !isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum veículo encontrado</p>
              <p className="text-sm mt-1">
                Tente ajustar os filtros de busca
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
