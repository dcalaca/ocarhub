"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Wrench, Gauge, GitPullRequest, Fuel, Ruler, Scale, CarFront } from "lucide-react"
import { TECHNICAL_SPECS_DATA, type TechnicalSpecs } from "@/data/technical-specs-data"

export default function TechnicalSpecsPage() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [currentSpecs, setCurrentSpecs] = useState<TechnicalSpecs | null>(null)

  const availableYears = TECHNICAL_SPECS_DATA.map((data) => data.year)

  const availableBrands = selectedYear
    ? TECHNICAL_SPECS_DATA.find((data) => data.year === selectedYear)?.brands || []
    : []

  const availableModels =
    selectedYear && selectedBrand ? availableBrands.find((brand) => brand.name === selectedBrand)?.models || [] : []

  const availableVersions =
    selectedYear && selectedBrand && selectedModel
      ? availableModels.find((model) => model.name === selectedModel)?.versions || []
      : []

  useEffect(() => {
    if (selectedYear && selectedBrand && selectedModel && selectedVersion) {
      const yearData = TECHNICAL_SPECS_DATA.find((data) => data.year === selectedYear)
      const brandData = yearData?.brands.find((brand) => brand.name === selectedBrand)
      const modelData = brandData?.models.find((model) => model.name === selectedModel)
      const versionData = modelData?.versions.find((version) => version.name === selectedVersion)
      setCurrentSpecs(versionData?.specs || null)
    } else {
      setCurrentSpecs(null)
    }
  }, [selectedYear, selectedBrand, selectedModel, selectedVersion])

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedVersion(null)
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    setSelectedModel(null)
    setSelectedVersion(null)
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setSelectedVersion(null)
  }

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version)
  }

  const DataField = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="p-3 rounded-lg border bg-muted/20 border-border">
      <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-semibold">{value || "Não informado"}</div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Ficha Técnica do Veículo</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Pesquisar Ficha Técnica
          </CardTitle>
          <CardDescription>Selecione o ano, marca, modelo e versão para ver a ficha técnica detalhada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ano */}
            <div className="space-y-2">
              <label
                htmlFor="year-select"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ano
              </label>
              <Select onValueChange={handleYearChange} value={selectedYear || ""}>
                <SelectTrigger id="year-select">
                  <SelectValue placeholder="Selecione o Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <label
                htmlFor="brand-select"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Marca
              </label>
              <Select onValueChange={handleBrandChange} value={selectedBrand || ""} disabled={!selectedYear}>
                <SelectTrigger id="brand-select">
                  <SelectValue placeholder="Selecione a Marca" />
                </SelectTrigger>
                <SelectContent>
                  {availableBrands.map((brand) => (
                    <SelectItem key={brand.name} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <label
                htmlFor="model-select"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Modelo
              </label>
              <Select onValueChange={handleModelChange} value={selectedModel || ""} disabled={!selectedBrand}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Selecione o Modelo" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Versão */}
            <div className="space-y-2">
              <label
                htmlFor="version-select"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Versão
              </label>
              <Select onValueChange={handleVersionChange} value={selectedVersion || ""} disabled={!selectedModel}>
                <SelectTrigger id="version-select">
                  <SelectValue placeholder="Selecione a Versão" />
                </SelectTrigger>
                <SelectContent>
                  {availableVersions.map((version) => (
                    <SelectItem key={version.name} value={version.name}>
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentSpecs ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" /> Ficha Técnica Detalhada
            </CardTitle>
            <CardDescription>
              Especificações completas para o {selectedBrand} {selectedModel} {selectedVersion} ({selectedYear}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Motor e Desempenho */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" /> Motor e Desempenho
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Tipo do motor" value={currentSpecs.engineType} />
                <DataField label="Potência" value={currentSpecs.horsepower} />
                <DataField label="Torque" value={currentSpecs.torque} />
                <DataField label="Nº de cilindros" value={currentSpecs.cylinders} />
                <DataField label="Aspiração" value={currentSpecs.aspiration} />
                <DataField label="Tipo de injeção" value={currentSpecs.injectionType} />
                <DataField label="Velocidade máxima" value={currentSpecs.maxSpeed} />
                <DataField label="Aceleração 0 a 100 km/h" value={currentSpecs.acceleration0to100} />
              </div>
            </div>

            {/* Transmissão */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-muted-foreground" /> Transmissão
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Tipo de câmbio" value={currentSpecs.transmissionType} />
                <DataField label="Número de marchas" value={currentSpecs.gears} />
                <DataField label="Tração" value={currentSpecs.traction} />
              </div>
            </div>

            {/* Consumo */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Fuel className="h-4 w-4 text-muted-foreground" /> Consumo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Consumo urbano" value={currentSpecs.cityConsumption} />
                <DataField label="Consumo rodoviário" value={currentSpecs.highwayConsumption} />
                <DataField label="Tipo de combustível" value={currentSpecs.fuelType} />
                <DataField label="Capacidade do tanque" value={currentSpecs.fuelTankCapacity} />
              </div>
            </div>

            {/* Dimensões */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" /> Dimensões
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Comprimento" value={currentSpecs.length} />
                <DataField label="Largura" value={currentSpecs.width} />
                <DataField label="Altura" value={currentSpecs.height} />
                <DataField label="Entre-eixos" value={currentSpecs.wheelbase} />
                <DataField label="Altura do solo" value={currentSpecs.groundClearance} />
              </div>
            </div>

            {/* Pesos e Capacidades */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" /> Pesos e Capacidades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Peso bruto total" value={currentSpecs.grossWeight} />
                <DataField label="Peso em ordem de marcha" value={currentSpecs.curbWeight} />
                <DataField label="Capacidade do porta-malas" value={currentSpecs.trunkCapacity} />
                <DataField label="Número de ocupantes" value={currentSpecs.occupants} />
                <DataField label="Capacidade de carga" value={currentSpecs.loadCapacity} />
              </div>
            </div>

            {/* Estrutura e Chassi */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CarFront className="h-4 w-4 text-muted-foreground" /> Estrutura e Chassi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Tipo de carroceria" value={currentSpecs.bodyType} />
                <DataField label="Nº de portas" value={currentSpecs.doors} />
                <DataField label="Tipo de direção" value={currentSpecs.steeringType} />
                <DataField label="Suspensão dianteira" value={currentSpecs.frontSuspension} />
                <DataField label="Suspensão traseira" value={currentSpecs.rearSuspension} />
                <DataField label="Freios dianteiros" value={currentSpecs.frontBrakes} />
                <DataField label="Freios traseiros" value={currentSpecs.rearBrakes} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border text-center py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <Wrench className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-semibold text-muted-foreground">Nenhuma ficha técnica selecionada.</p>
            <p className="text-sm text-muted-foreground">
              Por favor, selecione o ano, marca, modelo e versão para visualizar os detalhes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
