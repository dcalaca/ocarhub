/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Configuração para upload de arquivos grandes
  experimental: {
    serverComponentsExternalPackages: ['csv-parser'],
  },
  // Configuração de tamanho máximo do corpo da requisição
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export default nextConfig
