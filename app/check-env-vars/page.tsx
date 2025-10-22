'use client';

import { useState, useEffect } from 'react';

export default function CheckEnvVars() {
  const [envVars, setEnvVars] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const response = await fetch('/api/check-env-vars');
        const data = await response.json();
        setEnvVars(data);
      } catch (error) {
        console.error('Erro ao verificar variaveis de ambiente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnvVars();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando variaveis de ambiente...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Verificacao de Variaveis de Ambiente
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Variaveis do Mercado Pago
          </h2>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">NEXT_PUBLIC_MP_PUBLIC_KEY</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  envVars?.hasPublicKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {envVars?.hasPublicKey ? 'Configurada' : 'Nao configurada'}
                </span>
                {envVars?.hasPublicKey && (
                  <span className="text-sm text-gray-600 font-mono">
                    {envVars.publicKeyPreview}
                  </span>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">MP_ACCESS_TOKEN</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  envVars?.hasAccessToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {envVars?.hasAccessToken ? 'Configurada' : 'Nao configurada'}
                </span>
                {envVars?.hasAccessToken && (
                  <span className="text-sm text-gray-600 font-mono">
                    {envVars.accessTokenPreview}
                  </span>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">MP_WEBHOOK_SECRET</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  envVars?.hasWebhookSecret ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {envVars?.hasWebhookSecret ? 'Configurada' : 'Nao configurada'}
                </span>
                {envVars?.hasWebhookSecret && (
                  <span className="text-sm text-gray-600 font-mono">
                    {envVars.webhookSecretPreview}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!envVars?.hasPublicKey && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Acao Necessaria
              </h3>
              <p className="text-yellow-800 mb-4">
                A variavel <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_MP_PUBLIC_KEY</code> nao esta configurada no Vercel.
              </p>
              <div className="space-y-2 text-sm text-yellow-800">
                <p><strong>Para configurar:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Acesse o painel do Vercel</li>
                  <li>Va em Settings → Environment Variables</li>
                  <li>Adicione: <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_MP_PUBLIC_KEY</code></li>
                  <li>Valor: <code className="bg-yellow-100 px-1 rounded">APP_USR-4ea18afd-1d72-489e-9b6d-dc62810e7b14</code></li>
                  <li>Marque para "Production", "Preview" e "Development"</li>
                  <li>Faca um novo deploy</li>
                </ol>
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Instrucoes Completas
            </h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p><strong>1. Acesse o Vercel:</strong> <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://vercel.com/dashboard</a></p>
              <p><strong>2. Selecione seu projeto:</strong> ocarhub</p>
              <p><strong>3. Va em Settings → Environment Variables</p>
              <p><strong>4. Adicione as variaveis:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_MP_PUBLIC_KEY</code> = <code className="bg-blue-100 px-1 rounded">APP_USR-4ea18afd-1d72-489e-9b6d-dc62810e7b14</code></li>
                <li>• <code className="bg-blue-100 px-1 rounded">MP_ACCESS_TOKEN</code> = <code className="bg-blue-100 px-1 rounded">APP_USR-8224799763305887-061016-e3b177fb8eb1c01171b9783dfcd86dc6-94107750</code></li>
                <li>• <code className="bg-blue-100 px-1 rounded">MP_WEBHOOK_SECRET</code> = <code className="bg-blue-100 px-1 rounded">46df3fb5e3e8836fb14d5a9ae951e90f2a1dfa13cd58ad156cf432767e26a184</code></li>
              </ul>
              <p><strong>5. Marque para todos os ambientes</strong></p>
              <p><strong>6. Faca um novo deploy</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}