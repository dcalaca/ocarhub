import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

/**
 *  Criamos o supabaseClient como singleton para evitar múltiplas instâncias
 *  e garantimos que ele só existe no server (com variáveis seguras).
 */
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Variáveis SUPABASE_URL / SUPABASE_KEY não definidas.")
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

type NewsItem = {
  id: string
  title: string
  excerpt: string
  category: string
  source: string
  source_url: string
  image_url: string | null
  published_at: string
}

/**
 * Busca as 6 notícias mais recentes.
 * Se a tabela ainda não existir, devolve [] sem estourar erro.
 */
async function getLatestNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("financial_news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(6)

  // Tabela ainda não criada? – devolve vazio silenciosamente
  if (error) {
    if (error.code === "42P01") {
      console.info('[LatestNews] Tabela "financial_news" não encontrada. Rode o script SQL antes de popular notícias.')
      return []
    }
    // Qualquer outro erro é logado como warning, mas não quebra
    console.warn("[LatestNews] Erro ao buscar notícias:", error.message)
    return []
  }

  return data ?? []
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / (1000 * 60))
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs} h`
  const days = Math.floor(hrs / 24)
  return `há ${days} d`
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    Economia: "bg-blue-100 text-blue-800",
    Bolsa: "bg-green-100 text-green-800",
    Criptomoedas: "bg-orange-100 text-orange-800",
    Juros: "bg-purple-100 text-purple-800",
    "Finanças Pessoais": "bg-pink-100 text-pink-800",
  }
  return map[cat] || "bg-gray-100 text-gray-800"
}

/**
 * Componente Server: não usa 'use client'
 */
export async function LatestNews() {
  const news = await getLatestNews()

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Últimas Notícias</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Mantenha-se atualizado com as principais notícias do mercado financeiro
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-20 text-slate-500">Nenhuma notícia disponível ainda.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n) => (
              <Card key={n.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={n.image_url || "/placeholder.svg?height=200&width=300&query=news"}
                    alt={n.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={categoryColor(n.category)}>{n.category}</Badge>
                    <span className="flex items-center text-xs text-slate-500 gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(n.published_at)}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {n.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">{n.excerpt}</CardDescription>
                  <Button asChild variant="ghost" size="sm" className="p-0 h-auto">
                    <Link href={n.source_url} target="_blank" rel="noopener noreferrer">
                      Ler mais <ArrowRight className="w-4 h-4 ml-1 inline" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/noticias">Ver Todas as Notícias</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/* Exportação default também, para casos de import default */
export default LatestNews
