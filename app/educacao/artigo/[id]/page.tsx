import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, User, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EducationalArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  read_time: number
  author: string
  image_url: string
  published_at: string
  created_at: string
}

async function getArticle(id: string): Promise<EducationalArticle | null> {
  try {
    const { data: article, error } = await supabase
      .from("educational_articles")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Erro ao buscar artigo:", error)
      return null
    }

    return article
  } catch (error) {
    console.error("Erro ao conectar com o banco:", error)
    return null
  }
}

export default async function ArtigoPage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "Conceitos Básicos": "bg-blue-100 text-blue-800",
      Investimentos: "bg-green-100 text-green-800",
      "Planejamento Financeiro": "bg-purple-100 text-purple-800",
      Economia: "bg-orange-100 text-orange-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    } catch {
      return "Data não disponível"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/educacao" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Educação
            </Link>
          </Button>
        </div>

        {/* Cabeçalho do Artigo */}
        <Card className="mb-8">
          <div className="relative h-64 md:h-80 w-full">
            <Image
              src={article.image_url || "/placeholder.svg?height=400&width=800"}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <CardHeader className="pb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
              <div className="flex items-center text-sm text-slate-500">
                <Clock className="w-4 h-4 mr-1" />
                {article.read_time} min de leitura
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <User className="w-4 h-4 mr-1" />
                {article.author}
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(article.published_at)}
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {article.title}
            </CardTitle>
            <p className="text-lg text-slate-600 mt-4">{article.excerpt}</p>
          </CardHeader>
        </Card>

        {/* Conteúdo do Artigo */}
        <Card>
          <CardContent className="p-8">
            <div
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{
                __html: article.content.replace(/\n/g, "<br />").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </CardContent>
        </Card>

        {/* Navegação e Call to Action */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Gostou do conteúdo?</h3>
              <p className="text-slate-600 mb-4">
                Explore nossas calculadoras financeiras para colocar o conhecimento em prática.
              </p>
              <Button asChild className="w-full">
                <Link href="/calculadoras">Ver Calculadoras</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Quer mais conteúdo?</h3>
              <p className="text-slate-600 mb-4">
                Cadastre-se para receber novos artigos e dicas financeiras diretamente no seu e-mail.
              </p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/registro">Criar Conta Gratuita</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Voltar ao topo */}
        <div className="text-center mt-12">
          <Button variant="ghost" asChild>
            <Link href="/educacao">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para todos os artigos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
