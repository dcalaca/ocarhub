import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Verificar se há uma sessão ativa
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Erro ao obter sessão:', error)
      return NextResponse.json({ error: 'Erro ao verificar sessão' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    return NextResponse.json({ 
      session: {
        user: session.user,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Erro no endpoint de sessão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json()
    
    if (!refresh_token) {
      return NextResponse.json({ error: 'Refresh token é obrigatório' }, { status: 400 })
    }

    // Tentar renovar o token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })

    if (error) {
      console.error('Erro ao renovar sessão:', error)
      return NextResponse.json({ error: 'Token de refresh inválido' }, { status: 401 })
    }

    return NextResponse.json({ 
      session: {
        user: data.session?.user,
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao renovar sessão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
