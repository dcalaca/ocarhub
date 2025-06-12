import { queryInfosimples, InfosimplesServices } from "./client"
import { saveVehicleQuery } from "@/lib/supabase/database"
import type { VehicleData } from "@/app/dashboard/actions"

// Cache em memória para reduzir chamadas à API
const queryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hora

/**
 * Consulta informações de um veículo pela placa ou chassi
 * @param searchTerm Placa ou chassi do veículo
 * @param userId ID do usuário que está realizando a consulta
 * @returns Dados do veículo ou erro
 */
export async function getVehicleInfoFromAPI(
  searchTerm: string,
  userId?: string,
): Promise<{ data?: VehicleData; error?: string }> {
  console.log("🚗 API: Iniciando consulta para:", searchTerm)

  // Validação básica
  if (!searchTerm || searchTerm.trim().length < 3) {
    return { error: "Termo de busca muito curto. Digite pelo menos 3 caracteres." }
  }

  // Limpa e formata o termo de busca
  const cleanTerm = searchTerm
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")

  console.log("🚗 API: Termo limpo:", cleanTerm)

  if (cleanTerm.length < 3) {
    return { error: "Termo de busca inválido. Use apenas letras e números." }
  }

  // Verifica se há resultado em cache
  const cacheKey = `vehicle:${cleanTerm}`
  const cachedResult = queryCache.get(cacheKey)

  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    console.log("🚗 API: Usando resultado em cache para:", cleanTerm)
    if (userId) {
      try {
        await saveVehicleQuery(userId, cleanTerm, cachedResult.data)
      } catch (error) {
        console.error("Erro ao salvar consulta em cache:", error)
      }
    }
    return { data: cachedResult.data }
  }

  try {
    console.log("🚗 API: Fazendo chamada real para a Infosimples...")

    // Determina qual serviço usar com base no formato do termo
    const isPlate = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleanTerm)
    const isMercosulPlate = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleanTerm)

    console.log("🚗 API: É placa normal:", isPlate)
    console.log("🚗 API: É placa Mercosul:", isMercosulPlate)

    let service = InfosimplesServices.VEHICLE_SENATRAN
    let params: Record<string, any> = {}

    if (isPlate || isMercosulPlate) {
      // Consulta por placa - vamos tentar diferentes serviços
      service = InfosimplesServices.VEHICLE_DETRAN_SP
      params = { placa: cleanTerm }
      console.log("🚗 API: Usando serviço DETRAN SP com placa:", cleanTerm)
    } else {
      // Consulta por chassi
      service = InfosimplesServices.VEHICLE_SENATRAN
      params = { chassi: cleanTerm }
      console.log("🚗 API: Usando serviço SENATRAN com chassi:", cleanTerm)
    }

    // Faz a consulta na API
    console.log("🚗 API: Chamando queryInfosimples com:", { service, params })
    const response = await queryInfosimples(service, params)

    console.log("🚗 API: Resposta recebida:", {
      code: response.code,
      data_count: response.data_count,
      errors: response.errors,
    })

    if (response.data_count === 0) {
      console.log("🚗 API: Nenhum dado encontrado")
      return { error: "Nenhum dado encontrado para o termo informado." }
    }

    // Processa os dados recebidos da API
    const apiData = response.data[0]
    console.log("🚗 API: Dados da API:", apiData)

    // Mapeia os dados da API para o formato usado pelo OcarHub
    const vehicleData: VehicleData = mapApiDataToVehicleData(apiData, cleanTerm, service)

    console.log("🚗 API: Dados mapeados:", vehicleData)

    // Salva no cache
    queryCache.set(cacheKey, {
      data: vehicleData,
      timestamp: Date.now(),
    })

    // Salva a consulta no histórico se houver userId
    if (userId) {
      try {
        await saveVehicleQuery(userId, cleanTerm, vehicleData)
      } catch (error) {
        console.error("Erro ao salvar consulta:", error)
      }
    }

    return { data: vehicleData }
  } catch (error: any) {
    console.error("🚗 API: Erro ao buscar informações do veículo:", error)

    // Verifica se é um erro da API Infosimples
    if (error.code) {
      console.error("🚗 API: Código de erro:", error.code)
      // Códigos 600-622 são erros da API
      if (error.code >= 600) {
        return { error: `Erro na consulta: ${error.message}` }
      }
    }

    return { error: error.message || "Falha ao consultar informações do veículo." }
  }
}

/**
 * Mapeia os dados da API para o formato usado pelo OcarHub
 */
function mapApiDataToVehicleData(apiData: any, searchTerm: string, service: string): VehicleData {
  // Valores padrão
  const vehicleData: VehicleData = {
    plate: searchTerm,
    model: "Não informado",
    brand: "Não informado",
    year: new Date().getFullYear(),
    color: "Não informado",
    previousOwners: 0,
    auction: false,
    accidentHistory: false,
    theftRecord: false,
    debts: [],
    status: "Regular",
  }

  // Mapeia os campos com base no serviço utilizado
  if (service === InfosimplesServices.VEHICLE_DETRAN_SP) {
    // Mapeamento para DETRAN SP
    if (apiData.veiculo) {
      vehicleData.plate = apiData.veiculo.placa || searchTerm
      vehicleData.model = apiData.veiculo.modelo || "Não informado"
      vehicleData.brand = apiData.veiculo.marca || "Não informado"
      vehicleData.year = apiData.veiculo.ano_fabricacao || new Date().getFullYear()
      vehicleData.color = apiData.veiculo.cor || "Não informado"
    }

    // Verifica débitos e restrições
    const hasDebts =
      apiData.debitos &&
      (apiData.debitos.multas?.length > 0 ||
        apiData.debitos.ipva?.valor > 0 ||
        apiData.debitos.dpvat?.valor > 0 ||
        apiData.debitos.licenciamento?.valor > 0)

    const hasRestrictions = apiData.restricoes && apiData.restricoes.length > 0

    // Define status com base nos dados
    if (hasRestrictions) {
      vehicleData.status = "Irregular"
    } else if (hasDebts) {
      vehicleData.status = "Alerta"
    } else {
      vehicleData.status = "Regular"
    }

    // Adiciona débitos
    vehicleData.debts = []

    if (apiData.debitos?.ipva?.valor > 0) {
      vehicleData.debts.push(
        `IPVA ${apiData.debitos.ipva.exercicio} pendente - R$ ${apiData.debitos.ipva.valor.toFixed(2)}`,
      )
    } else {
      vehicleData.debts.push("IPVA em dia")
    }

    if (apiData.debitos?.licenciamento?.valor > 0) {
      vehicleData.debts.push(`Licenciamento pendente - R$ ${apiData.debitos.licenciamento.valor.toFixed(2)}`)
    } else {
      vehicleData.debts.push("Licenciamento em dia")
    }

    if (apiData.debitos?.multas?.length > 0) {
      apiData.debitos.multas.forEach((multa: any) => {
        vehicleData.debts.push(`Multa ${multa.auto_infracao || ""} - R$ ${multa.valor?.toFixed(2) || "0.00"}`)
      })
    }

    // Informações adicionais para o relatório completo
    vehicleData.commercializationRisk = hasRestrictions ? "Alto risco" : "Baixo risco"
    vehicleData.auctionData = "Sem registro de leilão"
    vehicleData.accidents = "Sem registros de batidas"
    vehicleData.kmHistory = "Não disponível"
    vehicleData.ownerHistory = ["Não disponível"]
    vehicleData.gravames = apiData.restricoes?.find((r: any) => r.tipo?.includes("ALIENACAO"))
      ? "Alienação fiduciária ativa"
      : "Sem gravames"

    vehicleData.restrictions = apiData.restricoes?.map((r: any) => r.tipo || "Restrição não especificada") || []
    vehicleData.renajudDetail = apiData.restricoes?.find((r: any) => r.tipo?.includes("RENAJUD"))
      ? "Bloqueio judicial ativo"
      : "Sem bloqueios Renajud"

    vehicleData.recall = "Sem recalls pendentes"
    vehicleData.auctionScore = "N/A"

    // Dados cadastrais
    vehicleData.nationalRegistry = {
      chassis: apiData.veiculo?.chassi || "Não informado",
      engine: apiData.veiculo?.motor || "Não informado",
      type: apiData.veiculo?.tipo || "Automóvel",
    }

    vehicleData.stateRegistry = {
      modifications: "Não disponível",
      colorChanges: "Não disponível",
      engineSwap: "Não disponível",
    }

    vehicleData.chassisDecoder = {
      country: "Brasil",
      manufacturer: vehicleData.brand,
      plant: "Não disponível",
      modelYear: vehicleData.year,
    }

    vehicleData.commonFailures = ["Dados não disponíveis"]

    vehicleData.pricing = {
      fipe: "Consulte a tabela FIPE",
      market: "Consulte o mercado",
    }

    vehicleData.priceGraph = "Dados não disponíveis"

    vehicleData.technicalSpecs = {
      engine: apiData.veiculo?.cilindrada || "Não informado",
      transmission: "Não informado",
      fuel: apiData.veiculo?.combustivel || "Não informado",
      consumption: "Não informado",
    }
  } else if (service === InfosimplesServices.VEHICLE_SENATRAN) {
    // Mapeamento para SENATRAN
    // Implementar quando tivermos acesso à estrutura de resposta
  }

  return vehicleData
}

/**
 * Consulta restrições de um veículo
 * @param plate Placa do veículo
 */
export async function getVehicleRestrictions(plate: string): Promise<any> {
  try {
    const response = await queryInfosimples(InfosimplesServices.VEHICLE_RESTRICTIONS, { placa: plate })
    return response.data[0]
  } catch (error) {
    console.error("Erro ao consultar restrições do veículo:", error)
    throw error
  }
}

/**
 * Consulta débitos de IPVA de um veículo em SP
 * @param plate Placa do veículo
 * @param renavam Renavam do veículo
 */
export async function getVehicleIPVA(plate: string, renavam: string): Promise<any> {
  try {
    const response = await queryInfosimples(InfosimplesServices.VEHICLE_IPVA_SP, {
      placa: plate,
      renavam: renavam,
    })
    return response.data[0]
  } catch (error) {
    console.error("Erro ao consultar IPVA do veículo:", error)
    throw error
  }
}
