"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Send, Phone, MoreVertical, Car, ArrowLeft, MessageCircle, User, Flag, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { MessagesService } from "@/lib/messages-service"
import type { Chat, Message, User, Vehicle } from "@/types"

// Dados mockados removidos - agora usando dados reais do Supabase

export default function MensagensPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carregar chats do usuário
  useEffect(() => {
    if (user) {
      loadChats()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadChats = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🔍 Carregando chats do usuário...')
      const chatsData = await MessagesService.getUserChats(user.id)
      setChats(chatsData)
      console.log(`✅ ${chatsData.length} chats carregados do Supabase`)
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error)
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  // Carregar mensagens do chat selecionado
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
    }
  }, [selectedChat])

  const loadMessages = async (conversationKey: string) => {
    try {
      console.log('🔍 Carregando mensagens da conversa:', conversationKey)
      const messages = await MessagesService.getChatMessages(conversationKey)
      
      setSelectedChat(prev => prev ? {
        ...prev,
        mensagens: messages
      } : null)
      
      console.log(`✅ ${messages.length} mensagens carregadas`)
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.mensagens])

  // No mobile, quando seleciona um chat, esconde a lista
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    setShowChatList(false)
  }

  // Voltar para lista no mobile
  const handleBackToList = () => {
    setShowChatList(true)
    setSelectedChat(null)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return

    try {
      console.log('📤 Enviando mensagem...')
      await MessagesService.sendMessage(selectedChat.id, user.id, newMessage)
      
      // Recarregar mensagens
      await loadMessages(selectedChat.id)
      
      setNewMessage("")
      console.log('✅ Mensagem enviada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
    }
  }

  const handleViewProfile = () => {
    if (!selectedChat) return
    const otherUser = getOtherUser(selectedChat)
    if (otherUser) {
      // Redirecionar para perfil do usuário
      window.open(`/perfil/${otherUser.id}`, '_blank')
    }
  }

  const handleReport = () => {
    if (!selectedChat) return
    const otherUser = getOtherUser(selectedChat)
    if (otherUser) {
      // Implementar modal de denúncia
      alert(`Funcionalidade de denúncia será implementada para ${otherUser.nome}`)
    }
  }

  const handleArchiveConversation = () => {
    if (!selectedChat) return
    if (confirm('Tem certeza que deseja arquivar esta conversa?')) {
      // Implementar arquivamento
      alert('Funcionalidade de arquivamento será implementada')
    }
  }

  const getOtherUser = (chat: Chat): User | null => {
    if (!user) return null
    // A estrutura do chat já vem com other_user do MessagesService
    if (chat.other_user) {
      return {
        id: chat.other_user.id,
        nome: chat.other_user.nome,
        email: chat.other_user.email || "usuario@email.com",
        tipo: "comprador" as const,
        photoURL: chat.other_user.avatar_url || "/placeholder.svg?height=40&width=40",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    return null
  }

  const getVehicle = (chat: Chat): Vehicle | null => {
    // A estrutura do chat já vem com vehicle do MessagesService
    if (chat.vehicle) {
      return {
        id: chat.vehicle.id,
        donoId: user?.id || "",
        marca: chat.vehicle.marca,
        modelo: chat.vehicle.modelo,
        versao: "",
        ano: chat.vehicle.ano,
        cor: "Cinza",
        quilometragem: 40000,
        motor: "Diesel",
        combustivel: ["Diesel"],
        cambio: "manual" as const,
        opcionais: [],
        preco: chat.vehicle.preco,
        placa_parcial: "ABC1234",
        numero_proprietarios: 1,
        observacoes: "Ótimo estado",
        fotos: [],
        plano: "gratuito" as const,
        verificado: false,
        favoritos: [],
        dataCadastro: new Date(),
        status: "ativo",
        cidade: chat.vehicle.cidade,
        views: 0,
        likes: 0,
        shares: 0,
      } as Vehicle
    }
    return null
  }

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const filteredChats = chats.filter((chat) => {
    if (!searchTerm) return true
    const otherUser = getOtherUser(chat)
    const vehicle = getVehicle(chat)
    return (
      otherUser?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mensagens...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
          {/* Lista de Chats */}
          <div className={`lg:w-1/3 ${showChatList ? 'block' : 'hidden lg:block'}`}>
            <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header da Lista */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-white">Mensagens</h1>
                    <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Lista de Chats */}
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredChats.length === 0 ? (
                      <div className="text-center py-8 text-slate-300">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p>Nenhuma conversa encontrada</p>
                      </div>
                    ) : (
                      filteredChats.map((chat) => {
                        const otherUser = getOtherUser(chat)
                        const vehicle = getVehicle(chat)
                        const lastMessage = chat.mensagens?.[chat.mensagens.length - 1]
                        
                        return (
                          <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedChat?.id === chat.id
                                ? "bg-purple-50 border border-purple-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={otherUser?.photoURL} />
                                <AvatarFallback>
                                  {otherUser?.nome?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium text-sm truncate">
                                    {otherUser?.nome || "Usuário"}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    {lastMessage ? formatTime(lastMessage.created_at) : ""}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-1">
                                  <Car className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600 truncate">
                                    {vehicle ? `${vehicle.marca} ${vehicle.modelo}` : "Veículo"}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 truncate">
                                  {lastMessage?.content || "Nenhuma mensagem"}
                                </p>
                                
                                {chat.naoLidas > 0 && (
                                  <Badge className="mt-1 bg-purple-600 text-white text-xs">
                                    {chat.naoLidas}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Selecionado */}
          <div className={`lg:w-2/3 ${!showChatList ? 'block' : 'hidden lg:block'}`}>
            {selectedChat ? (
              <Card className="h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Header do Chat */}
                  <div className="p-4 border-b bg-card">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToList}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getOtherUser(selectedChat)?.photoURL} />
                        <AvatarFallback>
                          {getOtherUser(selectedChat)?.nome?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h2 className="font-semibold">
                          {getOtherUser(selectedChat)?.nome || "Usuário"}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {getVehicle(selectedChat) ? 
                            `${getVehicle(selectedChat)?.marca} ${getVehicle(selectedChat)?.modelo}` : 
                            "Veículo"
                          }
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" title="Ligar">
                          <Phone className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" title="Mais opções">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleViewProfile}>
                              <User className="mr-2 h-4 w-4" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleReport}>
                              <Flag className="mr-2 h-4 w-4" />
                              Denunciar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={handleArchiveConversation}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Arquivar Conversa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedChat.mensagens?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_id === user?.id
                                  ? "text-purple-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input de Mensagem */}
                  <div className="p-4 border-t bg-card">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                    <p>Escolha uma conversa para começar a trocar mensagens</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}