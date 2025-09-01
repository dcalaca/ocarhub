import ValorPresenteFuturoClientPage from "./ValorPresenteFuturoClientPage"

export const metadata = {
  title: "Calculadora de Valor Presente e Futuro | FinanceHub",
  description:
    "Calcule o valor presente ou futuro do seu dinheiro considerando taxas de juros. Ferramenta essencial para planejamento financeiro.",
  keywords: "valor presente, valor futuro, desconto, juros, planejamento financeiro, investimentos",
  openGraph: {
    title: "Calculadora de Valor Presente e Futuro - FinanceHub",
    description: "Calcule o valor presente ou futuro do seu dinheiro considerando uma taxa de juros",
    type: "website",
  },
}

export default function ValorPresenteFuturoPage() {
  return <ValorPresenteFuturoClientPage />
}
