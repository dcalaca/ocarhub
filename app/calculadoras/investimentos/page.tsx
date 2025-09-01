import InvestimentosClientPage from "./InvestimentosClientPage"

export const metadata = {
  title: "Comparação de Investimentos | FinanceHub",
  description:
    "Compare diferentes opções de investimento e encontre a melhor estratégia. Analise rentabilidade, risco e retorno.",
  keywords: "comparação investimentos, rentabilidade, estratégia financeira, risco x retorno, carteira diversificada",
  openGraph: {
    title: "Comparação de Investimentos - FinanceHub",
    description:
      "Ferramenta para comparar diversas opções de investimento e escolher a mais rentável de acordo com seu perfil.",
    type: "website",
  },
}

export default function InvestimentosPage() {
  return <InvestimentosClientPage />
}
