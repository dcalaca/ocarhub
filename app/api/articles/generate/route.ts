import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Função para gerar imagem baseada no tema do artigo
function getArticleImage(category: string, title: string): string {
  const imageQueries = {
    Investimentos: [
      "investment portfolio financial planning",
      "stock market investment strategy",
      "financial growth investment",
      "money investment planning",
    ],
    "Planejamento Financeiro": [
      "financial planning budget management",
      "personal finance planning",
      "financial goals planning",
      "budget financial planning",
    ],
    "Educação Financeira": [
      "financial education learning",
      "money management education",
      "financial literacy education",
      "personal finance education",
    ],
    Aposentadoria: [
      "retirement planning financial",
      "pension financial planning",
      "retirement investment planning",
      "financial retirement strategy",
    ],
  }

  const queries = imageQueries[category as keyof typeof imageQueries] || imageQueries["Educação Financeira"]
  const randomQuery = queries[Math.floor(Math.random() * queries.length)]

  return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(randomQuery)}`
}

// Artigos educacionais atualizados
function generateEducationalArticles() {
  const articles = [
    {
      title: "Como Começar a Investir com Pouco Dinheiro em 2024",
      excerpt: "Descubra estratégias práticas para iniciar sua jornada de investimentos mesmo com valores pequenos",
      content: `
# Como Começar a Investir com Pouco Dinheiro em 2024

Muitas pessoas acreditam que é preciso ter muito dinheiro para começar a investir, mas isso não é verdade. Com as ferramentas e conhecimentos certos, é possível iniciar sua jornada de investimentos com valores pequenos.

## 1. Defina Seus Objetivos

Antes de investir, é fundamental definir:
- **Objetivos de curto prazo**: Reserva de emergência, viagem
- **Objetivos de médio prazo**: Compra de um carro, curso
- **Objetivos de longo prazo**: Aposentadoria, casa própria

## 2. Comece com a Reserva de Emergência

Antes de qualquer investimento, construa uma reserva equivalente a 6 meses de gastos essenciais. Use:
- **Poupança**: Para começar rapidamente
- **CDB com liquidez diária**: Melhor rentabilidade
- **Tesouro Selic**: Opção segura e rentável

## 3. Investimentos para Iniciantes

### Tesouro Direto
- **Valor mínimo**: A partir de R$ 30
- **Segurança**: Garantido pelo governo
- **Tipos**: Selic, Prefixado, IPCA+

### CDB (Certificado de Depósito Bancário)
- **Proteção**: Garantido pelo FGC até R$ 250.000
- **Rentabilidade**: Geralmente superior à poupança
- **Liquidez**: Varia conforme o produto

### Fundos de Investimento
- **Diversificação**: Acesso a carteira diversificada
- **Gestão profissional**: Especialistas cuidam dos investimentos
- **Valor mínimo**: Muitos fundos aceitam R$ 100

## 4. Estratégias Práticas

### Aporte Recorrente
- Invista um valor fixo mensalmente
- Use o débito automático
- Aproveite o custo médio

### Educação Contínua
- Leia livros sobre investimentos
- Acompanhe canais especializados
- Participe de cursos gratuitos

## 5. Erros Comuns a Evitar

- **Não ter objetivos claros**
- **Investir sem reserva de emergência**
- **Buscar rentabilidade muito alta sem conhecimento**
- **Não diversificar os investimentos**

## Conclusão

Começar a investir com pouco dinheiro é possível e necessário. O importante é dar o primeiro passo, manter a disciplina e continuar aprendendo. Lembre-se: o tempo é seu maior aliado nos investimentos.

*Comece hoje mesmo, mesmo que seja com R$ 50. O importante é começar!*
      `,
      category: "Investimentos",
      author: "Equipe FinanceHub",
      reading_time: 8,
    },
    {
      title: "Planejamento Financeiro Pessoal: Guia Completo 2024",
      excerpt: "Aprenda a organizar suas finanças pessoais com um método simples e eficaz",
      content: `
# Planejamento Financeiro Pessoal: Guia Completo 2024

O planejamento financeiro é a base para uma vida financeira saudável e próspera. Neste guia, você aprenderá um método simples e eficaz para organizar suas finanças.

## 1. Diagnóstico Financeiro

### Calcule seu Patrimônio Líquido
**Ativos** (o que você tem):
- Dinheiro em conta corrente e poupança
- Investimentos
- Imóveis
- Veículos
- Outros bens

**Passivos** (o que você deve):
- Cartão de crédito
- Financiamentos
- Empréstimos
- Outras dívidas

**Patrimônio Líquido = Ativos - Passivos**

## 2. Controle de Gastos

### Método 50-30-20
- **50%** para gastos essenciais (moradia, alimentação, transporte)
- **30%** para gastos pessoais (lazer, hobbies, compras)
- **20%** para poupança e investimentos

### Ferramentas de Controle
- **Planilhas**: Excel ou Google Sheets
- **Aplicativos**: GuiaBolso, Mobills, Organizze
- **Método envelope**: Separar dinheiro por categoria

## 3. Metas Financeiras SMART

Suas metas devem ser:
- **S**pecíficas: Clara e bem definida
- **M**ensuráveis: Possível de medir o progresso
- **A**tingíveis: Realista e possível
- **R**elevantes: Importante para você
- **T**emporais: Com prazo definido

### Exemplos de Metas
- **Curto prazo** (até 1 ano): Reserva de emergência de R$ 10.000
- **Médio prazo** (1-5 anos): Entrada de R$ 50.000 para apartamento
- **Longo prazo** (5+ anos): R$ 1 milhão para aposentadoria

## 4. Estratégias de Economia

### Reduza Gastos Fixos
- Renegocie planos de telefone e internet
- Avalie assinaturas e cancele as desnecessárias
- Compare preços de seguros anualmente

### Economize no Dia a Dia
- Faça lista de compras e siga-a
- Cozinhe mais em casa
- Use transporte público quando possível
- Aproveite promoções e cupons

## 5. Construindo Riqueza

### Aumente sua Renda
- **Renda ativa**: Promoção, trabalho extra, freelances
- **Renda passiva**: Investimentos, aluguéis, royalties

### Invista Consistentemente
- Comece com 10% da renda
- Aumente gradualmente para 20-30%
- Use aportes automáticos

## 6. Proteção Financeira

### Seguros Essenciais
- **Seguro de vida**: Protege a família
- **Seguro saúde**: Evita gastos médicos altos
- **Seguro residencial**: Protege o patrimônio

### Reserva de Emergência
- 6-12 meses de gastos essenciais
- Investida em produtos líquidos
- Separada dos outros investimentos

## Conclusão

O planejamento financeiro é um processo contínuo que requer disciplina e paciência. Comece implementando uma estratégia por vez e seja consistente. Lembre-se: pequenas mudanças hoje podem gerar grandes resultados no futuro.

*Sua jornada para a independência financeira começa agora!*
      `,
      category: "Planejamento Financeiro",
      author: "Equipe FinanceHub",
      reading_time: 12,
    },
    {
      title: "Aposentadoria: Como Se Preparar Financeiramente",
      excerpt: "Estratégias essenciais para garantir uma aposentadoria tranquila e confortável",
      content: `
# Aposentadoria: Como Se Preparar Financeiramente

A aposentadoria é uma das fases mais importantes da vida, e a preparação financeira adequada é fundamental para garantir tranquilidade e conforto neste período.

## 1. Entendendo a Previdência Social

### Regras Atuais (2024)
- **Idade mínima**: 65 anos (homens) e 62 anos (mulheres)
- **Tempo de contribuição**: 20 anos (homens) e 15 anos (mulheres)
- **Valor do benefício**: Baseado na média de todas as contribuições

### Limitações do INSS
- Teto de benefício limitado
- Regras podem mudar
- Valor pode não ser suficiente para manter padrão de vida

## 2. Calculando Sua Necessidade

### Regra dos 25x
Para ser financeiramente independente, você precisa de 25 vezes seus gastos anuais investidos.

**Exemplo:**
- Gastos mensais: R$ 5.000
- Gastos anuais: R$ 60.000
- Valor necessário: R$ 1.500.000

### Regra dos 4%
Você pode sacar 4% do patrimônio anualmente sem comprometer o capital.

## 3. Estratégias de Investimento

### Previdência Privada
**PGBL (Plano Gerador de Benefício Livre)**
- Dedução no IR até 12% da renda
- Ideal para quem faz declaração completa
- IR sobre todo valor no resgate

**VGBL (Vida Gerador de Benefício Livre)**
- Sem dedução no IR
- IR apenas sobre rendimentos
- Ideal para quem faz declaração simplificada

### Carteira Diversificada
**Conservadora (até 40 anos para aposentadoria)**
- 70% Renda Fixa
- 30% Renda Variável

**Moderada (20-40 anos para aposentadoria)**
- 50% Renda Fixa
- 50% Renda Variável

**Agressiva (mais de 40 anos para aposentadoria)**
- 30% Renda Fixa
- 70% Renda Variável

## 4. Produtos de Investimento

### Renda Fixa
- **Tesouro IPCA+**: Proteção contra inflação
- **CDB de longo prazo**: Rentabilidade atrativa
- **LCI/LCA**: Isenção de IR

### Renda Variável
- **Ações**: Potencial de crescimento
- **Fundos Imobiliários**: Renda passiva
- **ETFs**: Diversificação internacional

## 5. Planejamento por Idade

### 20-30 anos
- Foco em crescimento
- 80% renda variável
- Aportes mensais consistentes

### 30-40 anos
- Equilíbrio entre crescimento e segurança
- 60% renda variável, 40% renda fixa
- Aumento dos aportes

### 40-50 anos
- Proteção do patrimônio
- 40% renda variável, 60% renda fixa
- Maximização dos aportes

### 50+ anos
- Preservação de capital
- 20% renda variável, 80% renda fixa
- Planejamento da transição

## 6. Dicas Importantes

### Comece Cedo
- Juros compostos são poderosos
- Quanto antes começar, menor o esforço necessário
- R$ 200/mês aos 25 anos = R$ 1.000/mês aos 40 anos

### Seja Consistente
- Aportes regulares são fundamentais
- Use débito automático
- Trate como conta obrigatória

### Revise Periodicamente
- Ajuste estratégia conforme idade
- Rebalanceie carteira anualmente
- Acompanhe performance dos investimentos

## Conclusão

A aposentadoria confortável é resultado de planejamento e disciplina ao longo dos anos. Comece hoje, seja consistente e ajuste sua estratégia conforme necessário. Lembre-se: o melhor momento para começar foi ontem, o segundo melhor momento é agora.

*Sua aposentadoria dos sonhos depende das decisões que você toma hoje!*
      `,
      category: "Aposentadoria",
      author: "Equipe FinanceHub",
      reading_time: 15,
    },
  ]

  return articles.map((article) => ({
    ...article,
    image_url: getArticleImage(article.category, article.title),
    published_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Última semana
  }))
}

export async function GET() {
  try {
    console.log("📚 Iniciando geração de artigos educacionais...")

    // Limpar artigos antigos (manter apenas os últimos 15)
    const { error: deleteError } = await supabase
      .from("educational_articles")
      .delete()
      .not("id", "in", `(SELECT id FROM educational_articles ORDER BY published_at DESC LIMIT 15)`)

    if (deleteError) {
      console.log("⚠️ Aviso ao limpar artigos antigos:", deleteError.message)
    }

    // Gerar novos artigos
    const articlesToInsert = generateEducationalArticles()

    // Inserir artigos no Supabase
    const { data, error } = await supabase.from("educational_articles").insert(articlesToInsert).select()

    if (error) {
      console.error("❌ Erro ao inserir artigos:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ ${data?.length || 0} artigos inseridos com sucesso`)

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} artigos educacionais atualizados com sucesso`,
      count: data?.length || 0,
      timestamp: new Date().toISOString(),
      data: data?.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        author: item.author,
      })),
    })
  } catch (error) {
    console.error("❌ Erro na geração de artigos:", error)
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
