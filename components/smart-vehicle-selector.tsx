"use client"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  getAllYears,
  getBrandsByYear,
  getModelsByBrandAndYear,
  getVersionsByModelAndYear,
  getVehicleDetails,
} from "@/lib/data/vehicles-database"

interface SmartVehicleSelectorProps {
  onSelectionChange?: (selection: VehicleSelection) => void
  initialValues?: Partial<VehicleSelection>
}

export interface VehicleSelection {
  ano?: number
  marca?: string
  modelo?: string
  versao?: string
  origem?: "Nacional" | "Importado"
  categoria?: string
  motor?: string
  combustivel?: string[]
  cambio?: string[]
}

export function SmartVehicleSelector({ onSelectionChange, initialValues = {} }: SmartVehicleSelectorProps) {
  // Estados básicos de seleção - AGORA COMEÇANDO PELO ANO!
  const [ano, setAno] = useState<string>(initialValues.ano?.toString() || "")
  const [marca, setMarca] = useState<string>(initialValues.marca || "")
  const [modelo, setModelo] = useState<string>(initialValues.modelo || "")
  const [versao, setVersao] = useState<string>(initialValues.versao || "")

  // Estados de opções disponíveis
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [availableVersions, setAvailableVersions] = useState<string[]>([])
  const [vehicleDetails, setVehicleDetails] = useState<any>(null)

  // Ref para evitar loops na notificação
  const lastNotifiedSelection = useRef<string>("")

  // Função para notificar mudanças
  const notifyParent = (selection: VehicleSelection) => {
    const selectionKey = JSON.stringify(selection)
    if (lastNotifiedSelection.current !== selectionKey) {
      lastNotifiedSelection.current = selectionKey
      onSelectionChange?.(selection)
    }
  }

  // Efeito para ano - PRIMEIRO FILTRO!
  useEffect(() => {
    if (ano) {
      const yearNumber = Number.parseInt(ano)
      const brands = getBrandsByYear(yearNumber)
      setAvailableBrands(brands)

      // Se a marca atual não está na lista, limpar
      if (marca && !brands.includes(marca)) {
        setMarca("")
        setModelo("")
        setVersao("")
      }
    } else {
      setAvailableBrands([])
      setMarca("")
      setModelo("")
      setVersao("")
    }
  }, [ano])

  // Efeito para marca
  useEffect(() => {
    if (ano && marca) {
      const yearNumber = Number.parseInt(ano)
      const models = getModelsByBrandAndYear(marca, yearNumber)
      setAvailableModels(models)

      // Se o modelo atual não está na lista, limpar
      if (modelo && !models.includes(modelo)) {
        setModelo("")
        setVersao("")
      }
    } else {
      setAvailableModels([])
      setModelo("")
      setVersao("")
    }
  }, [ano, marca])

  // Efeito para modelo
  useEffect(() => {
    if (ano && marca && modelo) {
      const yearNumber = Number.parseInt(ano)
      const versions = getVersionsByModelAndYear(marca, modelo, yearNumber)
      setAvailableVersions(versions)

      // Se a versão atual não está na lista, limpar
      if (versao && !versions.includes(versao)) {
        setVersao("")
      }

      // Buscar detalhes do veículo se temos versão
      if (versao && versions.includes(versao)) {
        const details = getVehicleDetails(marca, modelo, versao)
        setVehicleDetails(details)
      } else {
        setVehicleDetails(null)
      }
    } else {
      setAvailableVersions([])
      setVersao("")
      setVehicleDetails(null)
    }
  }, [ano, marca, modelo])

  // Efeito para versão
  useEffect(() => {
    if (ano && marca && modelo && versao) {
      const details = getVehicleDetails(marca, modelo, versao)
      setVehicleDetails(details)
    } else {
      setVehicleDetails(null)
    }
  }, [ano, marca, modelo, versao])

  // Efeito para notificar mudanças - separado e controlado
  useEffect(() => {
    const selection: VehicleSelection = {
      ano: ano ? Number.parseInt(ano) : undefined,
      marca: marca || undefined,
      modelo: modelo || undefined,
      versao: versao || undefined,
      origem: vehicleDetails?.origem,
      categoria: vehicleDetails?.category,
      motor: vehicleDetails?.motor,
      combustivel: vehicleDetails?.combustivel,
      cambio: vehicleDetails?.cambio,
    }

    notifyParent(selection)
  }, [ano, marca, modelo, versao, vehicleDetails])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ANO - PRIMEIRO FILTRO! */}
        <div>
          <Label htmlFor="ano">Ano</Label>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {getAllYears().map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Marca */}
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Select value={marca} onValueChange={setMarca} disabled={!ano}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {availableBrands.map((brandName) => (
                <SelectItem key={brandName} value={brandName}>
                  {brandName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Select value={modelo} onValueChange={setModelo} disabled={!marca}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((modelName) => (
                <SelectItem key={modelName} value={modelName}>
                  {modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Versão */}
        <div>
          <Label htmlFor="versao">Versão</Label>
          <Select value={versao} onValueChange={setVersao} disabled={!modelo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a versão" />
            </SelectTrigger>
            <SelectContent>
              {availableVersions.map((versionName) => (
                <SelectItem key={versionName} value={versionName}>
                  {versionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Informações do veículo selecionado */}
      {vehicleDetails && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3">Informações do Veículo</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{vehicleDetails.origem}</Badge>
            <Badge variant="outline">{vehicleDetails.category}</Badge>
            <Badge variant="outline">Motor: {vehicleDetails.motor}</Badge>
            <Badge variant="outline">Combustível: {vehicleDetails.combustivel.join("/")}</Badge>
            <Badge variant="outline">Câmbio: {vehicleDetails.cambio.join("/")}</Badge>
          </div>
        </div>
      )}
    </div>
  )
}
