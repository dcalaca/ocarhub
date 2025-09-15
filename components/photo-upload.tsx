"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, ImagePlus, AlertCircle } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"

interface PhotoUploadProps {
  maxPhotos: number
  onChange: (files: File[]) => void
  value: File[]
  className?: string
}

export function PhotoUpload({ maxPhotos, onChange, value, className }: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)

      if (value.length + acceptedFiles.length > maxPhotos) {
        setError(`Você pode adicionar no máximo ${maxPhotos} fotos.`)
        return
      }

      const validFiles: File[] = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]

        // Verificar se é uma imagem
        if (!file.type.startsWith("image/")) {
          setError("Por favor, envie apenas arquivos de imagem.")
          return
        }

        // Verificar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("As imagens devem ter no máximo 5MB.")
          return
        }

        validFiles.push(file)
      }

      onChange([...value, ...validFiles])
    },
    [value, maxPhotos, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif", ".svg"],
    },
    maxFiles: maxPhotos - value.length,
    disabled: value.length >= maxPhotos,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files))
    }
  }

  const removePhoto = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Fotos do veículo</h3>
          <p className="text-xs text-muted-foreground">Adicione até {maxPhotos} fotos do seu veículo</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {value.length} de {maxPhotos}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-2 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((file, index) => (
          <Card key={index} className="relative aspect-square overflow-hidden group">
            <Image
              src={URL.createObjectURL(file) || "/placeholder.svg"}
              alt={`Foto ${index + 1}`}
              fill
              className="object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removePhoto(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Card>
        ))}

        {value.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 aspect-square cursor-pointer hover:border-primary/50 transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <input
              {...getInputProps()}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
              <div className="p-2 bg-primary/10 rounded-full">
                <ImagePlus className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-center text-muted-foreground">
                <span className="font-medium text-primary">Clique para adicionar</span> ou arraste as fotos
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
