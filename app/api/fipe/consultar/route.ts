import { NextRequest, NextResponse } from 'next/server';
import FipeConsultaService from '@/lib/fipe-consulta-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca');
    const veiculo = searchParams.get('veiculo');
    const ano = searchParams.get('ano');
    const modelo = searchParams.get('modelo');

    if (!marca || !veiculo || !ano || !modelo) {
      return NextResponse.json({ 
        error: 'Marca, veículo, ano e modelo são obrigatórios' 
      }, { status: 400 });
    }

    // Usar o serviço de consulta FIPE que sempre busca o mês mais recente
    const resultado = await FipeConsultaService.consultarFipe(
      marca,
      veiculo,
      parseInt(ano),
      modelo
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro na API de consulta FIPE:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
