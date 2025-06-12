export function formatCPF(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "")

  // Aplica a máscara
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, "")

  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(numbers[i]) * (10 - i)
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (Number.parseInt(numbers[9]) !== digit1) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(numbers[i]) * (11 - i)
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return Number.parseInt(numbers[10]) === digit2
}

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, "")
}
