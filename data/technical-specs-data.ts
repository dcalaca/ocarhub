// Arquivo: data/technical-specs-data.ts

export type TechnicalSpecs = {
  engineType: string
  horsepower: string
  torque: string
  cylinders: string
  aspiration: string
  injectionType: string
  maxSpeed: string
  acceleration0to100: string
  transmissionType: string
  gears: string
  traction: string
  cityConsumption: string
  highwayConsumption: string
  fuelType: string
  fuelTankCapacity: string
  length: string
  width: string
  height: string
  wheelbase: string
  groundClearance: string
  grossWeight: string
  curbWeight: string
  trunkCapacity: string
  occupants: string
  loadCapacity: string
  bodyType: string
  doors: string
  steeringType: string
  frontSuspension: string
  rearSuspension: string
  frontBrakes: string
  rearBrakes: string
}

export type VersionData = {
  name: string
  specs: TechnicalSpecs
}

export type ModelData = {
  name: string
  versions: VersionData[]
}

export type BrandData = {
  name: string
  models: ModelData[]
}

export type YearData = {
  year: string
  brands: BrandData[]
}

export const TECHNICAL_SPECS_DATA: YearData[] = [
  {
    year: "2024",
    brands: [
      {
        name: "Toyota",
        models: [
          {
            name: "Corolla",
            versions: [
              {
                name: "XEi 2.0 Flex",
                specs: {
                  engineType: "2.0 Flex",
                  horsepower: "177 CV (E) / 169 CV (G)",
                  torque: "21.3 kgfm (E/G)",
                  cylinders: "4 em linha",
                  aspiration: "Natural",
                  injectionType: "Direta e Indireta",
                  maxSpeed: "205 km/h",
                  acceleration0to100: "9.2 segundos",
                  transmissionType: "CVT (10 marchas simuladas)",
                  gears: "10",
                  traction: "Dianteira",
                  cityConsumption: "8.3 km/l (E) / 11.9 km/l (G)",
                  highwayConsumption: "9.8 km/l (E) / 14.2 km/l (G)",
                  fuelType: "Flex (Etanol/Gasolina)",
                  fuelTankCapacity: "50 litros",
                  length: "4.630 mm",
                  width: "1.780 mm",
                  height: "1.460 mm",
                  wheelbase: "2.700 mm",
                  groundClearance: "148 mm",
                  grossWeight: "1.780 kg",
                  curbWeight: "1.375 kg",
                  trunkCapacity: "470 litros",
                  occupants: "5",
                  loadCapacity: "405 kg",
                  bodyType: "Sedã",
                  doors: "4",
                  steeringType: "Elétrica",
                  frontSuspension: "Independente, McPherson",
                  rearSuspension: "Independente, multibraço",
                  frontBrakes: "Disco ventilado",
                  rearBrakes: "Disco sólido",
                },
              },
              {
                name: "Altis Hybrid",
                specs: {
                  engineType: "1.8 Hybrid Flex",
                  horsepower: "122 CV (combinado)",
                  torque: "16.3 kgfm (motor a combustão)",
                  cylinders: "4 em linha",
                  aspiration: "Natural",
                  injectionType: "Multiponto",
                  maxSpeed: "180 km/h",
                  acceleration0to100: "11.0 segundos",
                  transmissionType: "CVT (Transaxle)",
                  gears: "N/A",
                  traction: "Dianteira",
                  cityConsumption: "14.5 km/l (E) / 17.9 km/l (G)",
                  highwayConsumption: "12.8 km/l (E) / 15.4 km/l (G)",
                  fuelType: "Flex (Etanol/Gasolina)",
                  fuelTankCapacity: "43 litros",
                  length: "4.630 mm",
                  width: "1.780 mm",
                  height: "1.460 mm",
                  wheelbase: "2.700 mm",
                  groundClearance: "148 mm",
                  grossWeight: "1.780 kg",
                  curbWeight: "1.440 kg",
                  trunkCapacity: "470 litros",
                  occupants: "5",
                  loadCapacity: "340 kg",
                  bodyType: "Sedã",
                  doors: "4",
                  steeringType: "Elétrica",
                  frontSuspension: "Independente, McPherson",
                  rearSuspension: "Independente, multibraço",
                  frontBrakes: "Disco ventilado",
                  rearBrakes: "Disco sólido",
                },
              },
            ],
          },
          {
            name: "Hilux",
            versions: [
              {
                name: "SRV 2.8 Diesel 4x4",
                specs: {
                  engineType: "2.8 Diesel",
                  horsepower: "204 CV",
                  torque: "50.9 kgfm",
                  cylinders: "4 em linha",
                  aspiration: "Turbo",
                  injectionType: "Direta",
                  maxSpeed: "180 km/h",
                  acceleration0to100: "10.5 segundos",
                  transmissionType: "Automática",
                  gears: "6",
                  traction: "4x4",
                  cityConsumption: "9.0 km/l",
                  highwayConsumption: "10.5 km/l",
                  fuelType: "Diesel",
                  fuelTankCapacity: "80 litros",
                  length: "5.325 mm",
                  width: "1.855 mm",
                  height: "1.815 mm",
                  wheelbase: "3.085 mm",
                  groundClearance: "286 mm",
                  grossWeight: "2.910 kg",
                  curbWeight: "2.090 kg",
                  trunkCapacity: "1.000 litros (caçamba)",
                  occupants: "5",
                  loadCapacity: "820 kg",
                  bodyType: "Picape",
                  doors: "4",
                  steeringType: "Hidráulica",
                  frontSuspension: "Independente, braços duplos",
                  rearSuspension: "Eixo rígido, feixe de molas",
                  frontBrakes: "Disco ventilado",
                  rearBrakes: "Tambor",
                },
              },
            ],
          },
        ],
      },
      {
        name: "Volkswagen",
        models: [
          {
            name: "Polo",
            versions: [
              {
                name: "Comfortline 1.0 TSI",
                specs: {
                  engineType: "1.0 TSI",
                  horsepower: "116 CV (E) / 109 CV (G)",
                  torque: "16.8 kgfm (E/G)",
                  cylinders: "3 em linha",
                  aspiration: "Turbo",
                  injectionType: "Direta",
                  maxSpeed: "197 km/h",
                  acceleration0to100: "10.5 segundos",
                  transmissionType: "Automática",
                  gears: "6",
                  traction: "Dianteira",
                  cityConsumption: "8.4 km/l (E) / 12.2 km/l (G)",
                  highwayConsumption: "10.5 km/l (E) / 14.6 km/l (G)",
                  fuelType: "Flex (Etanol/Gasolina)",
                  fuelTankCapacity: "52 litros",
                  length: "4.068 mm",
                  width: "1.751 mm",
                  height: "1.468 mm",
                  wheelbase: "2.566 mm",
                  groundClearance: "149 mm",
                  grossWeight: "1.580 kg",
                  curbWeight: "1.140 kg",
                  trunkCapacity: "300 litros",
                  occupants: "5",
                  loadCapacity: "440 kg",
                  bodyType: "Hatch",
                  doors: "4",
                  steeringType: "Elétrica",
                  frontSuspension: "Independente, McPherson",
                  rearSuspension: "Eixo de torção",
                  frontBrakes: "Disco ventilado",
                  rearBrakes: "Tambor",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    year: "2023",
    brands: [
      {
        name: "Chevrolet",
        models: [
          {
            name: "Onix",
            versions: [
              {
                name: "LT 1.0",
                specs: {
                  engineType: "1.0 Flex",
                  horsepower: "82 CV (E) / 78 CV (G)",
                  torque: "10.6 kgfm (E) / 9.6 kgfm (G)",
                  cylinders: "3 em linha",
                  aspiration: "Natural",
                  injectionType: "Multiponto",
                  maxSpeed: "167 km/h",
                  acceleration0to100: "13.3 segundos",
                  transmissionType: "Manual",
                  gears: "6",
                  traction: "Dianteira",
                  cityConsumption: "9.9 km/l (E) / 13.9 km/l (G)",
                  highwayConsumption: "11.7 km/l (E) / 16.7 km/l (G)",
                  fuelType: "Flex (Etanol/Gasolina)",
                  fuelTankCapacity: "44 litros",
                  length: "4.163 mm",
                  width: "1.746 mm",
                  height: "1.476 mm",
                  wheelbase: "2.551 mm",
                  groundClearance: "127 mm",
                  grossWeight: "1.470 kg",
                  curbWeight: "1.035 kg",
                  trunkCapacity: "275 litros",
                  occupants: "5",
                  loadCapacity: "435 kg",
                  bodyType: "Hatch",
                  doors: "4",
                  steeringType: "Elétrica",
                  frontSuspension: "Independente, McPherson",
                  rearSuspension: "Eixo de torção",
                  frontBrakes: "Disco ventilado",
                  rearBrakes: "Tambor",
                },
              },
            ],
          },
        ],
      },
      {
        name: "Fiat",
        models: [
          {
            name: "Argo",
            versions: [
              {
                name: "Drive 1.0",
                specs: {
                  engineType: "1.0 Flex",
                  horsepower: "77 CV (E) / 72 CV (G)",
                  torque: "10.9 kgfm (E) / 10.4 kgfm (G)",
                  cylinders: "3 em linha",
                  aspiration: "Natural",
                  injectionType: "Multiponto",
                  maxSpeed: "162 km/h",
                  acceleration0to100: "13.4 segundos",
                  transmissionType: "Manual",
                  gears: "5",
                  traction: "Dianteira",
                  cityConsumption: "9.3 km/l (E) / 13.2 km/l (G)",
                  highwayConsumption: "10.4 km/l (E) / 14.6 km/l (G)",
                  fuelType: "Flex (Etanol/Gasolina)",
                  fuelTankCapacity: "48 litros",
                  length: "3.998 mm",
                  width: "1.724 mm",
                  height: "1.501 mm",
                  wheelbase: "2.521 mm",
                  groundClearance: "156 mm",
                  grossWeight: "1.550 kg",
                  curbWeight: "1.105 kg",
                  trunkCapacity: "300 litros",
                  occupants: "5",
                  loadCapacity: "445 kg",
                  bodyType: "Hatch",
                  doors: "4",
                  steeringType: "Elétrica",
                  frontSuspension: "Independente, McPherson",
                  rearSuspension: "Eixo de torção",
                  frontBrakes: "Disco ventilado",
                  rearBrakes: "Tambor",
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
