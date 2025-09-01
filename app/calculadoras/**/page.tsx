"use client"

import { useFinanceAuth } from "@/hooks/use-finance-auth"

const Page = () => {
  const { user } = useFinanceAuth()

  return (
    <div>
      {user ? (
        <div>
          <h1>Calculadora</h1>
          <p>Bem-vindo, {user?.email}!</p>
          {/* Rest of your calculator logic here */}
        </div>
      ) : (
        <div>
          <h1>Calculadora</h1>
          <p>Por favor, faça login para usar a calculadora.</p>
        </div>
      )}
    </div>
  )
}

export default Page
