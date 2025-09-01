-- Criar tabela para notícias financeiras
CREATE TABLE IF NOT EXISTS public.financial_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Criar tabela para artigos educacionais
CREATE TABLE IF NOT EXISTS public.educational_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  reading_time INTEGER DEFAULT 5,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_news_published_at ON public.financial_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_news_category ON public.financial_news(category);
CREATE INDEX IF NOT EXISTS idx_financial_news_active ON public.financial_news(is_active);

CREATE INDEX IF NOT EXISTS idx_educational_articles_published_at ON public.educational_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_educational_articles_category ON public.educational_articles(category);
CREATE INDEX IF NOT EXISTS idx_educational_articles_active ON public.educational_articles(is_active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_financial_news_updated_at ON public.financial_news;
CREATE TRIGGER update_financial_news_updated_at 
    BEFORE UPDATE ON public.financial_news 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_educational_articles_updated_at ON public.educational_articles;
CREATE TRIGGER update_educational_articles_updated_at 
    BEFORE UPDATE ON public.educational_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas notícias de exemplo
INSERT INTO public.financial_news (title, excerpt, content, category, source, author, source_url, image_url, published_at)
VALUES 
  (
    'Dólar fecha em alta com expectativas sobre política monetária',
    'Moeda americana subiu 0,8% nesta sessão, fechando cotada a R$ 5,85',
    'O dólar americano fechou em alta nesta terça-feira, refletindo as expectativas dos investidores sobre as próximas decisões de política monetária tanto no Brasil quanto nos Estados Unidos. A moeda americana encerrou o pregão cotada a R$ 5,85, representando uma alta de 0,8% em relação ao fechamento anterior.',
    'Economia',
    'InfoMoney',
    'Redação InfoMoney',
    'https://www.infomoney.com.br',
    '/placeholder.svg?height=300&width=400',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'Ibovespa opera em queda com cautela antes de decisões do Fed',
    'Principal índice da bolsa brasileira recua 0,5% no início da sessão',
    'O Ibovespa, principal índice da bolsa brasileira, opera em queda nesta manhã, refletindo a cautela dos investidores antes das importantes decisões de política monetária que serão anunciadas pelo Federal Reserve americano ainda esta semana.',
    'Bolsa',
    'Valor Econômico',
    'Redação Valor',
    'https://valor.globo.com',
    '/placeholder.svg?height=300&width=400',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'Bitcoin volta a subir e se aproxima dos US$ 45.000',
    'Criptomoeda acumula alta de 12% na semana com otimismo do mercado',
    'O Bitcoin voltou a apresentar forte valorização nesta semana, se aproximando novamente da marca dos US$ 45.000. A principal criptomoeda do mundo acumula alta de 12% nos últimos sete dias, impulsionada pelo otimismo renovado dos investidores.',
    'Criptomoedas',
    'CoinTelegraph Brasil',
    'Redação CT',
    'https://cointelegraph.com.br',
    '/placeholder.svg?height=300&width=400',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'Banco Central mantém Selic em 10,75% ao ano',
    'Decisão foi unânime e segue expectativas do mercado financeiro',
    'O Comitê de Política Monetária (Copom) do Banco Central decidiu manter a taxa básica de juros (Selic) em 10,75% ao ano. A decisão foi unânime e estava alinhada com as expectativas do mercado financeiro.',
    'Juros',
    'G1 Economia',
    'Redação G1',
    'https://g1.globo.com/economia',
    '/placeholder.svg?height=300&width=400',
    NOW() - INTERVAL '4 hours'
  ),
  (
    'Como organizar suas finanças pessoais em 2024',
    'Especialistas dão dicas práticas para quem quer começar o ano com as contas em ordem',
    'Especialistas em finanças pessoais compartilham estratégias essenciais para organizar o orçamento familiar e criar um planejamento financeiro eficiente para 2024.',
    'Finanças Pessoais',
    'Exame',
    'Ana Costa',
    'https://exame.com',
    '/placeholder.svg?height=300&width=400',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'Inflação acumula 3,8% em 12 meses, dentro da meta',
    'IPCA fica abaixo das expectativas e reforça cenário de estabilidade',
    'O Índice Nacional de Preços ao Consumidor Amplo (IPCA) acumulou alta de 3,8% nos últimos 12 meses, ficando dentro da meta de inflação estabelecida pelo governo.',
    'Economia',
    'CNN Brasil',
    'Pedro Lima',
    'https://www.cnnbrasil.com.br/economia',
    '/placeholder.svg?height=300&width=400',
    NOW() - INTERVAL '8 hours'
  )
ON CONFLICT DO NOTHING;

-- Inserir alguns artigos educacionais de exemplo
INSERT INTO public.educational_articles (title, excerpt, content, category, author, image_url, reading_time, published_at)
VALUES 
  (
    'Como começar a investir com pouco dinheiro',
    'Descubra estratégias práticas para dar os primeiros passos no mundo dos investimentos mesmo com orçamento limitado.',
    '# Como começar a investir com pouco dinheiro

Muitas pessoas acreditam que é preciso ter muito dinheiro para começar a investir, mas isso não é verdade. Com apenas R$ 30 por mês, você já pode dar os primeiros passos no mundo dos investimentos.

## Passo 1: Organize suas finanças

Antes de investir, é fundamental ter controle sobre suas receitas e despesas. Use planilhas ou aplicativos para acompanhar seus gastos e identificar onde é possível economizar.

## Passo 2: Crie uma reserva de emergência

Tenha sempre um valor guardado equivalente a 3-6 meses de suas despesas essenciais. Isso evita que você precise resgatar investimentos em momentos de aperto financeiro.

## Passo 3: Comece com investimentos simples

Para iniciantes, recomendamos começar com:
- Tesouro Direto
- CDBs de bancos digitais
- Fundos de investimento com baixa taxa de administração

## Conclusão

O importante é começar, mesmo que com pouco. O tempo e a disciplina são seus maiores aliados no mundo dos investimentos.',
    'Investimentos',
    'FinanceHub',
    '/placeholder.svg?height=300&width=400',
    5,
    NOW() - INTERVAL '10 hours'
  ),
  (
    'Entendendo a inflação e seu impacto no seu dinheiro',
    'Aprenda o que é inflação, como ela afeta seu poder de compra e estratégias para se proteger.',
    '# Entendendo a inflação e seu impacto no seu dinheiro

A inflação é o aumento generalizado dos preços de bens e serviços em uma economia. Quando a inflação sobe, seu dinheiro perde poder de compra.

## Como a inflação afeta você

Se a inflação está em 6% ao ano e seu dinheiro está rendendo apenas 2% na poupança, você está perdendo 4% do seu poder de compra anualmente.

## Estratégias de proteção

1. **Invista em ativos que rendem acima da inflação**
2. **Considere investimentos indexados ao IPCA**
3. **Diversifique seus investimentos**
4. **Mantenha-se informado sobre as tendências econômicas**

## Investimentos que protegem da inflação

- Tesouro IPCA+
- Fundos de inflação
- Ações de empresas sólidas
- Fundos imobiliários

## Conclusão

Proteger-se da inflação é essencial para manter seu poder de compra ao longo do tempo.',
    'Conceitos Básicos',
    'FinanceHub',
    '/placeholder.svg?height=300&width=400',
    4,
    NOW() - INTERVAL '12 hours'
  ),
  (
    'Planejamento financeiro para aposentadoria',
    'Estratégias essenciais para garantir uma aposentadoria tranquila e financeiramente segura.',
    '# Planejamento financeiro para aposentadoria

Planejar a aposentadoria é uma das decisões financeiras mais importantes da sua vida. Quanto antes você começar, melhor será sua situação no futuro.

## Por que planejar?

- A previdência social pode não ser suficiente
- O custo de vida tende a aumentar
- Você terá mais tempo para aproveitar a vida

## Estratégias recomendadas

### 1. Calcule quanto você precisará
Estime seus gastos mensais na aposentadoria e multiplique por 25 anos.

### 2. Diversifique seus investimentos
- Previdência privada
- Tesouro Direto
- Fundos de investimento
- Ações de empresas sólidas

### 3. Comece cedo
O tempo é seu maior aliado. Mesmo pequenas quantias investidas regularmente podem se tornar grandes fortunas.

## Conclusão

A aposentadoria dos sonhos não acontece por acaso. Ela é resultado de planejamento e disciplina financeira.',
    'Planejamento Financeiro',
    'FinanceHub',
    '/placeholder.svg?height=300&width=400',
    6,
    NOW() - INTERVAL '14 hours'
  ),
  (
    'O que é CDI e como ele afeta seus investimentos',
    'Entenda o Certificado de Depósito Interbancário e sua importância no mercado financeiro brasileiro.',
    '# O que é CDI e como ele afeta seus investimentos

O CDI (Certificado de Depósito Interbancário) é uma das principais referências do mercado financeiro brasileiro. Entender como ele funciona é essencial para tomar boas decisões de investimento.

## O que é o CDI?

O CDI é a taxa de juros que os bancos cobram uns dos outros para empréstimos de curtíssimo prazo (geralmente um dia).

## Como é calculado?

- É calculado diariamente
- Segue muito próximo à taxa Selic
- É usado como referência para diversos investimentos

## Investimentos que seguem o CDI

- CDBs
- LCIs e LCAs
- Fundos DI
- Alguns fundos de renda fixa

## Por que é importante?

Quando você vê um investimento que rende "120% do CDI", significa que ele paga 120% da taxa CDI vigente.

## Conclusão

O CDI é uma referência fundamental no mercado brasileiro. Conhecê-lo ajuda a comparar e escolher melhores investimentos.',
    'Conceitos Básicos',
    'FinanceHub',
    '/placeholder.svg?height=300&width=400',
    5,
    NOW() - INTERVAL '16 hours'
  )
ON CONFLICT DO NOTHING;
