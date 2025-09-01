"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, PiggyBank, TrendingUp, Home, Coins, Percent, DollarSign, Target } from "lucide-react"
import Link from "next/link"

export default function CalculadorasPage() {
  const [activeCategory, setActiveCategory] = useState("Todos")

  const calculators = [
    {
      title: "Juros Compostos",
      description: "Calcule o crescimento do seu dinheiro ao longo do tempo com juros compostos",
      icon: TrendingUp,
      href: "/calculadoras/juros-compostos",
      color: "text-blue-600 bg-blue-100",
      category: "Investimentos",
    },
    {
      title: "Valor Presente e Futuro",
      description: "Calcule o valor presente e futuro de investimentos",
      icon: Calculator,
      href: "/calculadoras/valor-presente-futuro",
      color: "text-green-600 bg-green-100",
      category: "Investimentos",
    },
    {
      title: "Simulador de Financiamento",
      description: "Simule financiamentos imobiliários e veiculares com diferentes sistemas",
      icon: Home,
      href: "/calculadoras/financiamento",
      color: "text-purple-600 bg-purple-100",
      category: "Financiamentos",
    },
    {
      title: "Comparação de Investimentos",
      description: "Compare diferentes opções de investimento lado a lado",
      icon: Target,
      href: "/calculadoras/investimentos",
      color: "text-orange-600 bg-orange-100",
      category: "Investimentos",
    },
    {
      title: "Planejamento de Aposentadoria",
      description: "Planeje sua aposentadoria e calcule quanto precisa poupar",
      icon: PiggyBank,
      href: "/calculadoras/aposentadoria",
      color: "text-indigo-600 bg-indigo-100",
      category: "Planejamento",
    },
    {
      title: "Calculadora de Inflação",
      description: "Veja o impacto da inflação no poder de compra do seu dinheiro",
      icon: Percent,
      href: "/calculadoras/inflacao",
      color: "text-red-600 bg-red-100",
      category: "Economia",
    },
    {
      title: "Conversor de Moedas",
      description: "Converta moedas com cotações atualizadas em tempo real",
      icon: Coins,
      href: "/calculadoras/conversor-moedas",
      color: "text-yellow-600 bg-yellow-100",
      category: "Moedas",
    },
    {
      title: "Orçamento Mensal",
      description: "Organize suas finanças mensais com gráficos e relatórios",
      icon: DollarSign,
      href: "/calculadoras/orcamento",
      color: "text-teal-600 bg-teal-100",
      category: "Planejamento",
    },
  ]

  const categories = ["Todos", "Investimentos", "Financiamentos", "Planejamento", "Economia", "Moedas"]

  // Filtrar calculadoras baseado na categoria ativa
  const filteredCalculators =
    activeCategory === "Todos" ? calculators : calculators.filter((calc) => calc.category === activeCategory)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Calculadoras Financeiras</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ferramentas completas para suas decisões financeiras. Todas gratuitas e com resultados detalhados.
          </p>
        </div>

        {/* Filtros por Categoria */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === activeCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Contador de resultados */}
        <div className="text-center mb-6">
          <p className="text-slate-600">
            {activeCategory === "Todos"
              ? `Mostrando todas as ${calculators.length} calculadoras`
              : `${filteredCalculators.length} calculadora${filteredCalculators.length !== 1 ? "s" : ""} na categoria "${activeCategory}"`}
          </p>
        </div>

        {/* Grid de Calculadoras */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCalculators.map((calc) => {
            const Icon = calc.icon
            return (
              <Card key={calc.href} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl ${calc.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{calc.title}</CardTitle>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{calc.category}</span>
                  </div>
                  <CardDescription className="text-slate-600 leading-relaxed">{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={calc.href}>
                      <Calculator className="w-4 h-4 mr-2" />
                      Usar Calculadora
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredCalculators.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Calculator className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhuma calculadora encontrada</h3>
            <p className="text-slate-500">Não há calculadoras disponíveis para a categoria "{activeCategory}".</p>
          </div>
        )}

        {/* Seção de Ajuda */}
        <Card className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 border-0">
          <CardContent className="p-12 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Precisa de Ajuda?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Todas as calculadoras incluem explicações detalhadas das fórmulas utilizadas e exemplos práticos.
              Cadastre-se para salvar seus cálculos e acessar recursos avançados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/educacao">Ver Tutoriais</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/registro">Criar Conta Gratuita</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
