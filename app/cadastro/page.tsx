"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MailOpenIcon as Envelope, Lock, Phone, CreditCard, User, MapPin } from "lucide-react"

// Função para validar CPF com algoritmo real
const validateCPF = (cpf: string): boolean => {
  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, "")

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Calcula o primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF[i]) * (10 - i)
  }
  let firstDigit = 11 - (sum % 11)
  if (firstDigit >= 10) firstDigit = 0

  // Calcula o segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF[i]) * (11 - i)
  }
  let secondDigit = 11 - (sum % 11)
  if (secondDigit >= 10) secondDigit = 0

  // Verifica se os dígitos calculados conferem
  return firstDigit === Number.parseInt(cleanCPF[9]) && secondDigit === Number.parseInt(cleanCPF[10])
}

interface FormData {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  telefone: string
  cpf: string
  estado: string
  cidade: string
  aceitaTermos: boolean
  aceitaNewsletter: boolean
}

interface FormErrors {
  nome?: string
  email?: string
  senha?: string
  confirmarSenha?: string
  telefone?: string
  cpf?: string
  estado?: string
  cidade?: string
  aceitaTermos?: string
}

const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

const CadastroPage = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
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
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  const nextStep = () => {
    let currentErrors = {}

    switch (step) {
      case 1:
        currentErrors = validateStep1()
        break
      case 2:
        currentErrors = validateStep2()
        break
      case 3:
        currentErrors = validateStep3()
        break
      default:
        break
    }

    if (Object.keys(currentErrors).length === 0) {
      setErrors({})
      setStep(step + 1)
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

    const currentErrors = validateStep4()
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors)
      return
    }

    try {
      // Simulação de envio para API
      console.log("Dados enviados:", formData)
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
      alert("Cadastro realizado com sucesso!")
      router.push("/")
    } catch (error) {
      console.error("Erro ao enviar os dados:", error)
      alert("Ocorreu um erro ao realizar o cadastro.")
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handlePhoneChange = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleanedValue = value.replace(/\D/g, "")

    // Aplica a máscara
    let maskedValue = cleanedValue
    if (cleanedValue.length > 0) {
      maskedValue = `(${cleanedValue.substring(0, 2)}`
    }
    if (cleanedValue.length > 2) {
      maskedValue = `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 7)}`
    }
    if (cleanedValue.length > 7) {
      maskedValue = `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 7)}-${cleanedValue.substring(7, 11)}`
    }

    setFormData({
      ...formData,
      telefone: maskedValue,
    })
  }

  const handleCPFChange = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleanedValue = value.replace(/\D/g, "")

    // Limita a 11 dígitos
    if (cleanedValue.length > 11) return

    // Aplica a máscara
    let maskedValue = cleanedValue
    if (cleanedValue.length > 3) {
      maskedValue = `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3)}`
    }
    if (cleanedValue.length > 6) {
      maskedValue = `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3, 6)}.${cleanedValue.substring(6)}`
    }
    if (cleanedValue.length > 9) {
      maskedValue = `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3, 6)}.${cleanedValue.substring(6, 9)}-${cleanedValue.substring(9)}`
    }

    setFormData({
      ...formData,
      cpf: maskedValue,
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

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório"
    } else {
      // Remove formatação para validar
      const cleanPhone = formData.telefone.replace(/\D/g, "")
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        newErrors.telefone = "Telefone inválido. Use o formato (11) 99999-9999"
      }
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido. Verifique os números digitados"
    }

    return newErrors
  }

  const validateStep3 = () => {
    const newErrors: FormErrors = {}

    if (!formData.estado) {
      newErrors.estado = "Estado é obrigatório"
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = "Cidade é obrigatória"
    }

    return newErrors
  }

  const validateStep4 = () => {
    const newErrors: FormErrors = {}

    if (!formData.aceitaTermos) {
      newErrors.aceitaTermos = "Você precisa aceitar os termos de uso"
    }

    return newErrors
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-8">Criar uma conta</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Dados da conta */}
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
                    type="password"
                    id="senha"
                    name="senha"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className={`pl-10 ${errors.senha ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.senha && <p className="text-sm text-red-500 mt-1">{errors.senha}</p>}
              </div>

              <div>
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    placeholder="Confirmar Senha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className={`pl-10 ${errors.confirmarSenha ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.confirmarSenha && <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>}
              </div>

              <Button type="button" onClick={nextStep} className="w-full bg-purple-600 hover:bg-purple-700">
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Dados pessoais */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`pl-10 ${errors.telefone ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.telefone && <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>}
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    className={`pl-10 ${errors.cpf ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Voltar
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Localização */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select onValueChange={(value) => handleChange({ target: { name: "estado", value } } as any)}>
                  <SelectTrigger className={`w-full ${errors.estado ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosBrasil.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && <p className="text-sm text-red-500 mt-1">{errors.estado}</p>}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="cidade"
                    name="cidade"
                    placeholder="Sua cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className={`pl-10 ${errors.cidade ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.cidade && <p className="text-sm text-red-500 mt-1">{errors.cidade}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Voltar
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Termos e Newsletter */}
          {step === 4 && (
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
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  Finalizar Cadastro
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CadastroPage
