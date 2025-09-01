"use client"

import type React from "react"

import { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number
  onChange?: (value: number) => void
}

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(num)
}

const parseCurrency = (str: string): number => {
  const numbers = str.replace(/[^\d]/g, "")
  return numbers ? Number.parseInt(numbers) / 100 : 0
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = 0, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value ? formatCurrency(value) : "")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const numericValue = parseCurrency(inputValue)
      const formatted = formatCurrency(numericValue)

      setDisplayValue(formatted)
      onChange?.(numericValue)
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
        placeholder="R$ 0,00"
      />
    )
  },
)

CurrencyInput.displayName = "CurrencyInput"
