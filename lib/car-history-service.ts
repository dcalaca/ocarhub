// Serviço que simula a busca de histórias e fichas técnicas de carros
// Em produção, isso seria substituído por chamadas a APIs reais

import { cache } from "react"

export interface CarHistoryData {
  id: string
  name: string
  brand: string
  firstYear: number
  lastYear?: number
  history: string
  imageUrl: string
  generations: {
    name: string
    years: string
    description: string
  }[]
  awards: string[]
  funFacts: string[]
}

export interface TechnicalSpecsData {
  id: string
  name: string
  brand: string
  year: number
  engine: {
    type: string
    displacement: string
    power: string
    torque: string
    fuelType: string[]
  }
  performance: {
    acceleration: string
    topSpeed: string
    fuelConsumptionCity: string
    fuelConsumptionHighway: string
  }
  dimensions: {
    length: string
    width: string
    height: string
    wheelbase: string
    weight: string
    trunkCapacity: string
  }
  transmission: {
    type: string
    gears: number
  }
  chassis: {
    frontSuspension: string
    rearSuspension: string
    brakes: string
    steering: string
  }
}

// Banco de dados simulado
const carHistoryDatabase: Record<string, CarHistoryData> = {
  "volkswagen-gol": {
    id: "volkswagen-gol",
    name: "Gol",
    brand: "Volkswagen",
    firstYear: 1980,
    lastYear: 2022,
    imageUrl: "/placeholder.svg?height=400&width=800",
    history: `O Volkswagen Gol é um dos carros mais icônicos e vendidos da história do Brasil. Lançado em 1980 como substituto do Volkswagen Beetle no mercado brasileiro, o Gol rapidamente se tornou um sucesso de vendas e manteve-se como o carro mais vendido do país por 27 anos consecutivos (1987 a 2014).`,
    generations: [
      {
        name: "Primeira Geração (G1)",
        years: "1980-1994",
        description:
          "Conhecida como 'Gol Quadrado', iniciou com motor refrigerado a ar e depois adotou motores refrigerados a água.",
      },
      {
        name: "Segunda Geração (G2)",
        years: "1994-2005",
        description: "O famoso 'Gol Bola', com design mais arredondado e moderno, consolidou a liderança de mercado.",
      },
    ],
    awards: [
      "Carro do Ano (Brasil) - múltiplas vezes",
      "Melhor Compra na categoria hatch compacto - Revista Quatro Rodas (diversos anos)",
      "Carro mais vendido do Brasil por 27 anos consecutivos (1987-2014)",
    ],
    funFacts: [
      "O Gol foi o primeiro carro mundial da Volkswagen desenvolvido fora da Alemanha",
      "Mais de 8 milhões de unidades foram produzidas ao longo de sua história",
      "A versão GTI do Gol é considerada um clássico e item de colecionador",
      "O nome 'Gol' foi escolhido pela paixão brasileira pelo futebol",
    ],
  },
  "fiat-uno": {
    id: "fiat-uno",
    name: "Uno",
    brand: "Fiat",
    firstYear: 1984,
    imageUrl: "/placeholder.svg?height=400&width=800",
    history: `O Fiat Uno é um dos automóveis mais importantes da história brasileira, tendo revolucionado o mercado de carros compactos quando foi lançado no Brasil em 1984.`,
    generations: [
      {
        name: "Primeira Geração (Uno 'Quadrado')",
        years: "1984-2013",
        description: "Baseado no modelo europeu, com adaptações para o Brasil. Incluiu a famosa versão Mille.",
      },
      {
        name: "Segunda Geração (Novo Uno)",
        years: "2010-Presente",
        description: "Desenvolvido no Brasil, com design moderno inspirado em brinquedos como LEGO.",
      },
    ],
    awards: [
      "Carro do Ano (Brasil) - 1984",
      "Melhor Compra na categoria hatch compacto - diversos anos",
      "Carro mais econômico do Brasil - diversos anos",
    ],
    funFacts: [
      "O Uno Mille foi o primeiro carro 1.0 do Brasil",
      "O Uno Turbo é considerado um dos primeiros hot hatches brasileiros",
      "O Uno 'quadrado' foi produzido por quase 30 anos no Brasil",
      "O design do Novo Uno foi inspirado em brinquedos como LEGO e Playmobil",
    ],
  },
}

// Banco de dados simulado de fichas técnicas
const technicalSpecsDatabase: Record<string, TechnicalSpecsData[]> = {
  "volkswagen-gol": [
    {
      id: "volkswagen-gol-2020",
      name: "Gol",
      brand: "Volkswagen",
      year: 2020,
      engine: {
        type: "1.0 MPI Flex",
        displacement: "999 cc",
        power: "84 cv (E) / 75 cv (G) @ 6.250 rpm",
        torque: "10,4 kgfm (E) / 9,7 kgfm (G) @ 3.000 rpm",
        fuelType: ["Gasolina", "Etanol"],
      },
      performance: {
        acceleration: "12,5s (0-100 km/h)",
        topSpeed: "170 km/h",
        fuelConsumptionCity: "8,9 km/l (G) / 6,2 km/l (E)",
        fuelConsumptionHighway: "10,8 km/l (G) / 7,5 km/l (E)",
      },
      dimensions: {
        length: "3.892 mm",
        width: "1.656 mm",
        height: "1.484 mm",
        wheelbase: "2.465 mm",
        weight: "997 kg",
        trunkCapacity: "285 litros",
      },
      transmission: {
        type: "Manual",
        gears: 5,
      },
      chassis: {
        frontSuspension: "McPherson, com barra estabilizadora",
        rearSuspension: "Eixo de torção",
        brakes: "Disco ventilado na dianteira e tambor na traseira",
        steering: "Direção hidráulica",
      },
    },
  ],
  "fiat-uno": [
    {
      id: "fiat-uno-2020",
      name: "Uno",
      brand: "Fiat",
      year: 2020,
      engine: {
        type: "1.0 Firefly Flex",
        displacement: "999 cc",
        power: "77 cv (E) / 72 cv (G) @ 6.250 rpm",
        torque: "10,9 kgfm (E) / 10,4 kgfm (G) @ 3.250 rpm",
        fuelType: ["Gasolina", "Etanol"],
      },
      performance: {
        acceleration: "12,2s (0-100 km/h)",
        topSpeed: "157 km/h",
        fuelConsumptionCity: "10,0 km/l (G) / 6,9 km/l (E)",
        fuelConsumptionHighway: "11,8 km/l (G) / 8,1 km/l (E)",
      },
      dimensions: {
        length: "3.815 mm",
        width: "1.676 mm",
        height: "1.556 mm",
        wheelbase: "2.376 mm",
        weight: "940 kg",
        trunkCapacity: "290 litros",
      },
      transmission: {
        type: "Manual",
        gears: 5,
      },
      chassis: {
        frontSuspension: "McPherson com barra estabilizadora",
        rearSuspension: "Eixo de torção",
        brakes: "Disco ventilado na dianteira e tambor na traseira",
        steering: "Direção hidráulica",
      },
    },
  ],
}

// Função para buscar carros por nome
export const searchCarsByName = cache(async (query: string): Promise<CarHistoryData[]> => {
  // Simula um delay de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (!query || query.length < 2) return []

  const normalizedQuery = query.toLowerCase().trim()

  return Object.values(carHistoryDatabase).filter((car) => {
    return car.name.toLowerCase().includes(normalizedQuery) || car.brand.toLowerCase().includes(normalizedQuery)
  })
})

// Função para buscar história de um carro específico
export const getCarHistory = cache(async (carId: string): Promise<CarHistoryData | null> => {
  // Simula um delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return carHistoryDatabase[carId] || null
})

// Função para buscar ficha técnica de um carro
export const getCarTechnicalSpecs = cache(async (carId: string): Promise<TechnicalSpecsData[]> => {
  // Simula um delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return technicalSpecsDatabase[carId] || []
})

// Função para buscar carros populares/recomendados
export const getPopularCars = cache(async (): Promise<CarHistoryData[]> => {
  // Simula um delay de rede
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Retorna alguns carros populares
  return [carHistoryDatabase["volkswagen-gol"], carHistoryDatabase["fiat-uno"]].filter(Boolean)
})

// // Interface para relatório de histórico veicular
// export interface VehicleHistoryReport {
//   placa: string
//   status: "clean" | "issues" | "severe"
//   score: number
//   resumo: string
//   detalhes: {
//     acidentes: number
//     multas: number
//     leiloes: boolean
//     rouboFurto: boolean
//     proprietarios: number
//   }
//   recomendacao: string
//   valorMercado: {
//     fipe: number
//     mercado: number
//     variacao: number
//   }
// }

// // Função para consultar histórico veicular
// export async function consultarHistoricoVeicular(placa: string): Promise<VehicleHistoryReport> {
//   // Simular consulta de API
//   await new Promise((resolve) => setTimeout(resolve, 2000))

//   // Dados simulados baseados na placa
//   const mockData: VehicleHistoryReport = {
//     placa: placa.toUpperCase(),
//     status: Math.random() > 0.7 ? "issues" : "clean",
//     score: Math.floor(Math.random() * 40) + 60,
//     resumo: "Veículo com histórico regular",
//     detalhes: {
//       acidentes: Math.floor(Math.random() * 3),
//       multas: Math.floor(Math.random() * 5),
//       leiloes: Math.random() > 0.8,
//       rouboFurto: false,
//       proprietarios: Math.floor(Math.random() * 3) + 1,
//     },
//     recomendacao: "Veículo aprovado para compra",
//     valorMercado: {
//       fipe: 45000,
//       mercado: 42000,
//       variacao: -6.7,
//     },
//   }

//   return mockData
// }
