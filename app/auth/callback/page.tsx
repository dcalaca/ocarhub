"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { loadUserData } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro no callback:', error)
          router.push('/login?error=callback_error')
          return
        }

        if (data.session?.user) {
          console.log('✅ Usuário autenticado via Google:', data.session.user.id)
          await loadUserData(data.session.user.id)
          router.push('/')
        } else {
          console.log('❌ Nenhuma sessão encontrada')
          router.push('/login')
        }
      } catch (error) {
        console.error('❌ Erro no callback:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router, loadUserData])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-white">Processando login com Google...</p>
      </div>
    </div>
  )
}
