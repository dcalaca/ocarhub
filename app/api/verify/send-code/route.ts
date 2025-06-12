import { type NextRequest, NextResponse } from "next/server"
import { sendVerificationCode, isTwilioConfigured } from "@/lib/twilio/client"
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

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
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

    // Enviar código via Twilio
    const result = await sendVerificationCode(phone)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Código enviado com sucesso!",
      })
    } else {
      return NextResponse.json({ error: result.error || "Erro ao enviar código" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Erro na API send-code:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
