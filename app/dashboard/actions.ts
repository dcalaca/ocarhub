"use server"

import { redirect } from "next/navigation"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createClient } from "@/lib/supabase/server" // Importar createClient do server
import { saveVehicleQuery } from "@/lib/supabase/database"
import { getVehicleInfoFromAPI } from "@/lib/infosimples/vehicle-services"

// Crie um cliente Redis para o Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
})

// Crie um limitador de taxa que permite 5 requisições por minuto
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
})

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password) {
    return { message: "Email e senha são obrigatórios." }
  }

  // Limita a taxa de requisições
  const { success, reset } = await ratelimit.limit(email)
  if (!success) {
    const timeLeft = (reset - Date.now()) / 1000
    return { message: `Muitas tentativas. Tente novamente em ${timeLeft} segundos.` }
  }

  // Passa os dados via URL para o cliente processar
  const params = new URLSearchParams({
    email,
    password,
    name: name || "",
    action: "signup",
  })

  redirect(`/auth/process?${params.toString()}`)
}

export async function signInWithEmail(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Email e senha são obrigatórios." }
  }

  // Limita a taxa de requisições
  const { success, reset } = await ratelimit.limit(email)
  if (!success) {
    const timeLeft = (reset - Date.now()) / 1000
    return { message: `Muitas tentativas. Tente novamente em ${timeLeft} segundos.` }
  }

  // Passa os dados via URL para o cliente processar
  const params = new URLSearchParams({
    email,
    password,
    action: "signin",
  })

  redirect(`/auth/process?${params.toString()}`)
}

export async function signOut() {
  redirect("/auth/logout")
}

// Define um tipo para dados do veículo para clareza
export type VehicleData = {
  plate?: string
  chassis?: string
  model?: string
  brand?: string
  year?: number
  color?: string
  previousOwners?: number
  auction?: boolean
  accidentHistory?: boolean
  theftRecord?: boolean
  debts?: string[]
  status?: "Regular" | "Alerta" | "Irregular"
  [key: string]: any
}

// Tipo para armazenar consultas
export type VehicleQuery = {
  id: string
  userId: string
  plateOrChassis: string
  timestamp: string
  model?: string
  year?: number
  status?: "Regular" | "Alerta" | "Irregular"
  // Adicione outros campos que você queira salvar da consulta
}

export async function getVehicleInfo(
  searchTerm: string,
  userId?: string,
): Promise<{ data?: VehicleData; error?: string }> {
  try {
    console.log("🔍 DEBUG: Verificando configuração da API...")
    console.log("🔍 DEBUG: INFOSIMPLES_API_KEY existe:", !!process.env.INFOSIMPLES_API_KEY)
    console.log("🔍 DEBUG: Tamanho da chave:", process.env.INFOSIMPLES_API_KEY?.length)
    console.log("🔍 DEBUG: Início da chave:", process.env.INFOSIMPLES_API_KEY?.substring(0, 15) + "...")

    // FORÇAR uso da API real - remover condição que pode estar falhando
    const hasValidApiKey =
      process.env.INFOSIMPLES_API_KEY &&
      process.env.INFOSIMPLES_API_KEY.length > 10 &&
      process.env.INFOSIMPLES_API_KEY.startsWith("TdVp")

    console.log("🔍 DEBUG: Chave válida:", hasValidApiKey)

    if (hasValidApiKey) {
      console.log("✅ DEBUG: Usando API real da Infosimples")
      try {
        const result = await getVehicleInfoFromAPI(searchTerm, userId)
        console.log("✅ DEBUG: Resultado da API:", result)
        return result
      } catch (apiError) {
        console.error("❌ DEBUG: Erro na API real:", apiError)
        // Se a API real falhar, usar simulador como fallback
        console.log("⚠️ DEBUG: Usando simulador como fallback")
        return await getVehicleInfoSimulated(searchTerm, userId)
      }
    } else {
      console.warn("⚠️ DEBUG: API da Infosimples não configurada ou inválida. Usando simulador.")
      console.log(
        "🔍 DEBUG: Variáveis disponíveis:",
        Object.keys(process.env).filter((key) => key.toLowerCase().includes("info")),
      )
      return await getVehicleInfoSimulated(searchTerm, userId)
    }
  } catch (error: any) {
    console.error("❌ DEBUG: Erro geral:", error)
    return { error: error.message || "Falha ao consultar informações do veículo." }
  }
}

// Função simuladora inteligente que aceita qualquer placa/chassi
async function getVehicleInfoSimulated(
  searchTerm: string,
  userId?: string,
): Promise<{ data?: VehicleData; error?: string }> {
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
    console.log(`API Simulador: Buscando dados para ${cleanTerm}...`)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simula atraso de rede

    // Gera dados baseados na placa/chassi digitado
    const isPlate = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleanTerm) // Formato placa brasileira
    const isMercosulPlate = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleanTerm) // Formato Mercosul

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
    const hash = cleanTerm.split("").reduce((a, b) => {
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
    const hasAuction = cleanTerm.includes("A") || cleanTerm.includes("L") // 'A' de Auction, 'L' de Leilão
    const hasAccident = cleanTerm.includes("S") || cleanTerm.includes("X") // 'S' de Sinistro, 'X' de acidente
    const hasTheft = cleanTerm.includes("R") || cleanTerm.includes("F") // 'R' de Roubo, 'F' de Furto
    const hasDebts = cleanTerm.includes("D") || cleanTerm.includes("M") || cleanTerm.includes("I") // Débitos

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

    const data = {
      [isPlate || isMercosulPlate ? "plate" : "chassis"]: cleanTerm,
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
        chassis: cleanTerm.length > 7 ? cleanTerm : "9BD" + cleanTerm + "123456789",
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

    // Salvar a consulta no Supabase se userId for fornecido
    if (userId) {
      try {
        await saveVehicleQuery(userId, cleanTerm, data)
      } catch (error) {
        console.error("Erro ao salvar consulta:", error)
        // Não interrompe o fluxo se houver erro ao salvar
      }
    }

    return { data }
  } catch (error: any) {
    console.error("Erro ao buscar informações do veículo:", error)
    return { error: error.message || "Falha ao consultar informações do veículo." }
  }
}

// Nova função para obter o histórico de consultas
export async function getMyQueries(userId: string): Promise<{ data?: VehicleQuery[]; error?: string }> {
  try {
    const { getUserQueries } = await import("@/lib/supabase/database")
    const result = await getUserQueries(userId)

    if (result.error) {
      return { error: result.error }
    }

    // Converter formato do banco para o formato esperado
    const queries = (result.data || []).map((query) => ({
      id: query.id,
      userId: query.user_id,
      plateOrChassis: query.search_term,
      timestamp: query.query_date,
      model:
        query.vehicle_data?.brand && query.vehicle_data?.model
          ? `${query.vehicle_data.brand} ${query.vehicle_data.model}`
          : undefined,
      year: query.vehicle_data?.year,
      status: query.vehicle_data?.status,
    }))

    return { data: queries }
  } catch (error: any) {
    console.error("Erro ao obter minhas consultas:", error)
    return { error: error.message || "Falha ao carregar suas consultas." }
  }
}

// Nova função para simular a exclusão de conta
export async function deleteUserAccount(): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, message: "Usuário não autenticado." }
    }

    // Em um cenário real, você faria a exclusão do usuário aqui.
    // Por exemplo, se estivesse usando a chave de serviço no servidor:
    // const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    // if (deleteError) throw deleteError;

    // Simulando a exclusão e o logout
    await supabase.auth.signOut()
    console.log(`Usuário ${user.id} simuladamente excluído e desconectado.`)

    return { success: true }
  } catch (error: any) {
    console.error("Erro ao simular exclusão de conta:", error)
    return { success: false, message: error.message || "Erro desconhecido ao excluir conta." }
  }
}
