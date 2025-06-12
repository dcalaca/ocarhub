import { NextResponse } from "next/server"

export async function GET() {
  const debugInfo = {
    hasApiKey: !!process.env.INFOSIMPLES_API_KEY,
    apiKeyLength: process.env.INFOSIMPLES_API_KEY?.length || 0,
    apiKeyStart: process.env.INFOSIMPLES_API_KEY?.substring(0, 10) + "...",
    allEnvVars: Object.keys(process.env).filter(
      (key) => key.toLowerCase().includes("info") || key.toLowerCase().includes("simple"),
    ),
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(debugInfo)
}
