// Configuração do Firebase (simulada para desenvolvimento)
// Em produção, você usaria as credenciais reais do Firebase

export const auth = {
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simular verificação de autenticação
    const user = localStorage.getItem("ocar_user")
    if (user) {
      callback(JSON.parse(user))
    } else {
      callback(null)
    }

    // Retornar função de limpeza
    return () => {}
  },

  signOut: async () => {
    localStorage.removeItem("ocar_user")
    return Promise.resolve()
  },
}

export const googleAuthProvider = {
  // Simulação do provedor Google
}

// Função auxiliar para simular login
export const simulateSignIn = (email: string, password: string) => {
  const mockUser = {
    uid: "mock-user-id",
    email: email,
    displayName: email.split("@")[0],
    photoURL: null,
  }

  localStorage.setItem("ocar_user", JSON.stringify(mockUser))
  return mockUser
}

// Função auxiliar para simular login com Google
export const simulateGoogleSignIn = () => {
  const mockUser = {
    uid: "google-user-id",
    email: "usuario@gmail.com",
    displayName: "Usuário Google",
    photoURL: "/placeholder.svg?height=40&width=40",
  }

  localStorage.setItem("ocar_user", JSON.stringify(mockUser))
  return mockUser
}
