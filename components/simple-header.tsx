"use client"

import Link from "next/link"
import Image from "next/image"

export function SimpleHeader() {
  return (
    <header 
      className="bg-black border-b border-gray-800 fixed top-0 left-0 right-0 z-50 w-full" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        width: '100%',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110">
            <img src="/logo-ocar-v2.jpg" alt="Ocar Logo" className="w-full h-full object-contain" />
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
        </nav>
      </div>
    </header>
  )
}

// Exportar também como Header para compatibilidade
export { SimpleHeader as Header }
