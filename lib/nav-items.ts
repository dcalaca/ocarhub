import { Wallet, User, Settings, Car, Calculator, DollarSign, Wrench, Search, CheckSquare } from "lucide-react"

export const navItems = [
  {
    title: "Consultar Veículo",
    url: "/dashboard",
    icon: Search,
  },
  {
    title: "Validador de Placa",
    url: "/dashboard/plate-validator",
    icon: CheckSquare,
  },
  {
    title: "Minha Conta",
    url: "/dashboard/wallet",
    icon: Wallet,
  },
  {
    title: "Perfil",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Minhas Consultas",
    url: "/dashboard/my-queries",
    icon: Car,
  },
  {
    title: "Simulador de Financiamento",
    url: "/dashboard/financing-simulator",
    icon: Calculator, // Ícone de calculadora
  },
  {
    title: "Ficha Técnica",
    url: "/dashboard/technical-specs",
    icon: Wrench,
  },
  {
    title: "Tabela FIPE",
    url: "/dashboard/fipe-comparison",
    icon: DollarSign,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
]
