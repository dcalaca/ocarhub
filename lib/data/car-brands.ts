export type CarModel = {
  id: string
  name: string
  years: number[]
  versions?: string[]
  fuelTypes?: string[]
  bodyTypes?: string[]
  transmissions?: string[]
}

export type CarBrand = {
  id: string
  name: string
  logo: string
  models: CarModel[]
}

export const carBrands: CarBrand[] = [
  {
    id: "chevrolet",
    name: "Chevrolet",
    logo: "/brands/chevrolet.svg",
    models: [
      {
        id: "onix",
        name: "Onix",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        versions: ["LT", "LTZ", "Premier", "RS", "Joy", "Plus"],
        fuelTypes: ["Flex", "Gasolina"],
        bodyTypes: ["Hatch", "Sedan"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "cruze",
        name: "Cruze",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        versions: ["LT", "LTZ", "Premier", "Sport"],
        fuelTypes: ["Flex", "Gasolina"],
        bodyTypes: ["Sedan", "Hatch"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "s10",
        name: "S10",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        versions: ["LS", "LT", "LTZ", "High Country"],
        fuelTypes: ["Diesel", "Flex"],
        bodyTypes: ["Picape"],
        transmissions: ["Manual", "Automático"],
      },
    ],
  },
  {
    id: "volkswagen",
    name: "Volkswagen",
    logo: "/brands/volkswagen.svg",
    models: [
      {
        id: "gol",
        name: "Gol",
        years: [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
        versions: ["1.0", "1.6", "Trend", "Comfortline", "Highline"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Hatch"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "polo",
        name: "Polo",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
        versions: ["MPI", "MSI", "TSI", "Comfortline", "Highline", "GTS"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Hatch", "Sedan"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "t-cross",
        name: "T-Cross",
        years: [2023, 2022, 2021, 2020, 2019],
        versions: ["200 TSI", "250 TSI", "Comfortline", "Highline", "R-Line"],
        fuelTypes: ["Flex"],
        bodyTypes: ["SUV"],
        transmissions: ["Automático"],
      },
    ],
  },
  {
    id: "fiat",
    name: "Fiat",
    logo: "/brands/fiat.svg",
    models: [
      {
        id: "argo",
        name: "Argo",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
        versions: ["1.0", "1.3", "Drive", "Trekking", "HGT", "Precision"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Hatch"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "strada",
        name: "Strada",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        versions: ["Endurance", "Freedom", "Volcano", "Ranch", "Working"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Picape"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "pulse",
        name: "Pulse",
        years: [2023, 2022, 2021],
        versions: ["Drive", "Audace", "Impetus"],
        fuelTypes: ["Flex"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
    ],
  },
  {
    id: "toyota",
    name: "Toyota",
    logo: "/brands/toyota.svg",
    models: [
      {
        id: "corolla",
        name: "Corolla",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        versions: ["GLi", "XEi", "Altis", "GR-Sport", "Hybrid"],
        fuelTypes: ["Flex", "Híbrido"],
        bodyTypes: ["Sedan", "Hatch"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
      {
        id: "hilux",
        name: "Hilux",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        versions: ["STD", "SR", "SRV", "SRX", "GR-Sport"],
        fuelTypes: ["Diesel", "Flex"],
        bodyTypes: ["Picape"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "yaris",
        name: "Yaris",
        years: [2023, 2022, 2021, 2020, 2019, 2018],
        versions: ["XL", "XS", "XLS", "S"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Hatch", "Sedan"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
    ],
  },
  {
    id: "hyundai",
    name: "Hyundai",
    logo: "/brands/hyundai.svg",
    models: [
      {
        id: "hb20",
        name: "HB20",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        versions: ["Sense", "Vision", "Evolution", "Diamond", "R-Spec", "N Line"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Hatch", "Sedan"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "creta",
        name: "Creta",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
        versions: ["Action", "Comfort", "Limited", "Platinum", "Ultimate"],
        fuelTypes: ["Flex"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático"],
      },
    ],
  },
  {
    id: "honda",
    name: "Honda",
    logo: "/brands/honda.svg",
    models: [
      {
        id: "civic",
        name: "Civic",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        versions: ["LX", "EX", "EXL", "Touring", "Si", "Type R"],
        fuelTypes: ["Flex", "Gasolina"],
        bodyTypes: ["Sedan", "Hatch"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
      {
        id: "hr-v",
        name: "HR-V",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        versions: ["LX", "EX", "EXL", "Touring"],
        fuelTypes: ["Flex"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
    ],
  },
  {
    id: "renault",
    name: "Renault",
    logo: "/brands/renault.svg",
    models: [
      {
        id: "kwid",
        name: "Kwid",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
        versions: ["Life", "Zen", "Intense", "Outsider"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Hatch"],
        transmissions: ["Manual"],
      },
      {
        id: "duster",
        name: "Duster",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        versions: ["Zen", "Intense", "Iconic"],
        fuelTypes: ["Flex"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
    ],
  },
  {
    id: "jeep",
    name: "Jeep",
    logo: "/brands/jeep.svg",
    models: [
      {
        id: "renegade",
        name: "Renegade",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        versions: ["Sport", "Longitude", "Limited", "Trailhawk"],
        fuelTypes: ["Flex", "Diesel"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático"],
      },
      {
        id: "compass",
        name: "Compass",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016],
        versions: ["Sport", "Longitude", "Limited", "Trailhawk", "S"],
        fuelTypes: ["Flex", "Diesel"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático"],
      },
    ],
  },
  {
    id: "nissan",
    name: "Nissan",
    logo: "/brands/nissan.svg",
    models: [
      {
        id: "kicks",
        name: "Kicks",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016],
        versions: ["S", "Advance", "Exclusive", "Special Edition"],
        fuelTypes: ["Flex"],
        bodyTypes: ["SUV"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
      {
        id: "versa",
        name: "Versa",
        years: [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        versions: ["Sense", "Advance", "Exclusive"],
        fuelTypes: ["Flex"],
        bodyTypes: ["Sedan"],
        transmissions: ["Manual", "Automático", "CVT"],
      },
    ],
  },
]

export const getAllBrands = () => {
  return carBrands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    logo: brand.logo,
  }))
}

export const getModelsByBrand = (brandId: string) => {
  const brand = carBrands.find((b) => b.id === brandId)
  return brand
    ? brand.models.map((model) => ({
        id: model.id,
        name: model.name,
      }))
    : []
}

export const getYearsByModel = (brandId: string, modelId: string) => {
  const brand = carBrands.find((b) => b.id === brandId)
  if (!brand) return []

  const model = brand.models.find((m) => m.id === modelId)
  return model ? model.years : []
}

export const getVersionsByModel = (brandId: string, modelId: string) => {
  const brand = carBrands.find((b) => b.id === brandId)
  if (!brand) return []

  const model = brand.models.find((m) => m.id === modelId)
  return model?.versions || []
}

export const getFuelTypesByModel = (brandId: string, modelId: string) => {
  const brand = carBrands.find((b) => b.id === brandId)
  if (!brand) return []

  const model = brand.models.find((m) => m.id === modelId)
  return model?.fuelTypes || []
}

export const getTransmissionsByModel = (brandId: string, modelId: string) => {
  const brand = carBrands.find((b) => b.id === brandId)
  if (!brand) return []

  const model = brand.models.find((m) => m.id === modelId)
  return model?.transmissions || []
}
