// Este arquivo já foi atualizado anteriormente e deve estar correto.
// Apenas para garantir que está no CodeProject.
export interface User {
  id: string
  nome: string
  email: string
  tipo: "comprador" | "vendedor"
  telefone?: string
  cidade?: string
  estado?: string
  cep?: string
  endereco?: string
  cpf?: string
  photoURL?: string
  displayName?: string
  saldo: number
  createdAt: Date
  updatedAt: Date
}

export interface Vehicle {
  id: string
  donoId: string
  marca: string
  modelo: string
  versao?: string
  ano: number
  cor: string
  quilometragem: number
  motor: string
  combustivel: string[]
  cambio: "manual" | "automatico" | "cvt"
  opcionais: string[]
  preco: number
  fipe?: number
  placaParcial: string
  numeroProprietarios: number
  observacoes?: string
  fotos: string[]
  plano: "gratuito" | "destaque"
  verificado: boolean
  favoritos: string[] // Array de user IDs que favoritaram
  dataCadastro: Date
  status: "ativo" | "vendido" | "pausado"
  cidade: string
  views: number
  likes: number // Contagem total de likes
  shares: number
}

export interface Chat {
  id: string
  anuncioId: string
  remetenteId: string
  destinatarioId: string
  mensagens: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  texto: string
  remetenteId: string
  timestamp: Date
  lida: boolean
}

export interface Plan {
  id: string
  tipo: "gratuito" | "destaque"
  valor: number
  recursos: string[]
  duracao: number
}

export interface Interaction {
  id: string
  usuarioId: string
  veiculoId: string
  tipo: "like" | "favorito" // Tipo da interação
  createdAt: Date
}

export interface Transaction {
  id: string
  usuarioId: string
  tipo: "deposito" | "saque" | "consulta_historico" | "anuncio_destaque" | "anuncio_premium" | "taxa_anuncio"
  valor: number
  descricao: string
  status: "pendente" | "aprovado" | "rejeitado" | "processando"
  metodoPagamento?: "pix" | "cartao" | "boleto"
  chavePixOrigem?: string
  chavePixDestino?: string
  createdAt: Date
  processedAt?: Date
}

export interface SaqueRequest {
  id: string
  usuarioId: string
  valor: number
  chavePix: string
  status: "pendente" | "aprovado" | "rejeitado" | "processado"
  motivoRejeicao?: string
  createdAt: Date
  processedAt?: Date
}
