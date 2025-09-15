"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { VehicleSelector } from "@/components/vehicle-selector"
import { PhotoUpload } from "@/components/photo-upload"
import { FipeSelector } from "@/components/fipe-selector"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Car,
  Star,
  Zap,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Camera,
  Gauge,
  Settings,
  FileText,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import {
  getAllBrands,
  getModelsByBrand,
  getYearsByModel,
  getVersionsByModel,
  getTransmissionsByModel,
} from "@/lib/data/car-brands"
import { cores, combustiveis } from "@/lib/data/filters"
import { VehicleService } from "@/lib/vehicle-service"

export default function AnunciarPage() {
  const { user, debitSaldo } = useAuth()
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState("info")
  const [planoSelecionado, setPlanoSelecionado] = useState<"gratuito" | "destaque" | "premium">("gratuito")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [formCompleted, setFormCompleted] = useState(false)

  // Dados do veículo
  const [brandId, setBrandId] = useState("")
  const [modelId, setModelId] = useState("")
  const [year, setYear] = useState("")
  const [version, setVersion] = useState("")
  const [price, setPrice] = useState("")
  const [fipeData, setFipeData] = useState<{ price: number; fipeCode: string } | null>(null)
  const [mileage, setMileage] = useState("")
  const [color, setColor] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [transmission, setTransmission] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [owners, setOwners] = useState("1")
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [location, setLocation] = useState("")

  // Opções dinâmicas
  const [brands, setBrands] = useState<{ value: string; label: string; image: string }[]>([])
  const [models, setModels] = useState<{ value: string; label: string }[]>([])
  const [years, setYears] = useState<{ value: string; label: string }[]>([])
  const [versions, setVersions] = useState<{ value: string; label: string }[]>([])
  const [fuelTypes, setFuelTypes] = useState<{ value: string; label: string }[]>([])
  const [transmissions, setTransmissions] = useState<{ value: string; label: string }[]>([])

  const planos = {
    gratuito: {
      nome: "Gratuito",
      preco: 0,
      duracao: 30,
      recursos: ["Anúncio básico por 30 dias", "Até 5 fotos", "Aparece na busca normal", "Sem destaque especial"],
      cor: "gray",
      maxPhotos: 5,
    },
    destaque: {
      nome: "Destaque",
      preco: 80,
      duracao: 30,
      recursos: [
        "Anúncio destacado por 30 dias",
        "Até 10 fotos",
        "Aparece no topo da busca",
        "Selo de destaque",
        "3x mais visualizações",
      ],
      cor: "blue",
      maxPhotos: 10,
    },
    premium: {
      nome: "Premium",
      preco: 150,
      duracao: 45,
      recursos: [
        "Anúncio premium por 45 dias",
        "Fotos ilimitadas",
        "Prioridade máxima na busca",
        "Selo premium dourado",
        "Histórico veicular gratuito",
        "5x mais visualizações",
      ],
      cor: "yellow",
      maxPhotos: 20,
    },
  }

  // Carregar marcas
  useEffect(() => {
    const allBrands = getAllBrands()
    setBrands(
      allBrands.map((brand) => ({
        value: brand.id,
        label: brand.name,
        image: brand.logo,
      })),
    )

    // Carregar combustíveis (lista fixa)
    setFuelTypes(
      combustiveis.map((fuel) => ({
        value: fuel,
        label: fuel,
      })),
    )
  }, [])

  // Carregar modelos quando a marca mudar
  useEffect(() => {
    if (brandId) {
      const brandModels = getModelsByBrand(brandId)
      setModels(
        brandModels.map((model) => ({
          value: model.id,
          label: model.name,
        })),
      )
      setModelId("")
      setYear("")
      setVersion("")
    } else {
      setModels([])
    }
  }, [brandId])

  // Carregar anos quando o modelo mudar
  useEffect(() => {
    if (brandId && modelId) {
      const modelYears = getYearsByModel(brandId, modelId)
      setYears(
        modelYears.map((year) => ({
          value: year.toString(),
          label: year.toString(),
        })),
      )

      // Carregar versões
      const modelVersions = getVersionsByModel(brandId, modelId)
      setVersions(
        modelVersions.map((version) => ({
          value: version,
          label: version,
        })),
      )

      // Carregar tipos de combustível
      // Remover a linha que carrega combustíveis por modelo e usar a lista fixa
      setFuelTypes(
        combustiveis.map((fuel) => ({
          value: fuel,
          label: fuel,
        })),
      )

      // Carregar transmissões
      const modelTransmissions = getTransmissionsByModel(brandId, modelId)
      setTransmissions(
        modelTransmissions.map((transmission) => ({
          value: transmission,
          label: transmission,
        })),
      )

      setYear("")
      setVersion("")
    } else {
      setYears([])
      setVersions([])
      setFuelTypes([])
      setTransmissions([])
    }
  }, [brandId, modelId])

  // Calcular progresso do formulário
  useEffect(() => {
    let completed = 0
    const total = 7 // Campos obrigatórios (removendo location)

    if (brandId) completed++
    if (modelId) completed++
    if (year) completed++
    if (price) completed++
    if (mileage) completed++
    if (color) completed++
    if (fuelType) completed++

    const percentage = Math.floor((completed / total) * 100)
    setProgress(percentage)
    setFormCompleted(percentage === 100)
  }, [brandId, modelId, year, price, mileage, color, fuelType])

  const handlePublicarAnuncio = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para anunciar",
        variant: "destructive",
      })
      return
    }

    if (!formCompleted) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const plano = planos[planoSelecionado]

    if (plano.preco > 0 && (user.saldo || 0) < plano.preco) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de ${(plano.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para este plano`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simular upload de fotos com progresso
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Primeiro, tentar criar o veículo no Supabase
      let veiculoCriado = null
      if (user?.id) {
        console.log('🚗 Salvando veículo no Supabase...')
        
        const vehicleData = {
          marca: brands.find(b => b.value === brandId)?.label || '',
          modelo: models.find(m => m.value === modelId)?.label || '',
          versao: versions.find(v => v.value === version)?.label || '',
          ano: parseInt(year),
          cor: color,
          quilometragem: parseInt(mileage),
          motor: `${fuelType} ${transmission}`,
          combustivel: [fuelType],
          cambio: transmission,
          opcionais: [], // TODO: Implementar opcionais
          preco: parseFloat(price),
          fipe: fipeData?.price,
          placa_parcial: licensePlate,
          numero_proprietarios: parseInt(owners),
          observacoes: description,
          fotos: photos.map(file => URL.createObjectURL(file)), // URLs temporárias
          plano: planoSelecionado,
          cidade: location.split(',')[0]?.trim() || 'São Paulo',
          estado: location.split(',')[1]?.trim() || 'SP',
        }

        try {
          console.log('📝 Dados do veículo a serem salvos:', vehicleData)
          veiculoCriado = await VehicleService.createVehicle(vehicleData, user.id)
          console.log('✅ Veículo salvo com sucesso:', veiculoCriado)
        } catch (error) {
          console.error('❌ Erro ao salvar veículo:', error)
          console.error('❌ Detalhes do erro:', error.message)
          toast({
            title: "Erro ao salvar anúncio",
            description: `Erro: ${error.message}`,
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      // Só debitar o saldo se o veículo foi criado com sucesso
      if (plano.preco > 0 && veiculoCriado) {
        console.log('💰 Tentando debitar saldo:', {
          valor: plano.preco,
          plano: plano.nome,
          saldoAtual: user?.saldo,
          usuario: user?.id
        })
        
        const sucesso = await debitSaldo(
          plano.preco,
          `Anúncio ${plano.nome} - ${plano.duracao} dias`,
          planoSelecionado === "destaque" ? "anuncio_destaque" : "anuncio_premium",
        )

        console.log('💰 Resultado do débito:', sucesso)

        if (!sucesso) {
          toast({
            title: "Erro no pagamento",
            description: "Não foi possível processar o pagamento",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      // Sucesso - mostrar toast e redirecionar
      toast({
        title: "Anúncio publicado com sucesso!",
        description: `Seu anúncio ${plano.nome} está ativo por ${plano.duracao} dias`,
      })

      // Redirecionar para meus anúncios após 2 segundos
      setTimeout(() => {
        window.location.href = "/meus-anuncios"
      }, 2000)
    } catch (error) {
      console.error("Erro ao publicar anúncio:", error)
      toast({
        title: "Erro ao publicar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Anunciar Veículo</h1>
              <p className="text-muted-foreground">Escolha o plano ideal e preencha os dados do seu veículo</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}% completo</span>
          </div>
        </div>

        {user && (
          <Alert className="mb-6">
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              <strong>Saldo disponível:</strong>{" "}
              {(user.saldo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              {(user.saldo || 0) < 35 && (
                <span className="ml-2">
                  <Link href="/conta" className="text-blue-600 hover:underline">
                    Adicionar saldo
                  </Link>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(planos).map(([key, plano]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                planoSelecionado === key ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setPlanoSelecionado(key as any)}
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {key === "gratuito" && <Car className="w-8 h-8 text-gray-600" />}
                  {key === "destaque" && <Star className="w-8 h-8 text-blue-600" />}
                  {key === "premium" && <Zap className="w-8 h-8 text-yellow-600" />}
                </div>
                <CardTitle className="text-xl">{plano.nome}</CardTitle>
                <div className="text-3xl font-bold">
                  {plano.preco === 0
                    ? "Grátis"
                    : (plano.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                <p className="text-sm text-muted-foreground">por {plano.duracao} dias</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plano.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {recurso}
                    </li>
                  ))}
                </ul>

                {planoSelecionado === key && <Badge className="w-full mt-4 justify-center">Selecionado</Badge>}

                {user && plano.preco > (user.saldo || 0) && plano.preco > 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Saldo insuficiente. Adicione{" "}
                      {((plano.preco || 0) - (user.saldo || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Informações Básicas</span>
              <span className="sm:hidden">Básicas</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Detalhes Técnicos</span>
              <span className="sm:hidden">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Fotos e Descrição</span>
              <span className="sm:hidden">Fotos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brand">
                      Marca <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={brands}
                      value={brandId}
                      onChange={setBrandId}
                      placeholder="Selecione a marca"
                      showImages={true}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">
                      Modelo <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={models}
                      value={modelId}
                      onChange={setModelId}
                      placeholder="Selecione o modelo"
                      disabled={!brandId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="year">
                      Ano <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={years}
                      value={year}
                      onChange={setYear}
                      placeholder="Selecione o ano"
                      disabled={!modelId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Versão</Label>
                    <VehicleSelector
                      options={versions}
                      value={version}
                      onChange={setVersion}
                      placeholder="Selecione a versão"
                      disabled={!modelId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Preço <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input
                        id="price"
                        type="text"
                        placeholder="50.000"
                        value={price}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          setPrice(value)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="location"
                        type="text"
                        placeholder="São Paulo, SP"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {brandId && modelId && year && (
                  <FipeSelector
                    brandId={brandId}
                    modelId={modelId}
                    year={Number.parseInt(year)}
                    onSelect={setFipeData}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentTab("details")}>Próximo: Detalhes Técnicos</Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Detalhes Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">
                      Quilometragem <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="mileage"
                        type="text"
                        placeholder="45.000"
                        value={mileage}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          setMileage(value)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">
                      Cor <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={cores.map((cor) => ({ value: cor, label: cor }))}
                      value={color}
                      onChange={setColor}
                      placeholder="Selecione a cor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">
                      Combustível <span className="text-red-500">*</span>
                    </Label>
                    <VehicleSelector
                      options={fuelTypes}
                      value={fuelType}
                      onChange={setFuelType}
                      placeholder="Selecione o combustível"
                      disabled={!modelId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission">Câmbio</Label>
                    <VehicleSelector
                      options={transmissions}
                      value={transmission}
                      onChange={setTransmission}
                      placeholder="Selecione o câmbio"
                      disabled={!modelId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">Placa (parcial)</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="licensePlate"
                        type="text"
                        placeholder="ABC-**12"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="pl-10"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owners">Número de proprietários</Label>
                    <RadioGroup value={owners} onValueChange={setOwners} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="owner-1" />
                        <Label htmlFor="owner-1">1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="owner-2" />
                        <Label htmlFor="owner-2">2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="owner-3" />
                        <Label htmlFor="owner-3">3</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4+" id="owner-4" />
                        <Label htmlFor="owner-4">4+</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="history-check">Verificar histórico veicular</Label>
                    <Switch id="history-check" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adicione um selo de confiança ao seu anúncio verificando o histórico completo do veículo.
                    {planoSelecionado === "premium" ? (
                      <span className="text-green-600 font-medium"> Incluído no plano Premium!</span>
                    ) : (
                      <span> Custo adicional: R$ 25,00</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab("info")}>
                Voltar
              </Button>
              <Button onClick={() => setCurrentTab("photos")}>Próximo: Fotos e Descrição</Button>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Fotos e Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PhotoUpload maxPhotos={planos[planoSelecionado].maxPhotos} onChange={setPhotos} value={photos} />

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva seu veículo, destacando características importantes, estado de conservação e diferenciais..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab("details")}>
                Voltar
              </Button>
              <Button
                onClick={handlePublicarAnuncio}
                disabled={
                  loading ||
                  !formCompleted ||
                  (user && planos[planoSelecionado].preco > user.saldo && planos[planoSelecionado].preco > 0)
                }
                className="px-8 min-w-[200px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publicando...
                  </div>
                ) : (
                  <>
                    <Car className="w-4 h-4 mr-2" />
                    Publicar Anúncio {planos[planoSelecionado].nome}
                    {planos[planoSelecionado].preco > 0 && (
                      <span className="ml-2">
                        (
                        {(planos[planoSelecionado].preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        )
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
