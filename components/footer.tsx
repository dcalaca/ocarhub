import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo e Descrição */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo.png"
              alt="FinanceHub"
              width={180}
              height={40}
              className="mb-4 brightness-0 invert h-8 w-auto"
            />
            <p className="text-slate-300 mb-6 text-sm sm:text-base leading-relaxed">
              Sua plataforma completa para decisões financeiras inteligentes.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 p-2">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 p-2">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 p-2">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 p-2">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Calculadoras */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Calculadoras</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link
                  href="/calculadoras/juros-compostos"
                  className="hover:text-white transition-colors text-sm sm:text-base"
                >
                  Juros Compostos
                </Link>
              </li>
              <li>
                <Link
                  href="/calculadoras/financiamento"
                  className="hover:text-white transition-colors text-sm sm:text-base"
                >
                  Financiamento
                </Link>
              </li>
              <li>
                <Link
                  href="/calculadoras/aposentadoria"
                  className="hover:text-white transition-colors text-sm sm:text-base"
                >
                  Aposentadoria
                </Link>
              </li>
              <li>
                <Link
                  href="/calculadoras/conversor-moedas"
                  className="hover:text-white transition-colors text-sm sm:text-base"
                >
                  Conversor de Moedas
                </Link>
              </li>
              <li>
                <Link
                  href="/calculadoras/orcamento"
                  className="hover:text-white transition-colors text-sm sm:text-base"
                >
                  Orçamento Mensal
                </Link>
              </li>
            </ul>
          </div>

          {/* Conteúdo */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Conteúdo</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link href="/noticias" className="hover:text-white transition-colors text-sm sm:text-base">
                  Notícias
                </Link>
              </li>
              <li>
                <Link href="/educacao" className="hover:text-white transition-colors text-sm sm:text-base">
                  Educação Financeira
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors text-sm sm:text-base">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors text-sm sm:text-base">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-slate-300 mb-4 text-sm sm:text-base">Receba dicas financeiras e notícias do mercado.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 flex-1"
              />
              <Button size="sm" className="w-full sm:w-auto">
                <Mail className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Inscrever</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm text-center md:text-left">
            © 2024 FinanceHub. Todos os direitos reservados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link href="/termos" className="text-slate-400 hover:text-white text-sm transition-colors text-center">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-slate-400 hover:text-white text-sm transition-colors text-center">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
