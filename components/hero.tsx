import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingUp, BookOpen, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Principal */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Transforme sua
              <span className="text-blue-600"> Vida Financeira</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Calculadoras avançadas, notícias em tempo real e educação gratuita para você tomar as melhores decisões
              financeiras
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/calculadoras">
                  <Calculator className="w-5 h-5 mr-2" />
                  Começar Agora
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/educacao">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Educação Gratuita
                </Link>
              </Button>
            </div>
          </div>

          {/* Cards de Recursos */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Calculadoras Avançadas</h3>
                <p className="text-slate-600 mb-4">
                  Ferramentas precisas para juros compostos, financiamentos, aposentadoria e muito mais
                </p>
                <Button variant="outline" asChild>
                  <Link href="/calculadoras">Explorar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Notícias em Tempo Real</h3>
                <p className="text-slate-600 mb-4">Acompanhe as principais notícias do mercado financeiro brasileiro</p>
                <Button variant="outline" asChild>
                  <Link href="/noticias">Ver Notícias</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Educação Gratuita</h3>
                <p className="text-slate-600 mb-4">6 aulas completas sobre educação financeira para toda a família</p>
                <Button variant="outline" asChild>
                  <Link href="/educacao">Aprender</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefícios */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Por que escolher o FinanceHub?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">100% Gratuito</h3>
                  <p className="text-slate-600 text-sm">Todas as ferramentas e conteúdos são completamente gratuitos</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Para Toda Família</h3>
                  <p className="text-slate-600 text-sm">
                    Conteúdo adaptado para diferentes idades e níveis de conhecimento
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Sempre Atualizado</h3>
                  <p className="text-slate-600 text-sm">Informações e ferramentas sempre atualizadas com o mercado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
