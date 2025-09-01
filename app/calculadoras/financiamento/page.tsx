import FinanciamentoClientPage from "./FinanciamentoClientPage"

export const metadata = {
  title: "Simulador de Financiamento Imobiliário | FinanceHub",
  description:
    "Compare os sistemas PRICE e SAC para financiamento imobiliário. Calcule prestações, juros e escolha a melhor opção para seu imóvel.",
  keywords: "financiamento imobiliário, sistema PRICE, sistema SAC, prestações, simulador casa própria",
  openGraph: {
    title: "Simulador de Financiamento Imobiliário - FinanceHub",
    description: "Compare os sistemas PRICE e SAC para escolher a melhor opção de financiamento",
    type: "website",
  },
}

export default function FinanciamentoPage() {
  return <FinanciamentoClientPage />
}
