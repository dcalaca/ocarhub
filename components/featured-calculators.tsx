import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, PiggyBank, TrendingUp, Home, Coins, Percent } from "lucide-react"
import Link from "next/link"

export function FeaturedCalculators() {
  const calculators = [
    {
      title: "Juros Compostos",
      description: "Calcule o crescimento do seu dinheiro ao longo do tempo",
      icon: TrendingUp,
      href: "/calculadoras/juros-compostos",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Simulador de Financiamento",
      description: "Simule financiamentos imobiliários e veiculares",
      icon: Home,
      href: "/calculadoras/financiamento",
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Planejamento de Aposentadoria",
      description: "Planeje sua aposentadoria com segurança",
      icon: PiggyBank,
      href: "/calculadoras/aposentadoria",
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Conversor de Moedas",
      description: "Converta moedas com cotações em tempo real",
      icon: Coins,
      href: "/calculadoras/conversor-moedas",
      color: "text-orange-600 bg-orange-100",
    },
    {
      title: "Calculadora de Inflação",
      description: "Veja o impacto da inflação no seu dinheiro",
      icon: Percent,
      href: "/calculadoras/inflacao",
      color: "text-red-600 bg-red-100",
    },
    {
      title: "Orçamento Mensal",
      description: "Organize suas finanças mensais com gráficos",
      icon: Calculator,
      href: "/calculadoras/orcamento",
      color: "text-indigo-600 bg-indigo-100",
    },
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Calculadoras Mais Populares
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Ferramentas práticas para suas decisões financeiras do dia a dia
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {calculators.map((calc) => {
            const Icon = calc.icon
            return (
              <Card key={calc.href} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${calc.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl leading-tight">{calc.title}</CardTitle>
                  <CardDescription className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {calc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full h-11 text-base font-medium">
                    <Link href={calc.href}>Usar Calculadora</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="bg-white/80 backdrop-blur text-base px-8 py-3">
            <Link href="/calculadoras">Ver Todas as Calculadoras</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
