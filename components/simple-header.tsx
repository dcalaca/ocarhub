"use client"

import Link from "next/link"
import Image from "next/image"

export function SimpleHeader() {
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110">
            <Image src="/logo-ocar.svg" alt="Ocar Logo" fill className="object-contain rounded-full" />
          </div>
          <span className="font-poppins text-lg sm:text-xl font-bold text-white tracking-wider transition-all duration-300 group-hover:text-purple-400 group-hover:scale-105">
            Ocar
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link href="/buscar" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
            Buscar
          </Link>
          <Link href="/favoritos" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
            Favoritos
          </Link>
          <Link href="/mensagens" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
            Mensagens
          </Link>
          <Link
            href="/historico-veicular"
            className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            Histórico Veicular
          </Link>
        </nav>
      </div>
    </header>
  )
}

// Exportar também como Header para compatibilidade
export { SimpleHeader as Header }
