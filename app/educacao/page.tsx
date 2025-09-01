import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  AlertTriangle,
  Calculator,
} from "lucide-react"
import Link from "next/link"

const lessons = [
  {
    id: 1,
    title: "Primeiros Passos nas Finanças",
    description: "Aprenda o básico para organizar seu dinheiro",
    duration: "10 min",
    level: "Iniciante",
    icon: <PiggyBank className="w-6 h-6" />,
    content: {
      intro: "Vamos começar do zero! Finanças pessoais é simplesmente saber cuidar do seu dinheiro.",
      topics: [
        {
          title: "📊 Regra dos 50-30-20",
          content: `
**Como dividir sua renda:**
• 50% - Gastos essenciais (casa, comida, transporte)
• 30% - Gastos pessoais (lazer, roupas, restaurantes)  
• 20% - Poupança e investimentos

**Exemplo prático:**
Se você ganha R$ 3.000:
• R$ 1.500 para gastos essenciais
• R$ 900 para gastos pessoais
• R$ 600 para poupar/investir
          `,
        },
        {
          title: "💰 Controle de Gastos Simples",
          content: `
**Anote por 1 mês:**
• Café da manhã: R$ 8
• Almoço: R$ 25
• Uber: R$ 15
• Lanche: R$ 12
• Total do dia: R$ 60

**Você vai se assustar!** 
R$ 60/dia = R$ 1.800/mês só em "gastos pequenos"

**Dica de ouro:** Use o app do seu banco para ver onde o dinheiro vai
          `,
        },
        {
          title: "🚨 Reserva de Emergência",
          content: `
**Quanto guardar:** 3 a 6 meses dos seus gastos

**Exemplo:**
• Seus gastos mensais: R$ 2.500
• Reserva ideal: R$ 7.500 a R$ 15.000

**Onde guardar:**
• Poupança (fácil de sacar)
• CDB com liquidez diária
• Tesouro Selic

**Para que serve:** Perda de emprego, emergência médica, conserto do carro
          `,
        },
      ],
      actionPlan: "Comece anotando seus gastos por 7 dias. Você vai se surpreender!",
    },
  },
  {
    id: 2,
    title: "Investimentos para Iniciantes",
    description: "Descubra como fazer seu dinheiro crescer com segurança",
    duration: "15 min",
    level: "Iniciante",
    icon: <TrendingUp className="w-6 h-6" />,
    content: {
      intro: "Investir não é só para ricos! Com R$ 30 você já pode começar.",
      topics: [
        {
          title: "🏦 Investimentos Seguros (Renda Fixa)",
          content: `
**1. Poupança**
• Rendimento: 70% da Selic (hoje ≈ 7,5% ao ano)
• Vantagem: Sem imposto, saca quando quiser
• Desvantagem: Rende pouco

**2. CDB (Certificado de Depósito Bancário)**
• Rendimento: 90% a 120% do CDI (≈ 9% a 12% ao ano)
• Vantagem: Rende mais que poupança
• Desvantagem: Tem imposto (15% a 22,5%)

**3. Tesouro Direto**
• Rendimento: 10% a 12% ao ano
• Vantagem: Governo garante, baixo risco
• Tipos: Selic (renda variável), IPCA+ (protege da inflação)

**Exemplo prático:**
R$ 1.000 investidos por 1 ano:
• Poupança: R$ 1.075
• CDB 100% CDI: R$ 1.090
• Tesouro IPCA+: R$ 1.110
          `,
        },
        {
          title: "📈 Investimentos com Mais Risco (Renda Variável)",
          content: `
**1. Ações**
• O que é: Você vira "sócio" de empresas
• Exemplos: Itaú (ITUB4), Vale (VALE3), Magazine Luiza (MGLU3)
• Rendimento: Pode ser 15%, 30% ou perder dinheiro
• Dica: Comece com empresas conhecidas

**2. Fundos Imobiliários (FIIs)**
• O que é: Você investe em imóveis sem comprar
• Exemplos: Shopping centers, galpões, escritórios
• Rendimento: Recebe "aluguel" todo mês
• Vantagem: Diversificação automática

**3. ETFs (Fundos de Índice)**
• O que é: Cesta com várias ações
• Exemplo: BOVA11 (principais empresas do Brasil)
• Vantagem: Diversificação instantânea
• Ideal para: Quem não quer escolher ações
          `,
        },
        {
          title: "⚖️ Como Dividir seus Investimentos",
          content: `
**Perfil Conservador (baixo risco):**
• 80% Renda Fixa (CDB, Tesouro)
• 20% Renda Variável (ações, FIIs)

**Perfil Moderado (risco médio):**
• 60% Renda Fixa
• 40% Renda Variável

**Perfil Arrojado (alto risco):**
• 30% Renda Fixa
• 70% Renda Variável

**Regra de ouro:** Nunca coloque tudo em um lugar só!
          `,
        },
      ],
      actionPlan: "Abra conta em uma corretora (XP, Rico, Clear) e comece com R$ 100 no Tesouro Selic.",
    },
  },
  {
    id: 3,
    title: "O Poder dos Juros Compostos",
    description: "Veja como pequenos valores se transformam em fortunas",
    duration: "12 min",
    level: "Iniciante",
    icon: <Calculator className="w-6 h-6" />,
    content: {
      intro: "Einstein disse: 'Juros compostos são a oitava maravilha do mundo'. Vou te mostrar por quê!",
      topics: [
        {
          title: "🔢 O que são Juros Compostos?",
          content: `
**Juros Simples:** Rende sempre sobre o valor inicial
**Juros Compostos:** Rende sobre o valor + juros anteriores

**Exemplo com R$ 1.000 a 10% ao ano:**

**Juros Simples:**
• Ano 1: R$ 1.000 + R$ 100 = R$ 1.100
• Ano 2: R$ 1.100 + R$ 100 = R$ 1.200
• Ano 10: R$ 2.000

**Juros Compostos:**
• Ano 1: R$ 1.000 + R$ 100 = R$ 1.100
• Ano 2: R$ 1.100 + R$ 110 = R$ 1.210
• Ano 10: R$ 2.594

**Diferença:** R$ 594 a mais! E isso é só o começo...
          `,
        },
        {
          title: "💸 O Custo de NÃO Investir",
          content: `
**Cenário:** João vs Pedro (ambos 25 anos)

**João (investe cedo):**
• Investe R$ 300/mês dos 25 aos 35 anos (10 anos)
• Para de investir e deixa render até os 65 anos
• Total investido: R$ 36.000
• Resultado aos 65: R$ 1.897.224

**Pedro (investe tarde):**
• Investe R$ 300/mês dos 35 aos 65 anos (30 anos)
• Total investido: R$ 108.000
• Resultado aos 65: R$ 678.146

**João investiu 3x menos e tem quase 3x mais dinheiro!**
*Simulação com 10% ao ano*
          `,
        },
        {
          title: "🎯 Exemplos Práticos de Crescimento",
          content: `
**R$ 100/mês investidos a 10% ao ano:**

• 5 anos: R$ 7.744 (investiu R$ 6.000)
• 10 anos: R$ 20.484 (investiu R$ 12.000)
• 20 anos: R$ 75.937 (investiu R$ 24.000)
• 30 anos: R$ 226.049 (investiu R$ 36.000)

**R$ 500/mês investidos a 10% ao ano:**

• 10 anos: R$ 102.422
• 20 anos: R$ 379.684
• 30 anos: R$ 1.130.244

**Moral da história:** Comece HOJE, mesmo com pouco!
          `,
        },
      ],
      actionPlan: "Use nossa calculadora de juros compostos para simular seus investimentos!",
    },
  },
  {
    id: 4,
    title: "Planejando sua Aposentadoria",
    description: "Como garantir um futuro tranquilo financeiramente",
    duration: "18 min",
    level: "Intermediário",
    icon: <Target className="w-6 h-6" />,
    content: {
      intro: "A aposentadoria do INSS pode não ser suficiente. Vou te ensinar a se preparar!",
      topics: [
        {
          title: "📊 Realidade da Previdência Social",
          content: `
**Problemas do INSS:**
• Teto máximo: R$ 7.507,49 (2024)
• Idade mínima: 65 anos (homens), 62 anos (mulheres)
• Valor pode ser bem menor que seu salário atual

**Exemplo:**
• Seu salário hoje: R$ 8.000
• Aposentadoria INSS: R$ 4.500 (máximo)
• Diferença: R$ 3.500/mês a menos!

**Solução:** Complementar com investimentos próprios
          `,
        },
        {
          title: "💰 Quanto Você Precisa Juntar?",
          content: `
**Regra dos 25x:**
Multiplique seus gastos anuais por 25

**Exemplo:**
• Gastos mensais desejados: R$ 5.000
• Gastos anuais: R$ 60.000
• Patrimônio necessário: R$ 1.500.000

**Regra dos 4%:**
Retire 4% do patrimônio por ano
• R$ 1.500.000 × 4% = R$ 60.000/ano = R$ 5.000/mês

**Simulação por idade:**
Para juntar R$ 1.500.000 investindo a 8% ao ano:
• Começando aos 25: R$ 625/mês
• Começando aos 35: R$ 1.366/mês  
• Começando aos 45: R$ 3.455/mês
          `,
        },
        {
          title: "🎯 Estratégias por Idade",
          content: `
**20-30 anos (Foco: Crescimento)**
• 80% Ações/FIIs/ETFs
• 20% Renda Fixa
• Pode arriscar mais, tem tempo para recuperar

**30-40 anos (Foco: Equilíbrio)**
• 60% Renda Variável
• 40% Renda Fixa
• Balancear risco e segurança

**40-50 anos (Foco: Proteção)**
• 40% Renda Variável
• 60% Renda Fixa
• Reduzir riscos gradualmente

**50+ anos (Foco: Preservação)**
• 20% Renda Variável
• 80% Renda Fixa
• Priorizar segurança
          `,
        },
      ],
      actionPlan: "Use nossa calculadora de aposentadoria para descobrir quanto precisa investir mensalmente!",
    },
  },
  {
    id: 5,
    title: "Como Sair das Dívidas",
    description: "Estratégias práticas para quitar dívidas e se livrar dos juros",
    duration: "14 min",
    level: "Iniciante",
    icon: <AlertTriangle className="w-6 h-6" />,
    content: {
      intro: "Dívidas são o maior inimigo da sua liberdade financeira. Vou te ensinar a se livrar delas!",
      topics: [
        {
          title: "🚨 Conhecendo o Inimigo: Juros Altos",
          content: `
**Juros mensais no Brasil:**
• Cheque especial: 8% a 15% ao mês
• Cartão rotativo: 10% a 20% ao mês
• Crediário: 5% a 12% ao mês
• Empréstimo pessoal: 3% a 8% ao mês

**Exemplo assustador:**
Dívida de R$ 1.000 no cartão a 15% ao mês:
• Mês 1: R$ 1.150
• Mês 6: R$ 2.313
• Mês 12: R$ 5.350

**Por isso é URGENTE quitar dívidas caras!**
          `,
        },
        {
          title: "⚡ Método Bola de Neve",
          content: `
**Como funciona:**
1. Liste todas as dívidas da menor para maior valor
2. Pague o mínimo de todas
3. Concentre esforços na menor dívida
4. Quite a menor e passe para próxima

**Exemplo:**
• Cartão A: R$ 500 (pagar primeiro)
• Cartão B: R$ 1.200
• Financiamento: R$ 8.000

**Vantagem:** Motivação psicológica de ver dívidas sumindo
**Desvantagem:** Pode pagar mais juros no total
          `,
        },
        {
          title: "🎯 Método Avalanche",
          content: `
**Como funciona:**
1. Liste dívidas da maior para menor taxa de juros
2. Pague o mínimo de todas
3. Concentre esforços na de maior juros

**Exemplo:**
• Cartão rotativo: 15% ao mês (pagar primeiro)
• Empréstimo pessoal: 5% ao mês
• Financiamento: 1,5% ao mês

**Vantagem:** Paga menos juros no total
**Desvantagem:** Pode demorar para ver resultados

**Dica:** Use avalanche para juros altos, bola de neve para motivação
          `,
        },
        {
          title: "💡 Estratégias Extras",
          content: `
**1. Renda Extra:**
• Venda itens não usados
• Freelances e trabalhos extras
• Monetize hobbies (artesanato, culinária)

**2. Corte de Gastos:**
• Cancele assinaturas desnecessárias
• Cozinhe mais em casa
• Use transporte público
• Negocie contas (internet, celular)

**3. Negociação:**
• Ligue para credores e negocie desconto
• Feirões de negociação (até 90% desconto)
• Parcelamento com juros menores

**4. Empréstimo para Quitar:**
• Consignado (juros menores) para quitar cartão
• Empréstimo com garantia (imóvel/veículo)
          `,
        },
      ],
      actionPlan: "Faça uma lista de todas suas dívidas hoje mesmo e escolha seu método de quitação!",
    },
  },
  {
    id: 6,
    title: "Investimentos Avançados",
    description: "Estratégias para multiplicar seu patrimônio com inteligência",
    duration: "20 min",
    level: "Avançado",
    icon: <DollarSign className="w-6 h-6" />,
    content: {
      intro: "Agora que você domina o básico, vamos para estratégias mais sofisticadas!",
      topics: [
        {
          title: "🏢 Análise de Ações",
          content: `
**Análise Fundamentalista (longo prazo):**
• P/L (Preço/Lucro): Menor que 15 é bom
• ROE (Retorno sobre Patrimônio): Maior que 15%
• Dívida Líquida/EBITDA: Menor que 3
• Dividend Yield: Acima de 4%

**Empresas Sólidas para Iniciantes:**
• Bancos: Itaú (ITUB4), Bradesco (BBDC4)
• Consumo: Ambev (ABEV3), JBS (JBSS3)
• Utilities: Copel (CPLE6), Cemig (CMIG4)

**Diversificação por Setor:**
• 20% Bancos
• 20% Consumo
• 20% Commodities
• 20% Utilities
• 20% Tecnologia/Outros
          `,
        },
        {
          title: "🏠 Fundos Imobiliários (FIIs)",
          content: `
**Tipos de FIIs:**
• **Tijolo:** Imóveis físicos (shoppings, escritórios)
• **Papel:** CRIs, LCIs (recebíveis imobiliários)
• **Híbridos:** Mix de tijolo e papel

**FIIs Recomendados para Iniciantes:**
• HGLG11 (Cshg Logística)
• XPML11 (XP Malls)
• KNRI11 (Kinea Renda Imobiliária)

**Vantagens:**
• Dividendos mensais isentos de IR
• Diversificação automática
• Liquidez diária
• Gestão profissional

**Meta:** 10-20% da carteira em FIIs
          `,
        },
        {
          title: "🌍 Diversificação Internacional",
          content: `
**Por que investir no exterior:**
• Proteção cambial (dólar)
• Acesso a empresas globais
• Diversificação geográfica

**Como investir:**
• **BDRs:** Apple (AAPL34), Microsoft (MSFT34)
• **ETFs:** IVVB11 (S&P 500), BOVA11 (Ibovespa)
• **Fundos:** Multimercado com exposição externa

**Alocação Sugerida:**
• 70% Brasil
• 20% Estados Unidos
• 10% Mercados Emergentes

**Dica:** Comece com 10% internacional e aumente gradualmente
          `,
        },
        {
          title: "📈 Estratégias Avançadas",
          content: `
**1. Dollar Cost Averaging:**
• Invista valor fixo mensalmente
• Compra mais quando preço está baixo
• Reduz impacto da volatilidade

**2. Rebalanceamento:**
• Revise carteira a cada 6 meses
• Venda o que subiu muito
• Compre o que caiu
• Mantenha proporções desejadas

**3. Buy and Hold:**
• Compre empresas sólidas
• Mantenha por anos/décadas
• Reinvista dividendos
• Ignore volatilidade de curto prazo

**4. Escada de Vencimentos:**
• CDBs/Tesouro com vencimentos diferentes
• Parte vence todo ano
• Reinveste com juros atuais
• Reduz risco de taxa de juros
          `,
        },
      ],
      actionPlan: "Monte uma carteira diversificada com 60% renda fixa e 40% renda variável para começar!",
    },
  },
]

export default function EducacaoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Educação Financeira Gratuita</h1>
          <p className="text-xl text-slate-600 mb-6">6 aulas práticas para transformar sua vida financeira</p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>6 Aulas Completas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>1h30 de Conteúdo</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Linguagem Simples</span>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="space-y-8">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                      {lesson.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-600">Aula {lesson.id}</span>
                        <Badge
                          variant="secondary"
                          className={
                            lesson.level === "Iniciante"
                              ? "bg-green-100 text-green-800"
                              : lesson.level === "Intermediário"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {lesson.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-1">{lesson.title}</CardTitle>
                      <CardDescription className="text-base">{lesson.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Intro */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-900 font-medium">{lesson.content.intro}</p>
                </div>

                {/* Topics */}
                <div className="space-y-6">
                  {lesson.content.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-3 text-lg">{topic.title}</h4>
                      <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-line text-slate-700 leading-relaxed">{topic.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Plan */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Próximo Passo:</h4>
                      <p className="text-green-800">{lesson.content.actionPlan}</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                {lesson.id <= 3 && (
                  <div className="flex justify-center pt-4">
                    <Button asChild>
                      <Link href="/calculadoras">
                        <Calculator className="w-4 h-4 mr-2" />
                        Usar Calculadoras
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final CTA */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
            <CardContent className="p-12 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Pronto para colocar em prática?</h3>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Use nossas calculadoras financeiras para simular investimentos, planejar aposentadoria e tomar decisões
                inteligentes com seu dinheiro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/calculadoras">
                    <Calculator className="w-5 h-5 mr-2" />
                    Usar Calculadoras
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/noticias">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Ver Notícias do Mercado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
