/**
 * Cliente para integração com a API da Infosimples
 * Documentação: https://api.infosimples.com/
 */

// Constantes
const API_BASE_URL = "https://api.infosimples.com/api/v2/consultas/"
const API_TOKEN = process.env.INFOSIMPLES_API_KEY
const DEFAULT_TIMEOUT = 60 // segundos

// Tipos
export interface InfosimplesResponse {
  code: number
  code_message: string
  data: any[]
  data_count: number
  errors: string[]
  site_receipts: string[]
  header: {
    api_version: string
    product: string
    service: string
    parameters: Record<string, any>
    client_name: string
    token_name: string
    billable: boolean
    price: number
    requested_at: string
    elapsed_time_in_milliseconds: number
    remote_ip: string
    signature: string
  }
}

export interface InfosimplesError {
  code: number
  message: string
  errors?: string[]
}

/**
 * Realiza uma consulta na API da Infosimples
 * @param service Nome do serviço a ser consultado
 * @param params Parâmetros da consulta
 * @param timeout Timeout em segundos
 * @returns Resposta da API
 */
export async function queryInfosimples(
  service: string,
  params: Record<string, any> = {},
  timeout: number = DEFAULT_TIMEOUT,
): Promise<InfosimplesResponse> {
  try {
    if (!API_TOKEN) {
      throw new Error("Token da API Infosimples não configurado")
    }

    const url = `${API_BASE_URL}${service}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: API_TOKEN,
        timeout,
        ...params,
      }),
    })

    const data = await response.json()

    // Verifica se a resposta contém erros
    if (data.code !== 200) {
      console.error(`Erro na API Infosimples (${data.code}): ${data.code_message}`, data.errors)
      throw {
        code: data.code,
        message: data.code_message,
        errors: data.errors,
      }
    }

    return data
  } catch (error) {
    console.error("Erro ao consultar API Infosimples:", error)
    throw error
  }
}

/**
 * Serviços disponíveis na API da Infosimples
 */
export const InfosimplesServices = {
  // Consultas veiculares
  VEHICLE_SENATRAN: "senatran/meus-veiculos-comp",
  VEHICLE_DETRAN_SP: "detran/sp/debitos",
  VEHICLE_DETRAN_RJ: "detran/rj/veiculo",
  VEHICLE_DETRAN_MG: "detran/mg/multas-extrato",

  // Débitos e restrições
  VEHICLE_RESTRICTIONS: "detran/restricoes",
  VEHICLE_DEBTS_SP: "sefaz/sp/debitos-veiculo",
  VEHICLE_IPVA_SP: "sefaz/sp/emissao-guias-ipva",

  // Validação de documentos
  CPF_VALIDATION: "receita-federal/cpf",
  CNPJ_VALIDATION: "receita-federal/cnpj",
}
