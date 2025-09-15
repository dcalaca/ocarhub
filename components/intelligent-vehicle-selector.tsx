"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { carBrands } from "@/lib/data/car-brands"

interface IntelligentVehicleSelectorProps {
  onSelectionChange?: (selection: any) => void
}

export default function IntelligentVehicleSelector({ onSelectionChange }: IntelligentVehicleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Lista de sugestões populares
  const popularSuggestions = [
    "Toyota Corolla",
    "Honda Civic",
    "Volkswagen Golf",
    "Fiat Uno",
    "Chevrolet Onix",
    "Hyundai HB20",
    "Ford Ka",
    "Renault Kwid",
  ]

  useEffect(() => {
    if (searchTerm.length > 1) {
      // Filtrar marcas
      const brandMatches = carBrands.filter((brand) => brand.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtrar sugestões populares
      const popularMatches = popularSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      // Combinar resultados sem duplicatas
      const combinedResults = [...new Set([...brandMatches, ...popularMatches])].slice(0, 6)
      setSuggestions(combinedResults)
      setShowSuggestions(combinedResults.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm])

  const handleSelection = (selection: string) => {
    setSearchTerm(selection)
    setShowSuggestions(false)
    if (onSelectionChange) {
      onSelectionChange({ term: selection })
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim() && onSelectionChange) {
      onSelectionChange({ term: searchTerm })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <h3 className="text-xl font-semibold mb-2 text-white">Busca Rápida</h3>
          <p className="text-sm text-white/80 mb-4">Digite o nome da marca ou modelo para buscar rapidamente</p>

          <div className="relative">
            <div className="flex">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Ex: Toyota Corolla, Honda Civic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              </div>
              <Button onClick={handleSearch} className="ml-2 bg-white text-purple-700 hover:bg-white/90">
                Buscar
              </Button>
            </div>

            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-800"
                      onClick={() => handleSelection(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!searchTerm && (
            <div className="mt-4">
              <p className="text-xs text-white/70 mb-2">Termos populares:</p>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.slice(0, 5).map((term, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelection(term)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
