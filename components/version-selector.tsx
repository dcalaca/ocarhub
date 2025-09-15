"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, ArrowLeft, Car } from "lucide-react"
import {
  getVersionsByModelAndYear,
  getVehicleDetails,
  getAllYears,
  getModelsByBrandAndYear,
} from "@/lib/data/vehicles-database"

interface VersionSelectorProps {
  value?: string
  onChange: (value: string) => void
  marca?: string
  modelo?: string
  ano?: number
  placeholder?: string
}

export function VersionSelector({ value, onChange, marca, modelo, ano, placeholder }: VersionSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [availableVersions, setAvailableVersions] = useState<string[]>([])
  const [filteredVersions, setFilteredVersions] = useState<string[]>([])
  const [versionDetails, setVersionDetails] = useState<Record<string, any>>({})
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Se não há ano específico, pega todos os anos disponíveis para a marca/modelo
  useEffect(() => {
    if (marca && modelo) {
      // Busca todos os anos disponíveis para esta marca/modelo
      const allYears = getAllYears()
      const yearsForModel = allYears.filter((year) => {
        const modelsForYear = getModelsByBrandAndYear(marca, year)
        return modelsForYear.includes(modelo)
      })
      setAvailableYears(yearsForModel)
    } else {
      setAvailableYears([])
    }
  }, [marca, modelo])

  // Carrega versões quando marca, modelo ou ano mudam
  useEffect(() => {
    if (marca && modelo) {
      let allVersions: string[] = []

      if (ano) {
        // Se tem ano específico, busca só para esse ano
        allVersions = getVersionsByModelAndYear(marca, modelo, ano)
      } else if (availableYears.length > 0) {
        // Se não tem ano, busca para todos os anos disponíveis
        const versionSet = new Set<string>()
        availableYears.forEach((year) => {
          const versions = getVersionsByModelAndYear(marca, modelo, year)
          versions.forEach((version) => versionSet.add(version))
        })
        allVersions = Array.from(versionSet).sort()
      }

      setAvailableVersions(allVersions)

      // Carrega detalhes de cada versão (usando o primeiro ano disponível se não especificado)
      const details: Record<string, any> = {}
      allVersions.forEach((version) => {
        const yearToUse = ano || availableYears[0]
        if (yearToUse) {
          const detail = getVehicleDetails(marca, modelo, version)
          if (detail) {
            details[version] = detail
          }
        }
      })
      setVersionDetails(details)
    } else {
      setAvailableVersions([])
      setVersionDetails({})
    }
  }, [marca, modelo, ano, availableYears])

  // Filtra versões baseado no termo de busca
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableVersions.filter((version) => version.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredVersions(filtered)
    } else {
      setFilteredVersions(availableVersions)
    }
  }, [searchTerm, availableVersions])

  const handleVersionSelect = (version: string) => {
    onChange(version)
    setOpen(false)
    setSearchTerm("")
  }

  const canShowVersions = marca && modelo && availableVersions.length > 0

  return (
    <div className="space-y-2">
      <Label htmlFor="versao">Versão</Label>
      <div className="flex gap-2">
        <Input
          id="versao"
          placeholder={placeholder || "Ex: 1.0 Comfort, 2.0 Turbo..."}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />

        {canShowVersions && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Selecione uma versão
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Informações do veículo selecionado */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>
                      {marca} {modelo} {ano ? ano : `(${availableYears.length} anos disponíveis)`}
                    </span>
                  </div>
                </div>

                {/* Campo de busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite a versão desejada"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista de versões */}
                <div>
                  <h3 className="font-medium mb-3">Todas as versões ({filteredVersions.length})</h3>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {filteredVersions.length > 0 ? (
                        filteredVersions.map((version) => {
                          const details = versionDetails[version]
                          return (
                            <div
                              key={version}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleVersionSelect(version)}
                            >
                              <div className="font-medium mb-1">{version}</div>
                              {details && (
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {details.motor}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {details.combustivel.join("/")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {details.cambio.join("/")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {details.origem}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma versão encontrada</p>
                          {searchTerm && <p className="text-sm">Tente ajustar o termo de busca</p>}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Removido o texto de orientação desnecessário */}
    </div>
  )
}
