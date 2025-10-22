'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function TestAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [oauthToken, setOauthToken] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Dados de exemplo para teste
  const testItems = [
    {
      id: 'test-item-1',
      title: 'Plano Premium',
      description: 'Acesso completo à plataforma',
      price: 59.90,
      quantity: 1
    }
  ];

  const testPayer = {
    name: 'Teste Usuario',
    email: 'teste@exemplo.com'
  };

  // Credenciais de teste (substitua pelas suas)
  const testCredentials = {
    client_id: 'SEU_CLIENT_ID_AQUI',
    client_secret: 'SEU_CLIENT_SECRET_AQUI'
  };

  // Função para obter token OAuth
  const getOAuthToken = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Obtendo token OAuth...');
      
      const response = await fetch('/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: testCredentials.client_id,
          client_secret: testCredentials.client_secret,
          grant_type: 'client_credentials'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao obter token OAuth');
      }

      setOauthToken(data.token.access_token);
      toast.success('Token OAuth obtido com sucesso!');
      
      console.log('✅ Token OAuth:', data.token.access_token?.substring(0, 20) + '...');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro OAuth: ${errorMessage}`);
      console.error('❌ Erro OAuth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para criar preferência com OAuth
  const createPreferenceWithOAuth = async () => {
    if (!oauthToken) {
      toast.error('Obtenha o token OAuth primeiro');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Criando preferência com OAuth...');
      
      const response = await fetch('/api/payment/create-preference-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: testItems,
          payer: testPayer,
          external_reference: `oauth-test-${Date.now()}`,
          client_id: testCredentials.client_id,
          client_secret: testCredentials.client_secret
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar preferência');
      }

      setPreferenceId(data.preference_id);
      setCheckoutUrl(data.checkout_url);
      
      toast.success('Preferência criada com OAuth!');
      console.log('✅ Preferência:', data.preference_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro na preferência: ${errorMessage}`);
      console.error('❌ Erro na preferência:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Teste com Contas de Teste (OAuth)
          </h1>

          <div className="space-y-6">
            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Instruções para Contas de Teste
              </h2>
              <ul className="space-y-2 text-blue-800">
                <li>1. Configure suas credenciais de teste abaixo</li>
                <li>2. Obtenha o token OAuth</li>
                <li>3. Crie uma preferência com OAuth</li>
                <li>4. Use a conta de teste para pagamento</li>
              </ul>
            </div>

            {/* Credenciais */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                Credenciais de Teste
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-800">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={testCredentials.client_id}
                    onChange={(e) => {
                      testCredentials.client_id = e.target.value;
                    }}
                    className="mt-1 block w-full border border-yellow-300 rounded-md px-3 py-2"
                    placeholder="Seu Client ID de teste"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-800">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={testCredentials.client_secret}
                    onChange={(e) => {
                      testCredentials.client_secret = e.target.value;
                    }}
                    className="mt-1 block w-full border border-yellow-300 rounded-md px-3 py-2"
                    placeholder="Seu Client Secret de teste"
                  />
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-4">
              <button
                onClick={getOAuthToken}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Obtendo Token...' : 'Obter Token OAuth'}
              </button>

              <button
                onClick={createPreferenceWithOAuth}
                disabled={isLoading || !oauthToken}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Criando Preferência...' : 'Criar Preferência OAuth'}
              </button>
            </div>

            {/* Status */}
            {oauthToken && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Token OAuth Obtido
                </h3>
                <p className="text-green-800 text-sm">
                  Token: {oauthToken.substring(0, 20)}...
                </p>
              </div>
            )}

            {preferenceId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Preferência Criada
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  ID: {preferenceId}
                </p>
                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Ir para Pagamento
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
