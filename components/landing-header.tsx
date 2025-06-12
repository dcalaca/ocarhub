"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-black/50 backdrop-blur-sm">
      {/* Logo e nome */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
        <Image
          src="/logo-ocar-final.png"
          alt="OcarHub Logo"
          width={40}
          height={40}
          className="rounded-lg object-contain"
        />
        <span>
          <span className="text-blue-500">Ocar</span>
          <span className="text-white">Hub</span>
        </span>
      </Link>

      {/* Botões de navegação */}
      <div className="flex items-center gap-4">
        <Link href="/auth/login">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Entrar
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button className="bg-primary hover:bg-primary/90 text-white">Cadastrar</Button>
        </Link>
      </div>
    </header>
  )
}
