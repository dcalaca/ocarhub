# Guia de Implementação - Filtros Webmotors OcarHub

## 🎯 Objetivo
Criar um sistema de filtros encadeados estilo Webmotors para busca de veículos na plataforma OcarHub.

## 📋 Estrutura Implementada

### 1. Função SQL (Supabase)
- **Arquivo**: `database/ocarhub-filtros-function.sql`
- **Função**: `ocarhub_filtros(p_marca, p_modelo_base, p_versao, p_ano)`
- **Retorno**: JSON com marcas, modelos, versões, anos e resultados

### 2. API Endpoint (Next.js)
- **Arquivo**: `app/api/ocar/filtros/route.ts`
- **URL**: `/api/ocar/filtros`
- **Métodos**: GET, POST
- **Parâmetros**: marca, modelo_base, versao, ano

### 3. Hook Personalizado
- **Arquivo**: `hooks/use-ocar-filtros.ts`
- **Funcionalidade**: Gerenciamento de estado dos filtros
- **Dependências**: SWR para cache e revalidação

### 4. Componente React
- **Arquivo**: `components/ocar-filtros-webmotors.tsx`
- **Funcionalidade**: Interface de filtros encadeados
- **Dependências**: shadcn/ui components

### 5. Página de Exemplo
- **Arquivo**: `app/buscar/page.tsx`
- **URL**: `/buscar`
- **Funcionalidade**: Página de demonstração dos filtros

## 🚀 Como Implementar

### Passo 1: Executar a Função SQL
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: database/ocarhub-filtros-function.sql
```

### Passo 2: Instalar Dependências
```bash
npm install swr
# ou
yarn add swr
```

### Passo 3: Configurar Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### Passo 4: Testar a Função
```bash
node scripts/test-ocar-filtros.js
```

### Passo 5: Acessar a Página
```
http://localhost:3000/buscar
```

## 🔧 Lógica de Parsing

### Modelo Base
- **Regex**: `\s\d+(?:\.\d+)?[^\s]*.*$`
- **Exemplo**: "Corsa Sedan 1.8 MPFI FlexPower 8V 4p" → "Corsa Sedan"

### Versão
- **Regex**: `^(.*?)(\s\d+(?:\.\d+)?[^\s]*.*)$`
- **Exemplo**: "Corsa Sedan 1.8 MPFI FlexPower 8V 4p" → "1.8 MPFI FlexPower 8V 4p"

### Fallback por Tokens
- **Tokens**: 16V, TDI, CDI, TSI, MPI, FLEX, FLEXPOWER, TURBO, SUPERCHARGED, HYBRID, CVT, AT, MT
- **Exemplo**: "Golf TSI Highline" → modelo_base: "Golf", versao: "TSI Highline"

## 📊 Estrutura de Dados

### Entrada (Filtros)
```typescript
interface FiltrosState {
  marca: string | null
  modelo_base: string | null
  versao: string | null
  ano: number | null
}
```

### Saída (Resultado)
```typescript
interface FiltrosData {
  marcas: string[]
  modelos: string[]
  versoes: string[]
  anos: number[]
  resultados: Array<{
    marca: string
    modelo_base: string
    versao: string
    ano: number
    codigo_fipe: string
    referencia_mes: string
    preco: number
  }>
}
```

## 🎨 Funcionalidades da Interface

### Filtros Encadeados
- ✅ **Marca**: Lista todas as marcas disponíveis
- ✅ **Modelo**: Filtra por marca selecionada
- ✅ **Versão**: Filtra por modelo selecionado
- ✅ **Ano**: Filtra por versão selecionada

### Recursos Visuais
- ✅ **Loading States**: Indicadores de carregamento
- ✅ **Badges**: Mostra filtros ativos
- ✅ **Reset**: Limpar todos os filtros
- ✅ **Contadores**: Quantidade de resultados
- ✅ **Formatação**: Preços em Real, datas formatadas

### Responsividade
- ✅ **Mobile**: Grid responsivo
- ✅ **Desktop**: Layout otimizado
- ✅ **Tablet**: Adaptação automática

## 🔍 Exemplos de Uso

### Buscar por Marca
```typescript
const { setMarca } = useOcarFiltros()
setMarca('GM - Chevrolet')
```

### Buscar por Modelo
```typescript
const { setMarca, setModeloBase } = useOcarFiltros()
setMarca('GM - Chevrolet')
setModeloBase('Corsa Sedan')
```

### Buscar por Versão
```typescript
const { setMarca, setModeloBase, setVersao } = useOcarFiltros()
setMarca('GM - Chevrolet')
setModeloBase('Corsa Sedan')
setVersao('1.8 MPFI FlexPower 8V 4p')
```

### Buscar por Ano
```typescript
const { setMarca, setModeloBase, setVersao, setAno } = useOcarFiltros()
setMarca('GM - Chevrolet')
setModeloBase('Corsa Sedan')
setVersao('1.8 MPFI FlexPower 8V 4p')
setAno(2004)
```

## 🚀 Próximos Passos

### Melhorias Sugeridas
1. **Cache Avançado**: Implementar cache Redis
2. **Paginação**: Para grandes volumes de resultados
3. **Filtros Adicionais**: Preço, combustível, etc.
4. **Busca por Texto**: Campo de busca livre
5. **Favoritos**: Salvar buscas favoritas
6. **Histórico**: Histórico de buscas
7. **Exportação**: Exportar resultados para CSV/PDF

### Otimizações
1. **Índices**: Adicionar mais índices no banco
2. **Lazy Loading**: Carregar dados sob demanda
3. **Debounce**: Evitar muitas requisições
4. **Compressão**: Comprimir respostas da API
5. **CDN**: Usar CDN para assets estáticos

## 🐛 Troubleshooting

### Problemas Comuns
1. **Função não encontrada**: Verificar se executou o SQL
2. **Erro de permissão**: Verificar service role key
3. **Dados não carregam**: Verificar conexão com Supabase
4. **Parsing incorreto**: Ajustar regex na função SQL
5. **Performance lenta**: Verificar índices no banco

### Logs Úteis
```bash
# Verificar logs da API
tail -f logs/api.log

# Verificar logs do Supabase
# Dashboard > Logs > API

# Verificar logs do Next.js
npm run dev
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs de erro
2. Testar função SQL diretamente
3. Verificar configurações do Supabase
4. Consultar documentação do Next.js/SWR
