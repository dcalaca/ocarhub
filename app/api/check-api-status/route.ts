import { NextResponse } from "next/server"

export async function GET() {
  const hasApiKey = !!process.env.INFOSIMPLES_API_KEY

  return NextResponse.json({
    active: true,
    type: hasApiKey ? "real" : "simulada",
    timestamp: new Date().toISOString(),
  })
}
