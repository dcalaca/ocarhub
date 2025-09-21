"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface ExpandableFilterGroupProps {
  title: string
  options: FilterOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  placeholder?: string
}

export function ExpandableFilterGroup({
  title,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Selecione"
}: ExpandableFilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleOptionToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter(v => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(options.map(option => option.value))
    }
  }

  const selectedCount = selectedValues.length
  const isAllSelected = selectedValues.length === options.length

  return (
    <div className="border-b border-gray-700 pb-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-white hover:text-gray-300 transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              {selectedCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isAllSelected ? "Desmarcar todos" : "Selecionar todos"}
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectionChange([])}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleOptionToggle(option.value)}
                  className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor={`${title}-${option.value}`}
                  className="text-sm text-gray-300 cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({option.count.toLocaleString('pt-BR')})
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>

          {selectedValues.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Selecionados: {selectedValues.length} de {options.length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
