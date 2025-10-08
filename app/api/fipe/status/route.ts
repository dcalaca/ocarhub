import { NextRequest, NextResponse } from 'next/server';
import FipeConsultaService from '@/lib/fipe-consulta-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar status da FIPE (mês mais recente, total de registros, etc.)
    const status = await FipeConsultaService.verificarAtualizacao();

    return NextResponse.json({
      success: true,
      data: status,
      message: `Dados FIPE atualizados até ${status.latestMonth}`
    });
  } catch (error) {
    console.error('Erro ao verificar status da FIPE:', error);
    return NextResponse.json({ 
      error: 'Erro ao verificar status da FIPE' 
    }, { status: 500 });
  }
}
