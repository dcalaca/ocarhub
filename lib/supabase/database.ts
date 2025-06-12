import { createClient } from "@/lib/supabase/client"

export type UserVehicle = {
  id: string
  user_id: string
  plate: string
  brand?: string
  model?: string
  year?: number
  color?: string
  chassis?: string
  renavam?: string
  fuel_type?: string
  created_at: string
  updated_at: string
}

export type VehicleDebt = {
  id: string
  vehicle_id: string
  user_id: string
  debt_type: "ipva" | "licensing" | "fine"
  description: string
  amount: number
  due_date: string
  status: "pending" | "paid" | "overdue"
  fine_code?: string
  created_at: string
  updated_at: string
}

export type DownloadedDocument = {
  id: string
  user_id: string
  vehicle_id: string
  document_type: "crlv" | "receipt" | "report"
  document_name: string
  plate: string
  vehicle_info: any
  download_date: string
  file_size?: number
  metadata: any
}

export type VehicleQuery = {
  id: string
  user_id: string
  plate: string
  query_type: "basic" | "complete" | "fipe"
  vehicle_data: any
  query_date: string
  cost: number
}

// Função para verificar se as tabelas existem
async function checkTablesExist(): Promise<boolean> {
  try {
    const supabase = createClient()

    // Tenta fazer uma consulta simples para verificar se a tabela existe
    const { error } = await supabase.from("user_vehicles").select("id").limit(1)

    // Se não há erro, a tabela existe
    return !error
  } catch (error) {
    console.log("Tabelas ainda não foram criadas:", error)
    return false
  }
}

// Funções para gerenciar veículos
export async function saveUserVehicle(
  vehicleData: any,
  userId: string,
): Promise<{ data?: UserVehicle; error?: string }> {
  try {
    const supabase = createClient()

    // Verificar se o veículo já existe para este usuário
    const { data: existingVehicle } = await supabase
      .from("user_vehicles")
      .select("id")
      .eq("user_id", userId)
      .eq("plate", vehicleData.plate)
      .single()

    if (existingVehicle) {
      return { error: "Veículo já cadastrado para este usuário" }
    }

    const vehicleRecord = {
      user_id: userId,
      plate: vehicleData.plate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      color: vehicleData.color,
      chassis: vehicleData.chassis,
      renavam: vehicleData.renavam || `${Math.random().toString().substring(2, 13)}`,
      fuel_type: vehicleData.fuel_type || "Flex",
    }

    const { data, error } = await supabase.from("user_vehicles").insert([vehicleRecord]).select().single()

    if (error) {
      console.error("Erro ao salvar veículo:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Erro ao salvar veículo:", error)
    return { error: error.message }
  }
}

export async function getUserVehicles(userId: string): Promise<{ data?: UserVehicle[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("user_vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar veículos:", error)
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Erro ao carregar veículos:", error)
    return { data: [] }
  }
}

export async function deleteUserVehicle(vehicleId: string, userId: string): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("user_vehicles").delete().eq("id", vehicleId).eq("user_id", userId)

    if (error) {
      console.error("Erro ao deletar veículo:", error)
      return { error: error.message }
    }

    return {}
  } catch (error: any) {
    console.error("Erro ao deletar veículo:", error)
    return { error: error.message }
  }
}

// Funções para gerenciar débitos
export async function saveVehicleDebts(vehicleId: string, userId: string, debts: any[]): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    // Primeiro, deletar débitos existentes para este veículo
    await supabase.from("vehicle_debts").delete().eq("vehicle_id", vehicleId).eq("user_id", userId)

    if (debts.length === 0) {
      return {}
    }

    const debtRecords = debts.map((debt) => ({
      vehicle_id: vehicleId,
      user_id: userId,
      debt_type: debt.type === "license" ? "licensing" : debt.type,
      description: debt.description,
      amount: debt.amount,
      due_date: debt.dueDate,
      status: debt.status || "pending",
      fine_code: debt.fine_code || null,
    }))

    const { error } = await supabase.from("vehicle_debts").insert(debtRecords)

    if (error) {
      console.error("Erro ao salvar débitos:", error)
      return { error: error.message }
    }

    return {}
  } catch (error: any) {
    console.error("Erro ao salvar débitos:", error)
    return { error: error.message }
  }
}

export async function getVehicleDebts(vehicleId: string): Promise<{ data?: VehicleDebt[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("vehicle_debts")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Erro ao carregar débitos:", error)
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Erro ao carregar débitos:", error)
    return { data: [] }
  }
}

export async function updateDebtStatus(
  debtId: string,
  status: "pending" | "paid" | "overdue",
): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("vehicle_debts").update({ status }).eq("id", debtId)

    if (error) {
      console.error("Erro ao atualizar status do débito:", error)
      return { error: error.message }
    }

    return {}
  } catch (error: any) {
    console.error("Erro ao atualizar status do débito:", error)
    return { error: error.message }
  }
}

// Funções para gerenciar documentos baixados
export async function saveDownloadedDocument(
  userId: string,
  vehicleId: string,
  documentType: "crlv" | "receipt" | "report",
  documentName: string,
  plate: string,
  vehicleInfo?: any,
  metadata?: any,
): Promise<{ data?: DownloadedDocument; error?: string }> {
  try {
    const supabase = createClient()

    const documentRecord = {
      user_id: userId,
      vehicle_id: vehicleId,
      document_type: documentType,
      document_name: documentName,
      plate: plate,
      vehicle_info: vehicleInfo || {},
      metadata: metadata || {},
    }

    const { data, error } = await supabase.from("downloaded_documents").insert([documentRecord]).select().single()

    if (error) {
      console.error("Erro ao salvar documento:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Erro ao salvar documento:", error)
    return { error: error.message }
  }
}

export async function getUserDownloadedDocuments(
  userId: string,
): Promise<{ data?: DownloadedDocument[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("downloaded_documents")
      .select(`
        *,
        user_vehicles (
          plate,
          brand,
          model,
          year
        )
      `)
      .eq("user_id", userId)
      .order("download_date", { ascending: false })

    if (error) {
      console.error("Erro ao carregar documentos:", error)
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Erro ao carregar documentos:", error)
    return { data: [] }
  }
}

// Funções para gerenciar consultas
export async function saveVehicleQuery(
  userId: string,
  plate: string,
  queryType: "basic" | "complete" | "fipe",
  vehicleData: any,
  cost = 0,
): Promise<{ error?: string }> {
  try {
    const supabase = createClient()

    const queryRecord = {
      user_id: userId,
      plate: plate,
      query_type: queryType,
      vehicle_data: vehicleData,
      cost: cost,
    }

    const { error } = await supabase.from("vehicle_queries").insert([queryRecord])

    if (error) {
      console.error("Erro ao salvar consulta:", error)
      return { error: error.message }
    }

    return {}
  } catch (error: any) {
    console.error("Erro ao salvar consulta:", error)
    return { error: error.message }
  }
}

export async function getUserQueries(userId: string): Promise<{ data?: VehicleQuery[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("vehicle_queries")
      .select("*")
      .eq("user_id", userId)
      .order("query_date", { ascending: false })
      .limit(50) // Limita a 50 consultas mais recentes

    if (error) {
      console.error("Erro ao carregar consultas:", error)
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Erro ao carregar consultas:", error)
    return { data: [] }
  }
}

// Função para obter estatísticas do usuário
export async function getUserStats(userId: string): Promise<{
  data?: {
    totalVehicles: number
    totalDebts: number
    totalQueries: number
    totalDocuments: number
  }
  error?: string
}> {
  try {
    const supabase = createClient()

    const [vehiclesResult, debtsResult, queriesResult, documentsResult] = await Promise.all([
      supabase.from("user_vehicles").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("vehicle_debts").select("id", { count: "exact" }).eq("user_id", userId).eq("status", "pending"),
      supabase.from("vehicle_queries").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("downloaded_documents").select("id", { count: "exact" }).eq("user_id", userId),
    ])

    return {
      data: {
        totalVehicles: vehiclesResult.count || 0,
        totalDebts: debtsResult.count || 0,
        totalQueries: queriesResult.count || 0,
        totalDocuments: documentsResult.count || 0,
      },
    }
  } catch (error: any) {
    console.error("Erro ao carregar estatísticas:", error)
    return { error: error.message }
  }
}
