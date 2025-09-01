"use client"

import { useState, useEffect } from "react"
import { supabase, type Calculation } from "@/lib/supabase"
import { useAuth } from "./use-auth"

export function useCalculations() {
  const { user } = useAuth()
  const [calculations, setCalculations] = useState<Calculation[]>([])
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
      .from("calculations")
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
    type: Calculation["type"],
    title: string,
    inputs: Record<string, any>,
    results: Record<string, any>,
  ) => {
    if (!user) return { error: "Usuário não autenticado" }

    const { data, error } = await supabase
      .from("calculations")
      .insert({
        user_id: user.id,
        type,
        title,
        inputs,
        results,
      })
      .select()
      .single()

    if (!error && data) {
      setCalculations((prev) => [data, ...prev])
    }

    return { data, error }
  }

  const deleteCalculation = async (id: string) => {
    if (!user) return { error: "Usuário não autenticado" }

    const { error } = await supabase.from("calculations").delete().eq("id", id).eq("user_id", user.id)

    if (!error) {
      setCalculations((prev) => prev.filter((calc) => calc.id !== id))
    }

    return { error }
  }

  return {
    calculations,
    loading,
    saveCalculation,
    deleteCalculation,
    refetch: fetchCalculations,
  }
}
