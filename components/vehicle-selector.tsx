"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Image from "next/image"

type Option = {
  value: string
  label: string
  image?: string
}

interface VehicleSelectorProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  showImages?: boolean
}

export function VehicleSelector({
  options,
  value,
  onChange,
  placeholder,
  emptyMessage = "Nenhum resultado encontrado.",
  className,
  disabled = false,
  showImages = false,
}: VehicleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Option | undefined>(options.find((option) => option.value === value))

  useEffect(() => {
    setSelected(options.find((option) => option.value === value))
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 px-3 py-2 text-left font-normal",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-3 truncate">
            <span className="truncate text-sm font-sans">
              {selected ? selected.label : placeholder}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Buscar ${placeholder.toLowerCase()}...`} 
            className="h-10 border-0 focus:ring-0" 
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[200px]">
                {options.map((option, index) => (
                  <CommandItem
                    key={`${option.value}-${index}`}
                    value={option.value}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <span className="text-sm font-sans">{option.label}</span>
                    {option.value === value && (
                      <Check className="ml-auto h-4 w-4 flex-shrink-0 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
