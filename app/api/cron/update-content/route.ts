import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔄 Iniciando atualização de conteúdo...")

    // Chamar a API de notícias
    const newsResponse = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/news/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    let newsResult = { success: false, count: 0 }
    if (newsResponse.ok) {
      newsResult = await newsResponse.json()
      console.log("✅ Notícias atualizadas:", newsResult)
    } else {
      console.error("❌ Erro ao atualizar notícias:", newsResponse.status)
    }

    // Chamar a API de artigos educacionais
    const articlesResponse = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/articles/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    let articlesResult = { success: false, count: 0 }
    if (articlesResponse.ok) {
      articlesResult = await articlesResponse.json()
      console.log("✅ Artigos atualizados:", articlesResult)
    } else {
      console.error("❌ Erro ao atualizar artigos:", articlesResponse.status)
    }

    const totalUpdated = (newsResult.count || 0) + (articlesResult.count || 0)

    return NextResponse.json({
      success: true,
      message: `Conteúdo atualizado com sucesso! ${totalUpdated} itens atualizados.`,
      timestamp: new Date().toISOString(),
      details: {
        news: {
          success: newsResult.success,
          count: newsResult.count || 0,
        },
        articles: {
          success: articlesResult.success,
          count: articlesResult.count || 0,
        },
      },
    })
  } catch (error) {
    console.error("❌ Erro na atualização de conteúdo:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET()
}
