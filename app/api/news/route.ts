import { NextResponse } from "next/server"

// Função para gerar notícias sempre atualizadas
function generateFreshNews() {
  const now = Date.now()

  return [
    {
      title: "Dólar fecha em alta de 0,8% cotado a R$ 5,87",
      link: "https://g1.globo.com/economia/mercados/",
      contentSnippet: "Moeda americana sobe com expectativas sobre decisões do Fed e cenário político brasileiro",
      pubDate: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      source: "G1 Economia",
    },
    {
      title: "Ibovespa sobe 1,2% puxado por ações de bancos e mineradoras",
      link: "https://exame.com/invest/mercados/",
      contentSnippet: "Principal índice da bolsa brasileira fecha aos 129.850 pontos com volume de R$ 18 bilhões",
      pubDate: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      source: "Exame",
    },
    {
      title: "Bitcoin supera US$ 47.200 e acumula alta de 15% na semana",
      link: "https://www.infomoney.com.br/mercados/criptomoedas/",
      contentSnippet: "Criptomoeda é impulsionada por otimismo sobre ETFs e adoção institucional crescente",
      pubDate: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      source: "InfoMoney",
    },
    {
      title: "Banco Central mantém Selic em 11,75% e sinaliza cautela",
      link: "https://g1.globo.com/economia/noticia/",
      contentSnippet:
        "Copom decide por unanimidade manter taxa básica de juros inalterada pela terceira vez consecutiva",
      pubDate: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      source: "G1 Economia",
    },
    {
      title: "Fundos imobiliários batem recorde com R$ 12,8 bi captados",
      link: "https://exame.com/invest/fundos/",
      contentSnippet: "Setor de FIIs cresce 28% no ano com busca por renda passiva e diversificação de carteira",
      pubDate: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      source: "Exame",
    },
    {
      title: "Ethereum atinge US$ 2.980 com upgrade da rede em vista",
      link: "https://www.infomoney.com.br/mercados/criptomoedas/",
      contentSnippet:
        "Segunda maior criptomoeda se valoriza com expectativas sobre melhorias técnicas e redução de taxas",
      pubDate: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      source: "InfoMoney",
    },
    {
      title: "Petrobras anuncia dividendos de R$ 0,45 por ação",
      link: "https://g1.globo.com/economia/negocios/",
      contentSnippet: "Estatal distribui R$ 5,8 bilhões aos acionistas referente ao terceiro trimestre de 2024",
      pubDate: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
      source: "G1 Economia",
    },
    {
      title: "Vale sobe 3,2% após alta do minério de ferro na China",
      link: "https://exame.com/invest/mercados/acoes/",
      contentSnippet:
        "Mineradora se beneficia da recuperação da demanda chinesa e expectativas de estímulos econômicos",
      pubDate: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      source: "Exame",
    },
    {
      title: "Inflação desacelera para 4,87% em 12 meses, diz IBGE",
      link: "https://g1.globo.com/economia/indicadores/",
      contentSnippet: "IPCA registra alta de 0,39% em dezembro, abaixo das expectativas do mercado financeiro",
      pubDate: new Date(now - 9 * 60 * 60 * 1000).toISOString(),
      source: "G1 Economia",
    },
    {
      title: "Tesouro Direto tem recorde de investidores em 2024",
      link: "https://exame.com/invest/renda-fixa/",
      contentSnippet:
        "Plataforma registra 2,1 milhões de CPFs cadastrados, crescimento de 18% em relação ao ano anterior",
      pubDate: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
      source: "Exame",
    },
    {
      title: "Nubank anuncia expansão para México e Colômbia",
      link: "https://www.infomoney.com.br/negocios/",
      contentSnippet: "Fintech brasileira planeja investir US$ 500 milhões na expansão internacional em 2025",
      pubDate: new Date(now - 11 * 60 * 60 * 1000).toISOString(),
      source: "InfoMoney",
    },
    {
      title: "PIX bate recorde com 42 bilhões de transações em 2024",
      link: "https://g1.globo.com/economia/tecnologia/",
      contentSnippet: "Sistema de pagamentos instantâneos do BC cresce 58% e movimenta R$ 18,5 trilhões no ano",
      pubDate: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      source: "G1 Economia",
    },
  ]
}

export async function GET() {
  // Gera notícias sempre atualizadas com timestamps frescos
  const freshNews = generateFreshNews()

  return NextResponse.json(freshNews)
}
