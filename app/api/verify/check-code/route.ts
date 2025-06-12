import { type NextRequest, NextResponse } from "next/server"
import { verifyCode, isTwilioConfigured } from "@/lib/twilio/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar se Twilio está configurado
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        {
          error: "Serviço de SMS não está configurado",
        },
        { status: 503 },
      )
    }

    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "Telefone e código são obrigatórios" }, { status: 400 })
    }

    // Verificar se usuário está logado
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Verificar código via Twilio
    const result = await verifyCode(phone, code)

    if (result.success) {
      // Atualizar status de verificação no banco
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          phone_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Erro ao atualizar perfil:", updateError)
      }

      return NextResponse.json({
        success: true,
        message: "Telefone verificado com sucesso!",
      })
    } else {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Erro na API check-code:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
