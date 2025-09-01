"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export function useFinanceAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase não configurado. Autenticação não disponível.")
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Erro ao obter sessão:", error)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!supabase) {
      console.error("Supabase não configurado")
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isSupabaseConfigured: isSupabaseConfigured(),
  }
}
