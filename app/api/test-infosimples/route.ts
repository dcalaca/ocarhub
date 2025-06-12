import { type NextRequest, NextResponse } from "next/server"
import { queryInfosimples, InfosimplesServices } from "@/lib/infosimples/client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const placa = searchParams.get("placa") || "DYH8D46"

  try {
    console.log("🧪 TESTE: Testando API Infosimples com placa:", placa)

    const response = await queryInfosimples(InfosimplesServices.VEHICLE_DETRAN_SP, { placa: placa })

    return NextResponse.json({
      success: true,
      placa: placa,
      response: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("🧪 TESTE: Erro na API:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        placa: placa,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
