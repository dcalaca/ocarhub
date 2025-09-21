"use client"

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TestSelect() {
  const [value, setValue] = useState<string>('')

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste do Select</h2>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opcao1">Opção 1</SelectItem>
          <SelectItem value="opcao2">Opção 2</SelectItem>
          <SelectItem value="opcao3">Opção 3</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-2">Valor selecionado: {value}</p>
    </div>
  )
}
