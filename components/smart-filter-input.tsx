"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ChevronDown, X } from 'lucide-react'

interface SmartFilterInputProps {
  options: Array<{ id: number | string; name: string }>
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  className?: string
}

export function SmartFilterInput({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: SmartFilterInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar opções baseado no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Atualizar termo de busca quando valor muda externamente
  useEffect(() => {
    if (value && !isOpen && searchTerm !== value) {
      setSearchTerm(value)
    }
  }, [value, isOpen])

  // Fechar dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm(value) // Restaurar valor original
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    
    // Só abrir se não estiver aberto e houver texto
    if (!isOpen && newValue.trim()) {
      setIsOpen(true)
    }
  }

  const handleOptionSelect = (option: { id: number | string; name: string }) => {
    setSearchTerm(option.name)
    onChange(option.name)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSearchTerm('')
    onChange('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (searchTerm === value) {
      setSearchTerm('') // Limpar para mostrar todas as opções
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg border"
        >
          <CardContent className="p-0">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                >
                  <span className="truncate">{option.name}</span>
                  {value === option.name && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                Nenhuma opção encontrada
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
