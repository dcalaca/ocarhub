// Utilitários para formatação e validação de telefone

export function formatPhone(phone: string): string {
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, "")

  // Aplica a máscara (11) 99999-9999
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
}

export function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, "")
  return numbers.length >= 10 && numbers.length <= 11
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "")
}
