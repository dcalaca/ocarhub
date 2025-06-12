import { LandingHeader } from "@/components/landing-header"
import {
  CheckCircle2,
  DollarSign,
  Car,
  Calculator,
  Wrench,
  History,
  FileText,
  Download,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <LandingHeader />

      {/* Logo em destaque para mobile */}
      <div className="md:hidden flex flex-col items-center justify-center pt-8 pb-4">
        <div className="relative w-32 h-32 mb-2">
          <Image src="/logo-ocar-final.png" alt="OcarHub Logo" fill className="object-contain" priority />
        </div>
        <h2 className="text-2xl font-bold">
          <span className="text-blue-500">Ocar</span>
          <span className="text-white">Hub</span>
        </h2>
        <p className="text-sm text-gray-300 mt-1">Consulta veicular completa</p>
      </div>

      <main className="flex-grow container mx-auto px-4 py-6 md:py-20 text-center flex flex-col items-center justify-center">
        {/* Logo para desktop (escondida em mobile) */}
        <div className="hidden md:block relative w-40 h-40 mb-6">
          <Image src="/logo-ocar-final.png" alt="OcarHub Logo" fill className="object-contain" priority />
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
          🔍 Consulta veicular completa em <span className="text-primary">segundos</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Está pensando em comprar ou vender um carro usado? Com o OcarHub, você acessa os dados reais e confiáveis do
          veículo antes de tomar qualquer decisão.
        </p>

        {/* Botões de ação em destaque para mobile */}
        <div className="w-full flex flex-col gap-3 mb-8 md:hidden">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg">Entrar</Button>
          </Link>
          <Link href="/auth/sign-up" className="w-full">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 py-6 text-lg">
              Criar Conta
            </Button>
          </Link>
        </div>

        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl text-left space-y-6 mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
            Com apenas a placa ou o chassi, você descobre:
          </h2>
          <ul className="list-disc list-inside text-lg text-gray-200 space-y-2">
            <li>Se o carro já foi de leilão</li>
            <li>Se passou por batidas ou sinistros</li>
            <li>Multas, IPVA, restrições judiciais e gravames ativos</li>
            <li>Quantos proprietários anteriores o veículo teve</li>
            <li>Se foi usado como táxi, frota, app ou viatura</li>
          </ul>
          <p className="text-lg text-gray-300 mt-6">
            Mostramos uma prévia gratuita e desbloqueamos o relatório completo com todos os detalhes por um valor
            acessível.
          </p>
        </div>

        {/* Seção de Funcionalidades ATUALIZADA - Sem funcionalidades não implementadas */}
        <section className="w-full max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">Nossas Funcionalidades</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Funcionalidades Gratuitas */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-green-500/30">
              <h3 className="text-2xl font-semibold text-green-400 mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-7 w-7" /> Gratuito
              </h3>
              <ul className="list-none space-y-4 text-gray-200">
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Consulta Básica de Veículo:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Marca, Modelo, Ano, Cor e dados básicos.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Simulador de Financiamento:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Calcule parcelas, juros e condições de financiamento.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Ficha Técnica Completa:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Motor, dimensões, consumo, potência e especificações.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Histórico de Consultas:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Acesse todas suas consultas anteriores.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Gerenciamento de Perfil:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Atualize dados pessoais e configurações da conta.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Cadastro de Veículos:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Salve seus veículos para acompanhamento contínuo.</p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Monitoramento de Débitos:</span>
                  </div>
                  <p className="text-sm text-gray-300 pl-7">Acompanhe IPVA, licenciamento e multas em tempo real.</p>
                </li>
              </ul>
            </div>

            {/* Funcionalidades Pagas */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-primary/30">
              <h3 className="text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
                <DollarSign className="h-7 w-7" /> Pago
              </h3>
              <ul className="list-none space-y-4 text-gray-200">
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">Relatório Veicular Completo:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Histórico detalhado de leilão, sinistro, roubo/furto, débitos, multas, gravames, KM e muito mais.
                  </p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    <span className="font-medium">Download em PDF:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Relatório completo em PDF profissional com identidade visual do OcarHub.
                  </p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium">Comparação FIPE:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Compare o valor do veículo com a tabela FIPE atualizada.
                  </p>
                </li>
                <li className="space-y-1">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <span className="font-medium">Histórico Detalhado:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Acesse o histórico completo de todas as consultas realizadas.
                  </p>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium mb-2">💰 Preço:</p>
                <p className="text-lg font-bold text-primary">Relatório completo: R$ 19,90</p>
                <p className="text-xs text-gray-400 mt-1">*Pagamento único por consulta</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl text-left space-y-6 mb-12">
          <h2 className="text-2xl md::text-3xl font-semibold text-primary mb-4">Por que escolher OcarHub?</h2>
          <ul className="list-disc list-inside text-lg text-gray-200 space-y-2">
            <li>🔒 Dados oficiais e atualizados dos órgãos competentes</li>
            <li>⚙️ Consulta 100% online, segura e instantânea</li>
            <li>👁️ Monitoramento contínuo dos seus veículos cadastrados</li>
            <li>📄 Relatórios profissionais em PDF para guardar ou compartilhar</li>
            <li>📱 Compatível com celular, tablet e computador</li>
            <li>🔄 Atualizações automáticas de débitos e situação veicular</li>
          </ul>
        </div>
      </main>
      <footer className="text-center py-8 border-t border-gray-700 text-gray-500">
        <p>&copy; {new Date().getFullYear()} OcarHub. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
