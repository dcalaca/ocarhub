"use client"

import { PixPayment } from "@/components/pix-payment"

export default function WalletPage() {
  return (
    <div>
      <h1>Carteira</h1>
      {/* Substitua o botão "Adicionar Saldo" por: */}
      <PixPayment
        onPaymentCreated={(data) => {
          // Atualizar dados da carteira quando pagamento for criado
          console.log("Pagamento criado:", data)
        }}
      />
    </div>
  )
}
