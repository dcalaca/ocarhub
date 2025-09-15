// Base de dados expandida de veículos do mercado brasileiro
export interface VehicleVersion {
  nome: string
  motor: string
  combustivel: string[]
  cambio: string[]
  anosDisponiveis: number[]
  origem: "Nacional" | "Importado"
}

export interface VehicleModel {
  nome: string
  categoria: "Hatch" | "Sedã" | "SUV" | "Picape" | "Conversível" | "Cupê" | "Perua/SW" | "Minivan" | "Van/Utilitário"
  versoes: VehicleVersion[]
}

export interface VehicleBrand {
  nome: string
  origem: "Nacional" | "Importado" | "Mista"
  modelos: VehicleModel[]
}

export const vehiclesDatabase: VehicleBrand[] = [
  // CHEVROLET
  {
    nome: "Chevrolet",
    origem: "Mista",
    modelos: [
      {
        nome: "Onix",
        categoria: "Hatch",
        versoes: [
          {
            nome: "Joy 1.0",
            motor: "1.0 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "LT 1.0",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "RS 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LT 1.4",
            motor: "1.4 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.4",
            motor: "1.4 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Onix Plus",
        categoria: "Sedã",
        versoes: [
          {
            nome: "LT 1.0",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Prisma",
        categoria: "Sedã",
        versoes: [
          {
            nome: "Joy 1.0",
            motor: "1.0 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "LT 1.4",
            motor: "1.4 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.4",
            motor: "1.4 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Cruze",
        categoria: "Sedã",
        versoes: [
          {
            nome: "LT 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LT 1.8",
            motor: "1.8 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.8",
            motor: "1.8 16V",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Cruze Sport6",
        categoria: "Hatch",
        versoes: [
          {
            nome: "LT 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "RS 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Tracker",
        categoria: "SUV",
        versoes: [
          {
            nome: "LT 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "RS 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LT 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.4 Turbo",
            motor: "1.4 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Equinox",
        categoria: "SUV",
        versoes: [
          {
            nome: "LT 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "Premier 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "Premier 2.0 Turbo",
            motor: "2.0 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021],
            origem: "Importado",
          },
        ],
      },
      {
        nome: "Trailblazer",
        categoria: "SUV",
        versoes: [
          {
            nome: "LT 2.8 Diesel",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 2.8 Diesel",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 2.8 Diesel",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "S10",
        categoria: "Picape",
        versoes: [
          {
            nome: "LS 2.8 Diesel",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Manual"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LT 2.8 Diesel",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "High Country 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Z71 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Spin",
        categoria: "Minivan",
        versoes: [
          {
            nome: "LS 1.8",
            motor: "1.8 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LT 1.8",
            motor: "1.8 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.8",
            motor: "1.8 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Activ 1.8",
            motor: "1.8 8V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Montana",
        categoria: "Picape",
        versoes: [
          {
            nome: "LS 1.4",
            motor: "1.4 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Sport 1.4",
            motor: "1.4 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "LTZ 1.8",
            motor: "1.8 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Premier 1.8",
            motor: "1.8 8V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
    ],
  },

  // VOLKSWAGEN
  {
    nome: "Volkswagen",
    origem: "Mista",
    modelos: [
      {
        nome: "Gol",
        categoria: "Hatch",
        versoes: [
          {
            nome: "1.0 MPI",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "1.6 MSI",
            motor: "1.6 MSI",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 1.0",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 1.6",
            motor: "1.6 MSI",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Highline 1.6",
            motor: "1.6 MSI",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Last Edition 1.0",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2022],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Polo",
        categoria: "Hatch",
        versoes: [
          {
            nome: "1.0 MPI",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "1.0 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 1.0",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Highline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "GTS 1.4 TSI",
            motor: "1.4 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Track 1.0 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Virtus",
        categoria: "Sedã",
        versoes: [
          {
            nome: "1.0 MPI",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "1.0 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 1.0",
            motor: "1.0 MPI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Highline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "GTS 1.4 TSI",
            motor: "1.4 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "T-Cross",
        categoria: "SUV",
        versoes: [
          {
            nome: "200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Comfortline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Highline 250 TSI",
            motor: "1.4 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Sense 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Nivus",
        categoria: "SUV",
        versoes: [
          {
            nome: "Comfortline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Highline 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Sense 200 TSI",
            motor: "1.0 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Taos",
        categoria: "SUV",
        versoes: [
          {
            nome: "Comfortline 250 TSI",
            motor: "1.4 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Highline 250 TSI",
            motor: "1.4 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Launching Edition 250 TSI",
            motor: "1.4 TSI",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Tiguan",
        categoria: "SUV",
        versoes: [
          {
            nome: "350 TSI",
            motor: "2.0 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "Allspace Comfortline 250 TSI",
            motor: "1.4 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "Allspace R-Line 350 TSI",
            motor: "2.0 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
        ],
      },
      {
        nome: "Amarok",
        categoria: "Picape",
        versoes: [
          {
            nome: "SE 2.0 TDI",
            motor: "2.0 TDI",
            combustivel: ["Diesel"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Trendline 2.0 TDI",
            motor: "2.0 TDI",
            combustivel: ["Diesel"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Highline 2.0 TDI",
            motor: "2.0 TDI",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Highline 3.0 V6 TDI",
            motor: "3.0 V6 TDI",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Extreme 3.0 V6 TDI",
            motor: "3.0 V6 TDI",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Saveiro",
        categoria: "Picape",
        versoes: [
          {
            nome: "Robust 1.6",
            motor: "1.6 MSI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Trendline 1.6",
            motor: "1.6 MSI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Cross 1.6",
            motor: "1.6 MSI",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Jetta",
        categoria: "Sedã",
        versoes: [
          {
            nome: "Comfortline 1.4 TSI",
            motor: "1.4 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "R-Line 250 TSI",
            motor: "1.4 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "GLI 350 TSI",
            motor: "2.0 TSI",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
        ],
      },
    ],
  },

  // FIAT
  {
    nome: "Fiat",
    origem: "Mista",
    modelos: [
      {
        nome: "Uno",
        categoria: "Hatch",
        versoes: [
          {
            nome: "Attractive 1.0",
            motor: "1.0 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Drive 1.0",
            motor: "1.0 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Way 1.0",
            motor: "1.0 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Way 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Sporting 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Ciao 1.0",
            motor: "1.0 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2022],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Mobi",
        categoria: "Hatch",
        versoes: [
          {
            nome: "Easy 1.0",
            motor: "1.0 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Like 1.0",
            motor: "1.0 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Way 1.0",
            motor: "1.0 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Trekking 1.0",
            motor: "1.0 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Argo",
        categoria: "Hatch",
        versoes: [
          {
            nome: "1.0",
            motor: "1.0 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Drive 1.0",
            motor: "1.0 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Drive 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Trekking 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "HGT 1.8",
            motor: "1.8 E.torQ",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Cronos",
        categoria: "Sedã",
        versoes: [
          {
            nome: "1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Drive 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Precision 1.8",
            motor: "1.8 E.torQ",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "HGT 1.8",
            motor: "1.8 E.torQ",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Pulse",
        categoria: "SUV",
        versoes: [
          {
            nome: "Drive 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Audace 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Impetus 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Fastback",
        categoria: "SUV",
        versoes: [
          {
            nome: "Audace 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Impetus 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Limited Edition 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Toro",
        categoria: "Picape",
        versoes: [
          {
            nome: "Endurance 1.8",
            motor: "1.8 E.torQ",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Freedom 1.8",
            motor: "1.8 E.torQ",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Freedom 2.0 Diesel",
            motor: "2.0 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Volcano 2.0 Diesel",
            motor: "2.0 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Ranch 2.0 Diesel 4x4",
            motor: "2.0 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Ultra 2.0 Diesel 4x4",
            motor: "2.0 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Freedom 1.3 Turbo",
            motor: "1.3 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Volcano 1.3 Turbo",
            motor: "1.3 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Strada",
        categoria: "Picape",
        versoes: [
          {
            nome: "Working 1.4",
            motor: "1.4 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "Hard Working 1.4",
            motor: "1.4 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "Freedom 1.4",
            motor: "1.4 Fire",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "Adventure 1.8",
            motor: "1.8 E.torQ",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "Endurance 1.4",
            motor: "1.4 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Freedom 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Volcano 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Ranch 1.3",
            motor: "1.3 Firefly",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
    ],
  },

  // TOYOTA
  {
    nome: "Toyota",
    origem: "Mista",
    modelos: [
      {
        nome: "Etios",
        categoria: "Hatch",
        versoes: [
          {
            nome: "X 1.3",
            motor: "1.3 16V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "XS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "XLS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "Platinum 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Etios Sedan",
        categoria: "Sedã",
        versoes: [
          {
            nome: "X 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "XS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "XLS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "Platinum 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Yaris",
        categoria: "Hatch",
        versoes: [
          {
            nome: "XL 1.3",
            motor: "1.3 16V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XL Plus 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XLS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "GR-Sport 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Yaris Sedan",
        categoria: "Sedã",
        versoes: [
          {
            nome: "XL 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XL Plus 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XLS 1.5",
            motor: "1.5 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Corolla",
        categoria: "Sedã",
        versoes: [
          {
            nome: "GLi 1.8",
            motor: "1.8 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "XEi 2.0",
            motor: "2.0 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "Altis 2.0",
            motor: "2.0 16V",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "GLi 2.0",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XEi 2.0",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Altis 2.0",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Altis Hybrid",
            motor: "1.8 Hybrid",
            combustivel: ["Híbrido"],
            cambio: ["CVT"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "GR-Sport",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Corolla Cross",
        categoria: "SUV",
        versoes: [
          {
            nome: "XR 2.0",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XRE 2.0",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "XRV 2.0",
            motor: "2.0 Dynamic Force",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "RAV4",
        categoria: "SUV",
        versoes: [
          {
            nome: "2.0 4x2",
            motor: "2.0 16V",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018],
            origem: "Importado",
          },
          {
            nome: "Hybrid 4x4",
            motor: "2.5 Hybrid",
            combustivel: ["Híbrido"],
            cambio: ["CVT"],
            anosDisponiveis: [2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
        ],
      },
      {
        nome: "Hilux",
        categoria: "Picape",
        versoes: [
          {
            nome: "SR 2.4 Diesel",
            motor: "2.4 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "SRV 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "SRX 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "SW4",
        categoria: "SUV",
        versoes: [
          {
            nome: "SR 2.7 Flex",
            motor: "2.7 16V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "SRV 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "SRX 2.8 Diesel 4x4",
            motor: "2.8 Diesel",
            combustivel: ["Diesel"],
            cambio: ["Automático"],
            anosDisponiveis: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
    ],
  },

  // HONDA
  {
    nome: "Honda",
    origem: "Mista",
    modelos: [
      {
        nome: "Fit",
        categoria: "Hatch",
        versoes: [
          {
            nome: "LX 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "EX 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
          {
            nome: "EXL 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "City",
        categoria: "Sedã",
        versoes: [
          {
            nome: "DX 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "LX 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "EX 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "EXL 1.5",
            motor: "1.5 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Civic",
        categoria: "Sedã",
        versoes: [
          {
            nome: "LX 2.0",
            motor: "2.0 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "EX 2.0",
            motor: "2.0 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "EXL 2.0",
            motor: "2.0 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Touring 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Sport 2.0 i-VTEC",
            motor: "2.0 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "Touring 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Importado",
          },
        ],
      },
      {
        nome: "HR-V",
        categoria: "SUV",
        versoes: [
          {
            nome: "LX 1.8",
            motor: "1.8 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["Manual", "CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "EX 1.8",
            motor: "1.8 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "EXL 1.8",
            motor: "1.8 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Touring 1.8",
            motor: "1.8 i-VTEC",
            combustivel: ["Flex"],
            cambio: ["CVT"],
            anosDisponiveis: [2020, 2021, 2022],
            origem: "Nacional",
          },
          {
            nome: "Advance 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Touring 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "CR-V",
        categoria: "SUV",
        versoes: [
          {
            nome: "LX 2.0",
            motor: "2.0 i-VTEC",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016],
            origem: "Importado",
          },
          {
            nome: "EXL 2.0",
            motor: "2.0 i-VTEC",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2012, 2013, 2014, 2015, 2016],
            origem: "Importado",
          },
          {
            nome: "Touring 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "EX 1.5 Turbo",
            motor: "1.5 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["CVT"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
            origem: "Importado",
          },
        ],
      },
    ],
  },

  // HYUNDAI
  {
    nome: "Hyundai",
    origem: "Mista",
    modelos: [
      {
        nome: "HB20",
        categoria: "Hatch",
        versoes: [
          {
            nome: "Comfort 1.0",
            motor: "1.0 12V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "Comfort Plus 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "Sense 1.0",
            motor: "1.0 12V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Vision 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Evolution 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Diamond 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Diamond Plus 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "HB20S",
        categoria: "Sedã",
        versoes: [
          {
            nome: "Comfort 1.0",
            motor: "1.0 12V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "Comfort Plus 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
            origem: "Nacional",
          },
          {
            nome: "Sense 1.0",
            motor: "1.0 12V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Vision 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Evolution 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2020, 2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Diamond 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2021, 2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Creta",
        categoria: "SUV",
        versoes: [
          {
            nome: "Attitude 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Pulse 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Pulse Plus 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Action 1.6",
            motor: "1.6 16V",
            combustivel: ["Flex"],
            cambio: ["Manual", "Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Smart 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
          {
            nome: "Ultimate 1.0 Turbo",
            motor: "1.0 Turbo",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Nacional",
          },
        ],
      },
      {
        nome: "Tucson",
        categoria: "SUV",
        versoes: [
          {
            nome: "GL 2.0",
            motor: "2.0 16V",
            combustivel: ["Flex"],
            cambio: ["Manual"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "GLS 2.0",
            motor: "2.0 16V",
            combustivel: ["Flex"],
            cambio: ["Automático"],
            anosDisponiveis: [2017, 2018, 2019, 2020, 2021],
            origem: "Nacional",
          },
          {
            nome: "Limited 1.6 Turbo",
            motor: "1.6 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Importado",
          },
          {
            nome: "N Line 1.6 Turbo",
            motor: "1.6 Turbo",
            combustivel: ["Gasolina"],
            cambio: ["Automático"],
            anosDisponiveis: [2022, 2023, 2024],
            origem: "Importado",
          },
        ],
      },
    ],
  },
]

// Funções auxiliares para filtros dependentes - AGORA COMEÇANDO PELO ANO!
export function getAllYears(): number[] {
  const years = new Set<number>()
  vehiclesDatabase.forEach((brand) => {
    brand.modelos.forEach((model) => {
      model.versoes.forEach((version) => {
        version.anosDisponiveis.forEach((year) => years.add(year))
      })
    })
  })
  return Array.from(years).sort((a, b) => b - a)
}

export function getBrandsByYear(year: number): string[] {
  const brands = new Set<string>()
  vehiclesDatabase.forEach((brand) => {
    const hasModelInYear = brand.modelos.some((model) =>
      model.versoes.some((version) => version.anosDisponiveis.includes(year)),
    )
    if (hasModelInYear) {
      brands.add(brand.nome)
    }
  })
  return Array.from(brands).sort()
}

export function getModelsByBrandAndYear(brandName: string, year: number): string[] {
  const brand = vehiclesDatabase.find((b) => b.nome === brandName)
  if (!brand) return []

  const models = new Set<string>()
  brand.modelos.forEach((model) => {
    const hasVersionInYear = model.versoes.some((version) => version.anosDisponiveis.includes(year))
    if (hasVersionInYear) {
      models.add(model.nome)
    }
  })
  return Array.from(models).sort()
}

export function getVersionsByModelAndYear(brandName: string, modelName: string, year: number): string[] {
  const brand = vehiclesDatabase.find((b) => b.nome === brandName)
  if (!brand) return []

  const model = brand.modelos.find((m) => m.nome === modelName)
  if (!model) return []

  return model.versoes
    .filter((version) => version.anosDisponiveis.includes(year))
    .map((version) => version.nome)
    .sort()
}

// Funções originais mantidas para compatibilidade
export function getAllBrands(): string[] {
  return vehiclesDatabase.map((brand) => brand.nome).sort()
}

export function getModelsByBrand(brandName: string): string[] {
  const brand = vehiclesDatabase.find((b) => b.nome === brandName)
  return brand ? brand.modelos.map((model) => model.nome).sort() : []
}

export function getVersionsByModel(brandName: string, modelName: string): string[] {
  const brand = vehiclesDatabase.find((b) => b.nome === brandName)
  if (!brand) return []

  const model = brand.modelos.find((m) => m.nome === modelName)
  return model ? model.versoes.map((version) => version.nome).sort() : []
}

export function getYearsByVersion(brandName: string, modelName: string, versionName: string): number[] {
  const brand = vehiclesDatabase.find((b) => b.nome === brandName)
  if (!brand) return []

  const model = brand.modelos.find((m) => m.nome === modelName)
  if (!model) return []

  const version = model.versoes.find((v) => v.nome === versionName)
  return version ? version.anosDisponiveis.sort((a, b) => b - a) : []
}

export function getVehicleDetails(brandName: string, modelName: string, versionName: string) {
  const brand = vehiclesDatabase.find((b) => b.nome === brandName)
  if (!brand) return null

  const model = brand.modelos.find((m) => m.nome === modelName)
  if (!model) return null

  const version = model.versoes.find((v) => v.nome === versionName)
  if (!version) return null

  return {
    brand: brand.nome,
    model: model.nome,
    version: version.nome,
    category: model.categoria,
    motor: version.motor,
    combustivel: version.combustivel,
    cambio: version.cambio,
    anosDisponiveis: version.anosDisponiveis,
    origem: version.origem,
  }
}
