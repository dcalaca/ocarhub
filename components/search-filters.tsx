"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    marca: "",
    modelo: "",
    anoMin: 2000,
    anoMax: 2024,
    precoMin: 0,
    precoMax: 500000,
    kmMin: 0,
    kmMax: 200000,
    cidade: "",
    combustivel: "",
    cambio: "",
  })

  const marcasPopulares = [
    "Toyota",
    "Honda",
    "Volkswagen",
    "Chevrolet",
    "Ford",
    "Hyundai",
    "Nissan",
    "Fiat",
    "Renault",
    "Peugeot",
  ]

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      marca: "",
      modelo: "",
      anoMin: 2000,
      anoMax: 2024,
      precoMin: 0,
      precoMax: 500000,
      kmMin: 0,
      kmMax: 200000,
      cidade: "",
      combustivel: "",
      cambio: "",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Filtros
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Marca com Select */}
        <div>
          <Label>Marca</Label>
          <Select value={filters.marca} onValueChange={(value) => handleFilterChange("marca", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as marcas</SelectItem>
              {marcasPopulares.map((marca) => (
                <SelectItem key={marca} value={marca}>
                  {marca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Modelo */}
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            placeholder="Ex: Corolla, Civic..."
            value={filters.modelo}
            onChange={(e) => handleFilterChange("modelo", e.target.value)}
          />
        </div>

        <Separator />

        {/* Ano */}
        <div>
          <Label>
            Ano: {filters.anoMin} - {filters.anoMax}
          </Label>
          <div className="mt-2">
            <Slider
              value={[filters.anoMin, filters.anoMax]}
              onValueChange={([min, max]) => {
                handleFilterChange("anoMin", min)
                handleFilterChange("anoMax", max)
              }}
              min={2000}
              max={2024}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Preço */}
        <div>
          <Label>
            Preço: R$ {filters.precoMin.toLocaleString()} - R$ {filters.precoMax.toLocaleString()}
          </Label>
          <div className="mt-2">
            <Slider
              value={[filters.precoMin, filters.precoMax]}
              onValueChange={([min, max]) => {
                handleFilterChange("precoMin", min)
                handleFilterChange("precoMax", max)
              }}
              min={0}
              max={500000}
              step={5000}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Km */}
        <div>
          <Label>
            Km: {filters.kmMin.toLocaleString()} - {filters.kmMax.toLocaleString()}
          </Label>
          <div className="mt-2">
            <Slider
              value={[filters.kmMin, filters.kmMax]}
              onValueChange={([min, max]) => {
                handleFilterChange("kmMin", min)
                handleFilterChange("kmMax", max)
              }}
              min={0}
              max={200000}
              step={1000}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Cidade */}
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            placeholder="Ex: São Paulo, Rio de Janeiro..."
            value={filters.cidade}
            onChange={(e) => handleFilterChange("cidade", e.target.value)}
          />
        </div>

        <Separator />

        {/* Combustível */}
        <div>
          <Label>Combustível</Label>
          <Select value={filters.combustivel} onValueChange={(value) => handleFilterChange("combustivel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
              <SelectItem value="gasolina">Gasolina</SelectItem>
              <SelectItem value="etanol">Etanol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="eletrico">Elétrico</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Câmbio */}
        <div>
          <Label>Câmbio</Label>
          <Select value={filters.cambio} onValueChange={(value) => handleFilterChange("cambio", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automatico">Automático</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
