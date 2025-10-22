import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;

    return NextResponse.json({
      hasPublicKey: !!publicKey,
      publicKeyPreview: publicKey ? `${publicKey.substring(0, 20)}...` : null,
      hasAccessToken: !!accessToken,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null,
      hasWebhookSecret: !!webhookSecret,
      webhookSecretPreview: webhookSecret ? `${webhookSecret.substring(0, 20)}...` : null,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar variáveis de ambiente' },
      { status: 500 }
    );
  }
}
