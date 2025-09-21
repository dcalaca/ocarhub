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
