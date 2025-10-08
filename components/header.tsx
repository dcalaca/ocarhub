"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Car, Heart, MessageCircle, Plus, User, LogOut, Settings, Wallet, Menu, History, Calculator, FileText, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import Image from "next/image"
import Logo from "./logo"

// Classes base para Links que devem parecer botões
const baseLinkButtonStyle =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

// Função para obter iniciais do usuário
function getInitials(user: any): string {
  if (user?.displayName) {
    return user.displayName
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (user?.email) {
    return user.email[0].toUpperCase()
  }
  return "U"
}

export function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Verificar se o usuário tem permissão de admin
  const isAdmin = user?.email === 'dcalaca@gmail.com'

  return (
    <header className="bg-black border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="transition-transform duration-300 group-hover:scale-110">
            <Logo size="md" />
          </div>
          <span className="font-poppins text-lg sm:text-xl font-bold text-white tracking-wider transition-all duration-300 group-hover:text-purple-400 group-hover:scale-105">
            Ocar
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-poppins [&>a]:font-medium [&>a]:text-gray-300 [&>a]:hover:text-white [&>a]:transition-colors">
          <Link href="/buscar">Buscar</Link>
          <Link href="/consulta-fipe">Consulta FIPE</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/mensagens">Mensagens</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Verde - Saldo */}
          {user && (
            <Link href="/conta" className="hidden sm:block">
              <div className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 font-poppins">
                <Wallet className="w-4 h-4" />
                <span>R$ {(user.saldo || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </Link>
          )}

          {/* Botão Cinza - Anunciar */}
          <Link
            href="/anunciar"
            className="hidden sm:flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 font-poppins"
          >
            <Plus className="w-4 h-4" />
            <span>Anunciar</span>
          </Link>


          {user ? (
            <>
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-black text-white border-gray-800">
                  <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Saldo no mobile */}
                    <Link href="/conta" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg">
                        <Wallet className="w-4 h-4" />
                        <span className="font-semibold">
                          {(user.saldo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    </Link>

                    {/* Menu items */}
                    <Link
                      href="/buscar"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Car className="w-5 h-5" />
                      Buscar
                    </Link>
                    <Link
                      href="/consulta-fipe"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calculator className="w-5 h-5" />
                      Consulta FIPE
                    </Link>
                    <Link
                      href="/favoritos"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      Favoritos
                    </Link>
                    <Link
                      href="/mensagens"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Mensagens
                    </Link>
                    <Link
                      href="/conta"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Wallet className="w-5 h-5" />
                      Minha Conta
                    </Link>
                    <Link
                      href="/meus-anuncios"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="w-5 h-5" />
                      Meus Anúncios
                    </Link>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Perfil
                    </Link>
                    <Link
                      href="/configuracoes"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Configurações
                    </Link>
                    <Link
                      href="/anunciar"
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Plus className="w-5 h-5" />
                      Anunciar
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="w-5 h-5" />
                          Painel Admin
                        </Link>
                        <Link
                          href="/admin/saldo-teste"
                          className="flex items-center gap-3 py-2 text-gray-300 hover:text-white"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Calculator className="w-5 h-5" />
                          Saldo de Teste
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 py-2 text-gray-300 hover:text-white text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Sair
                    </button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden lg:flex">
                  <Button variant="ghost" size="sm" className="relative text-white hover:bg-gray-800">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL ?? ""} />
                      <AvatarFallback className="bg-purple-600 text-white">{getInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/conta" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Minha Conta</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/meus-anuncios" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Meus anúncios</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoritos" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favoritos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mensagens" className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Mensagens</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Painel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/saldo-teste" className="flex items-center">
                          <Calculator className="mr-2 h-4 w-4" />
                          <span>Saldo de Teste</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Botões para usuários não logados - estilizados diretamente como Links */
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/cadastro"
                className={`${baseLinkButtonStyle} font-poppins text-purple-400 hover:text-purple-300 text-xs sm:text-sm px-2 sm:px-3 py-2 hover:bg-gray-800/50`}
              >
                Cadastre-se
              </Link>
              <Link
                href="/login"
                className={`${baseLinkButtonStyle} font-poppins bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2`}
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
