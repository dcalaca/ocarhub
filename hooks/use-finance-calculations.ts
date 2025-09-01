"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { FinanceCalculation } from "@/lib/supabase-types"
import { useFinanceAuth } from "./use-finance-auth"

export function useFinanceCalculations() {
  const { user } = useFinanceAuth()
  const [calculations, setCalculations] = useState<FinanceCalculation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCalculations()
    } else {
      setCalculations([])
      setLoading(false)
    }
  }, [user])

  const fetchCalculations = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from("finance_calculations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar cálculos:", error)
    } else {
      setCalculations(data || [])
    }
    setLoading(false)
  }

  const saveCalculation = async (
    type: FinanceCalculation["type"],
    title: string,
    inputs: Record<string, any>,
    results: Record<string, any>,
    tags?: string[],
  ) => {
    if (!user) return { error: "Usuário não autenticado" }

    const { data, error } = await supabase
      .from("finance_calculations")
      .insert({
        user_id: user.id,
        type,
        title,
        inputs,
        results,
        tags: tags || [],
        is_favorite: false,
      })
      .select()
      .single()

    if (!error && data) {
      setCalculations((prev) => [data, ...prev])
    }

    return { data, error }
  }

  const updateCalculation = async (id: string, updates: Partial<FinanceCalculation>) => {
    if (!user) return { error: "Usuário não autenticado" }

    const { data, error } = await supabase
      .from("finance_calculations")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (!error && data) {
      setCalculations((prev) => prev.map((calc) => (calc.id === id ? data : calc)))
    }

    return { data, error }
  }

  const deleteCalculation = async (id: string) => {
    if (!user) return { error: "Usuário não autenticado" }

    const { error } = await supabase.from("finance_calculations").delete().eq("id", id).eq("user_id", user.id)

    if (!error) {
      setCalculations((prev) => prev.filter((calc) => calc.id !== id))
    }

    return { error }
  }

  const toggleFavorite = async (id: string) => {
    const calculation = calculations.find((calc) => calc.id === id)
    if (!calculation) return { error: "Cálculo não encontrado" }

    return updateCalculation(id, { is_favorite: !calculation.is_favorite })
  }

  const getCalculationsByType = (type: FinanceCalculation["type"]) => {
    return calculations.filter((calc) => calc.type === type)
  }

  const getFavoriteCalculations = () => {
    return calculations.filter((calc) => calc.is_favorite)
  }

  return {
    calculations,
    loading,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    toggleFavorite,
    getCalculationsByType,
    getFavoriteCalculations,
    refetch: fetchCalculations,
  }
}
