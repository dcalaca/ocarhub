import twilio from "twilio"

// Não verificar credenciais durante o build
function getTwilioCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !verifySid) {
    throw new Error("Twilio credentials are missing. Please check your environment variables.")
  }

  return { accountSid, authToken, verifySid }
}

function getTwilioClient() {
  const { accountSid, authToken } = getTwilioCredentials()
  return twilio(accountSid, authToken)
}

export async function sendVerificationCode(phoneNumber: string) {
  try {
    const { verifySid } = getTwilioCredentials()
    const client = getTwilioClient()

    // Formatar número para padrão internacional (+55)
    const formattedPhone = phoneNumber.startsWith("+55") ? phoneNumber : `+55${phoneNumber.replace(/\D/g, "")}`

    const verification = await client.verify.v2.services(verifySid).verifications.create({
      to: formattedPhone,
      channel: "sms",
    })

    return {
      success: true,
      status: verification.status,
      sid: verification.sid,
    }
  } catch (error: any) {
    console.error("Erro ao enviar SMS:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function verifyCode(phoneNumber: string, code: string) {
  try {
    const { verifySid } = getTwilioCredentials()
    const client = getTwilioClient()

    // Formatar número para padrão internacional (+55)
    const formattedPhone = phoneNumber.startsWith("+55") ? phoneNumber : `+55${phoneNumber.replace(/\D/g, "")}`

    const verificationCheck = await client.verify.v2.services(verifySid).verificationChecks.create({
      to: formattedPhone,
      code: code,
    })

    return {
      success: verificationCheck.status === "approved",
      status: verificationCheck.status,
    }
  } catch (error: any) {
    console.error("Erro ao verificar código:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Função para verificar se as credenciais estão configuradas
export function isTwilioConfigured(): boolean {
  try {
    getTwilioCredentials()
    return true
  } catch {
    return false
  }
}
