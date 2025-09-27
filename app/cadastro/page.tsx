"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MailOpenIcon as Envelope, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"



interface FormData {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  aceitaTermos: boolean
  aceitaNewsletter: boolean
}

interface FormErrors {
  nome?: string
  email?: string
  senha?: string
  confirmarSenha?: string
  aceitaTermos?: string
}

const CadastroPage = () => {
  const router = useRouter()
  const { register, user } = useAuth()
  const { toast } = useToast()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
    aceitaNewsletter: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])


  const nextStep = () => {
    const currentErrors = validateStep1()
    
    if (Object.keys(currentErrors).length === 0) {
      setErrors({})
      setStep(2)
    } else {
      setErrors(currentErrors)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const currentErrors = validateStep2()
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      console.log("Dados enviados:", formData)
      
      // Registrar usuário no Supabase com dados básicos
      await register({
        email: formData.email,
        password: formData.senha,
        nome: formData.nome,
        tipo_usuario: "comprador", // Por padrão, todos começam como comprador
        // Dados opcionais - serão preenchidos depois no perfil
        cpf: undefined,
        telefone: undefined,
        endereco: undefined,
        data_nascimento: undefined,
        cnpj: undefined,
      })

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo à Ocar! Faça login para continuar.",
      })

      // Limpar o formulário após o envio bem-sucedido
      setFormData({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        telefone: "",
        cpf: "",
        estado: "",
        cidade: "",
        aceitaTermos: false,
        aceitaNewsletter: false,
      })
      setStep(1) // Resetar para o primeiro passo
      
      // Redirecionar para login
      router.push("/login")
    } catch (error: any) {
      console.error("Erro ao enviar os dados:", error)
      
      let errorMessage = "Ocorreu um erro ao realizar o cadastro."
      
      if (error.message?.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login."
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Email inválido. Verifique o formato."
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres."
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

  }


  const validateStep1 = () => {
    const newErrors: FormErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.senha.trim()) {
      newErrors.senha = "Senha é obrigatória"
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter no mínimo 6 caracteres"
    }

    if (!formData.confirmarSenha.trim()) {
      newErrors.confirmarSenha = "Confirmar senha é obrigatório"
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem"
    }

    return newErrors
  }

  const validateStep2 = () => {
    const newErrors: FormErrors = {}

    if (!formData.aceitaTermos) {
      newErrors.aceitaTermos = "Você precisa aceitar os termos de uso"
    }

    return newErrors
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-8">Criar uma conta</h1>

          {/* Opção de cadastro pelo Google */}
          <div className="mb-8">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-3 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Cadastrar com Google
              <span className="text-xs text-gray-500 ml-2">(em breve)</span>
            </Button>
          </div>

          {/* Divisor */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Dados básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    className={`pl-10 ${errors.nome ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Envelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showSenha ? "text" : "password"}
                    id="senha"
                    name="senha"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.senha ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-sm text-red-500 mt-1">{errors.senha}</p>}
              </div>

              <div>
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmarSenha ? "text" : "password"}
                    id="confirmarSenha"
                    name="confirmarSenha"
                    placeholder="Confirmar Senha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmarSenha ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>}
              </div>

              <Button type="button" onClick={nextStep} className="w-full bg-purple-600 hover:bg-purple-700">
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Termos e Newsletter */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termos"
                  name="aceitaTermos"
                  checked={formData.aceitaTermos}
                  onCheckedChange={(checked) =>
                    handleChange({ target: { name: "aceitaTermos", type: "checkbox", checked } } as any)
                  }
                />
                <Label htmlFor="termos" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                  Aceito os{" "}
                  <a href="#" className="text-blue-500">
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a href="#" className="text-blue-500">
                    Política de Privacidade
                  </a>
                </Label>
              </div>
              {errors.aceitaTermos && <p className="text-sm text-red-500 mt-1">{errors.aceitaTermos}</p>}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newsletter"
                  name="aceitaNewsletter"
                  checked={formData.aceitaNewsletter}
                  onCheckedChange={(checked) =>
                    handleChange({ target: { name: "aceitaNewsletter", type: "checkbox", checked } } as any)
                  }
                />
                <Label
                  htmlFor="newsletter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
                >
                  Desejo receber novidades e ofertas por email
                </Label>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Finalizar Cadastro"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  )
}

export default CadastroPage
