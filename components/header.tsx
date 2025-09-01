"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Calculator, TrendingUp, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFinanceAuth } from "@/hooks/use-finance-auth"
import { isSupabaseConfigured } from "@/lib/supabase"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCalculatorDropdownOpen, setIsCalculatorDropdownOpen] = useState(false)
  const { user, signOut } = useFinanceAuth()

  const calculators = [
    { name: "Juros Compostos", href: "/calculadoras/juros-compostos", icon: "📈" },
    { name: "Valor Presente/Futuro", href: "/calculadoras/valor-presente-futuro", icon: "⏳" },
    { name: "Financiamento", href: "/calculadoras/financiamento", icon: "🏠" },
    { name: "Aposentadoria", href: "/calculadoras/aposentadoria", icon: "👴" },
    { name: "Investimentos", href: "/calculadoras/investimentos", icon: "💰" },
    { name: "Inflação", href: "/calculadoras/inflacao", icon: "📊" },
    { name: "Conversor de Moedas", href: "/calculadoras/conversor-moedas", icon: "💱" },
    { name: "Orçamento", href: "/calculadoras/orcamento", icon: "📋" },
  ]

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FinanceHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Calculadoras Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCalculatorDropdownOpen(!isCalculatorDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculadoras</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isCalculatorDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                    {calculators.map((calc) => (
                      <Link
                        key={calc.href}
                        href={calc.href}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsCalculatorDropdownOpen(false)}
                      >
                        <span className="text-lg">{calc.icon}</span>
                        <span className="text-sm">{calc.name}</span>
                      </Link>
                    ))}
                    <div className="border-t mt-2 pt-2">
                      <Link
                        href="/calculadoras"
                        className="flex items-center space-x-3 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        onClick={() => setIsCalculatorDropdownOpen(false)}
                      >
                        <span className="text-lg">🧮</span>
                        <span className="text-sm">Ver Todas</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/noticias" className="text-gray-700 hover:text-blue-600 transition-colors">
                Notícias
              </Link>
              <Link href="/educacao" className="text-gray-700 hover:text-blue-600 transition-colors">
                Educação
              </Link>
            </nav>

            {/* Auth Buttons - Only show if Supabase is configured */}
            <div className="hidden md:flex items-center space-x-4">
              {isSupabaseConfigured() ? (
                user ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={signOut}>
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/registro">
                      <Button size="sm">Cadastrar</Button>
                    </Link>
                  </div>
                )
              ) : null}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <Link
                href="/calculadoras"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calculator className="w-4 h-4" />
                <span>Calculadoras</span>
              </Link>
              <Link
                href="/noticias"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                <span>Notícias</span>
              </Link>
              <Link
                href="/educacao"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                <span>Educação</span>
              </Link>

              {/* Auth buttons for mobile - Only show if Supabase is configured */}
              {isSupabaseConfigured() && (
                <div className="border-t pt-2 mt-2">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Entrar
                      </Link>
                      <Link
                        href="/registro"
                        className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Cadastrar
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg border-t md:hidden">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
          <div className="flex space-x-4 min-w-max">
            {calculators.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="flex flex-col items-center justify-center min-w-[80px] px-3 py-2 text-center hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
              >
                <span className="text-lg mb-1">{calc.icon}</span>
                <span className="text-xs text-gray-600 leading-tight">{calc.name.split(" ")[0]}</span>
              </Link>
            ))}
            <Link
              href="/calculadoras"
              className="flex flex-col items-center justify-center min-w-[80px] px-3 py-2 text-center hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
            >
              <span className="text-lg mb-1">🧮</span>
              <span className="text-xs text-blue-600 font-medium leading-tight">Todas</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Add padding to body to account for mobile bottom nav */}
      <div className="pb-20 md:pb-0"></div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}
