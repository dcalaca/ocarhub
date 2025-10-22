import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📋 Listando categorias disponíveis para Mercado Pago...');
    
    // Categorias recomendadas pelo Mercado Pago
    const categories = [
      {
        id: 'art',
        name: 'Arte e Antiguidades',
        description: 'Obras de arte, antiguidades, colecionáveis'
      },
      {
        id: 'baby',
        name: 'Bebê',
        description: 'Produtos para bebês e crianças'
      },
      {
        id: 'books',
        name: 'Livros',
        description: 'Livros físicos e digitais'
      },
      {
        id: 'cameras',
        name: 'Câmeras e Fotografia',
        description: 'Equipamentos fotográficos'
      },
      {
        id: 'cars',
        name: 'Carros e Motos',
        description: 'Veículos automotivos'
      },
      {
        id: 'cell_phones',
        name: 'Celulares e Telefones',
        description: 'Smartphones e telefones'
      },
      {
        id: 'clothing',
        name: 'Roupas e Acessórios',
        description: 'Vestuário e acessórios'
      },
      {
        id: 'computers',
        name: 'Computadores',
        description: 'PCs, notebooks, tablets'
      },
      {
        id: 'electronics',
        name: 'Eletrônicos',
        description: 'Aparelhos eletrônicos em geral'
      },
      {
        id: 'furniture',
        name: 'Móveis e Decoração',
        description: 'Móveis para casa e escritório'
      },
      {
        id: 'games',
        name: 'Jogos e Consoles',
        description: 'Videogames e jogos'
      },
      {
        id: 'health',
        name: 'Saúde e Beleza',
        description: 'Produtos de saúde e cosméticos'
      },
      {
        id: 'home',
        name: 'Casa e Jardim',
        description: 'Produtos para casa e jardim'
      },
      {
        id: 'jewelry',
        name: 'Joias e Relógios',
        description: 'Joias, relógios e acessórios'
      },
      {
        id: 'music',
        name: 'Música e Instrumentos',
        description: 'Instrumentos musicais e acessórios'
      },
      {
        id: 'others',
        name: 'Outros',
        description: 'Categoria padrão para outros produtos'
      },
      {
        id: 'sports',
        name: 'Esportes e Lazer',
        description: 'Equipamentos esportivos'
      },
      {
        id: 'toys',
        name: 'Brinquedos',
        description: 'Brinquedos e jogos infantis'
      },
      {
        id: 'travel',
        name: 'Viagens',
        description: 'Serviços de viagem e turismo'
      }
    ];

    return NextResponse.json({
      success: true,
      message: 'Categorias disponíveis para Mercado Pago',
      categories,
      recommendations: [
        '✅ Use category_id específico para melhorar aprovação',
        '✅ Evite usar "others" quando possível',
        '✅ Categoria correta reduz chances de fraude',
        '✅ Melhora índice de aprovação de pagamentos'
      ],
      usage: {
        example: {
          items: [
            {
              id: 'produto-1',
              title: 'Smartphone Samsung',
              quantity: 1,
              unit_price: 1500.00,
              currency_id: 'BRL',
              category_id: 'cell_phones' // Categoria específica
            }
          ]
        },
        note: 'Se não especificar category_id, será usado "others" por padrão'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
