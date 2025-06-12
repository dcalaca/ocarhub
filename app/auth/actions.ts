"use server"

import { createClient } from "@/lib/supabase/server"

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const cpf = formData.get("cpf") as string

  if (!email || !password || !phone || !cpf) {
    return { success: false, message: "Todos os campos são obrigatórios." }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || "",
          phone: phone,
          cpf: cpf,
        },
      },
    })

    if (error) {
      return { success: false, message: `Erro no cadastro: ${error.message}` }
    }

    if (data.user) {
      return { success: true, message: "Conta criada com sucesso! Redirecionando..." }
    }

    return { success: true, message: "Conta criada com sucesso!" }
  } catch (error: any) {
    return { success: false, message: `Erro no cadastro: ${error.message}` }
  }
}

export async function signInWithEmail(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, message: "Email e senha são obrigatórios." }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, message: `Erro no login: ${error.message}` }
    }

    if (data.user) {
      // Passa os dados via URL para o cliente processar
      const params = new URLSearchParams({
        email,
        password,
        action: "signin",
      })

      return { success: true, message: "Login realizado com sucesso! Redirecionando..." }
    }

    return { success: false, message: "Erro no login: usuário não encontrado." }
  } catch (error: any) {
    return { success: false, message: `Erro no login: ${error.message}` }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

// Define um tipo para dados do veículo para clareza
type VehicleData = {
  plate?: string
  chassis?: string
  model?: string
  brand?: string
  year?: number
  previousOwners?: number
  auction?: boolean
  accidentHistory?: boolean
  theftRecord?: boolean
  debts?: string[]
  status?: "Regular" | "Alerta" | "Irregular"
  [key: string]: any
}

// Função simuladora inteligente que aceita qualquer placa/chassi
async function fetchExternalVehicleApi(term: string): Promise<VehicleData> {
  console.log(`API Simulador: Buscando dados para ${term}...`)
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simula atraso de rede

  // Gera dados baseados na placa/chassi digitado
  const isPlate = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(term) // Formato placa brasileira
  const isMercosulPlate = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(term) // Formato Mercosul

  // Lista de marcas e modelos para simulação
  const brands = ["Toyota", "Volkswagen", "Chevrolet", "Ford", "Honda", "Hyundai", "Fiat", "Nissan"]
  const models = {
    Toyota: ["Corolla", "Camry", "Hilux", "Etios", "Yaris"],
    Volkswagen: ["Gol", "Polo", "Jetta", "Tiguan", "T-Cross"],
    Chevrolet: ["Onix", "Prisma", "Cruze", "S10", "Tracker"],
    Ford: ["Ka", "Fiesta", "Focus", "EcoSport", "Ranger"],
    Honda: ["Civic", "City", "HR-V", "Fit", "CR-V"],
    Hyundai: ["HB20", "Creta", "Tucson", "Elantra", "i30"],
    Fiat: ["Uno", "Argo", "Cronos", "Toro", "Mobi"],
    Nissan: ["March", "Versa", "Kicks", "Sentra", "Frontier"],
  }

  // Gera dados baseados no hash da placa para consistência
  const hash = term.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const brandIndex = Math.abs(hash) % brands.length
  const selectedBrand = brands[brandIndex]
  const modelIndex = Math.abs(hash >> 8) % models[selectedBrand].length
  const selectedModel = models[selectedBrand][modelIndex]

  // Gera ano baseado no hash
  const currentYear = new Date().getFullYear()
  const year = currentYear - (Math.abs(hash >> 16) % 15) // Carros de até 15 anos

  // Gera número de proprietários baseado no ano
  const carAge = currentYear - year
  const previousOwners = Math.min(Math.floor(carAge / 3) + (Math.abs(hash >> 24) % 2), 5)

  // Determina status baseado em alguns caracteres da placa
  const riskFactors = []
  let status: "Regular" | "Alerta" | "Irregular" = "Regular"

  // Simula problemas baseados em caracteres específicos
  const hasAuction = term.includes("A") || term.includes("L") // 'A' de Auction, 'L' de Leilão
  const hasAccident = term.includes("S") || term.includes("X") // 'S' de Sinistro, 'X' de acidente
  const hasTheft = term.includes("R") || term.includes("F") // 'R' de Roubo, 'F' de Furto
  const hasDebts = term.includes("D") || term.includes("M") || term.includes("I") // Débitos

  if (hasAuction) {
    riskFactors.push("Histórico de leilão")
    status = "Alerta"
  }

  if (hasAccident) {
    riskFactors.push("Histórico de sinistro")
    status = "Alerta"
  }

  if (hasTheft) {
    riskFactors.push("Registro de roubo/furto")
    status = "Irregular"
  }

  const debts = []
  if (hasDebts) {
    debts.push("IPVA 2024 pendente - R$ 1.247,80")
    debts.push("Multa DETRAN - R$ 195,23")
    status = status === "Regular" ? "Alerta" : status
  } else {
    debts.push("IPVA 2024 pago")
    debts.push("Licenciamento em dia")
  }

  // Se não tem problemas, mantém regular
  if (riskFactors.length === 0 && debts.every((d) => d.includes("pago") || d.includes("dia"))) {
    status = "Regular"
  }

  // Gera histórico de donos (sem nomes, apenas datas)
  const ownerHistory = []
  for (let i = 0; i < previousOwners + 1; i++) {
    const purchaseYear = year + i * 2
    const purchaseMonth = (Math.abs(hash >> (i * 4)) % 12) + 1
    const purchaseDay = (Math.abs(hash >> (i * 6)) % 28) + 1
    ownerHistory.push(
      `${purchaseDay.toString().padStart(2, "0")}/${purchaseMonth.toString().padStart(2, "0")}/${purchaseYear}`,
    )
  }

  return {
    [isPlate || isMercosulPlate ? "plate" : "chassis"]: term,
    model: selectedModel,
    brand: selectedBrand,
    year: year,
    previousOwners: previousOwners,
    auction: hasAuction,
    accidentHistory: hasAccident,
    theftRecord: hasTheft,
    debts: debts,
    status: status,

    // Novas informações expandidas
    commercializationRisk: hasAuction || hasAccident ? "Alto risco" : "Baixo risco",
    auctionData: hasAuction ? "Leilão identificado em 2023 - Seguradora XYZ" : "Sem registro de leilão",
    accidents: hasAccident ? ["Colisão frontal - 2022", "Indenização parcial"] : "Sem registros de batidas",
    kmHistory: `${(year - 2020) * 12000 + Math.abs(hash % 5000)} km (${year + 1}), ${(year - 2020) * 24000 + Math.abs(hash % 8000)} km (${year + 2})`,
    ownerHistory: ownerHistory,
    gravames: hasDebts ? "Financiamento ativo - Banco XYZ" : "Sem gravames",
    restrictions: hasTheft ? ["Bloqueio judicial", "Restrição administrativa"] : "Sem restrições",
    renajudDetail: hasTheft ? "Processo nº 1234567-89.2023.8.26.0001" : "Sem bloqueios Renajud",
    recall: Math.abs(hash) % 3 === 0 ? "Recall ativo - Airbag (válido até 12/2024)" : "Sem recalls pendentes",
    auctionScore: hasAuction ? "Score: 6.2/10 - Origem: Seguradora" : "N/A",
    nationalRegistry: {
      chassis: term.length > 7 ? term : "9BD" + term + "123456789",
      engine: "ABC123456",
      color: "Prata",
      type: "Automóvel",
    },
    stateRegistry: {
      modifications: "Sem alterações",
      colorChanges: "Não consta",
      engineSwap: "Não consta",
    },
    chassisDecoder: {
      country: "Brasil",
      manufacturer: selectedBrand,
      plant: "São Bernardo do Campo - SP",
      modelYear: year,
    },
    commonFailures: [
      "Bomba de combustível (após 80.000 km)",
      "Sensor de oxigênio (após 60.000 km)",
      "Pastilhas de freio (a cada 30.000 km)",
    ],
    pricing: {
      fipe: `R$ ${(25000 + Math.abs(hash % 50000)).toLocaleString("pt-BR")}`,
      market: `R$ ${(23000 + Math.abs(hash % 45000)).toLocaleString("pt-BR")}`,
    },
    priceGraph: "Desvalorização de 12% nos últimos 12 meses",
    technicalSpecs: {
      engine: "1.6 16V Flex",
      transmission: "Manual 5 marchas",
      fuel: "Flex (Etanol/Gasolina)",
      consumption: "12,5 km/l cidade | 16,8 km/l estrada",
    },
  }
}

export async function getVehicleInfo(searchTerm: string): Promise<{ data?: VehicleData; error?: string }> {
  // Validação básica mais flexível
  if (!searchTerm || searchTerm.trim().length < 3) {
    return { error: "Termo de busca muito curto. Digite pelo menos 3 caracteres." }
  }

  // Limpa e formata o termo de busca
  const cleanTerm = searchTerm
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")

  if (cleanTerm.length < 3) {
    return { error: "Termo de busca inválido. Use apenas letras e números." }
  }

  try {
    const data = await fetchExternalVehicleApi(cleanTerm)
    return { data }
  } catch (error: any) {
    console.error("Erro ao buscar informações do veículo:", error)
    return { error: error.message || "Falha ao consultar informações do veículo." }
  }
}
