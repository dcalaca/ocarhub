// Script para testar a função ocarhub_filtros
// Execute: node scripts/test-ocar-filtros.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testOcarFiltros() {
  try {
    console.log('🧪 Testando função ocarhub_filtros...\n')

    // Teste 1: Buscar todas as marcas
    console.log('1️⃣ Testando busca de marcas...')
    const { data: marcas, error: marcasError } = await supabase
      .rpc('ocarhub_filtros', {
        p_marca: null,
        p_modelo_base: null,
        p_versao: null,
        p_ano: null
      })

    if (marcasError) {
      console.log('❌ Erro ao buscar marcas:', marcasError.message)
      return
    }

    console.log(`✅ Encontradas ${marcas.marcas?.length || 0} marcas`)
    console.log('📋 Primeiras 10 marcas:', marcas.marcas?.slice(0, 10))

    // Teste 2: Buscar modelos de uma marca específica
    if (marcas.marcas && marcas.marcas.length > 0) {
      const marcaTeste = marcas.marcas[0]
      console.log(`\n2️⃣ Testando busca de modelos para marca: ${marcaTeste}`)
      
      const { data: modelos, error: modelosError } = await supabase
        .rpc('ocarhub_filtros', {
          p_marca: marcaTeste,
          p_modelo_base: null,
          p_versao: null,
          p_ano: null
        })

      if (modelosError) {
        console.log('❌ Erro ao buscar modelos:', modelosError.message)
      } else {
        console.log(`✅ Encontrados ${modelos.modelos?.length || 0} modelos`)
        console.log('📋 Primeiros 10 modelos:', modelos.modelos?.slice(0, 10))

        // Teste 3: Buscar versões de um modelo específico
        if (modelos.modelos && modelos.modelos.length > 0) {
          const modeloTeste = modelos.modelos[0]
          console.log(`\n3️⃣ Testando busca de versões para modelo: ${modeloTeste}`)
          
          const { data: versoes, error: versoesError } = await supabase
            .rpc('ocarhub_filtros', {
              p_marca: marcaTeste,
              p_modelo_base: modeloTeste,
              p_versao: null,
              p_ano: null
            })

          if (versoesError) {
            console.log('❌ Erro ao buscar versões:', versoesError.message)
          } else {
            console.log(`✅ Encontradas ${versoes.versoes?.length || 0} versões`)
            console.log('📋 Primeiras 10 versões:', versoes.versoes?.slice(0, 10))

            // Teste 4: Buscar anos de uma versão específica
            if (versoes.versoes && versoes.versoes.length > 0) {
              const versaoTeste = versoes.versoes[0]
              console.log(`\n4️⃣ Testando busca de anos para versão: ${versaoTeste}`)
              
              const { data: anos, error: anosError } = await supabase
                .rpc('ocarhub_filtros', {
                  p_marca: marcaTeste,
                  p_modelo_base: modeloTeste,
                  p_versao: versaoTeste,
                  p_ano: null
                })

              if (anosError) {
                console.log('❌ Erro ao buscar anos:', anosError.message)
              } else {
                console.log(`✅ Encontrados ${anos.anos?.length || 0} anos`)
                console.log('📋 Anos disponíveis:', anos.anos?.slice(0, 10))

                // Teste 5: Buscar resultados finais
                if (anos.anos && anos.anos.length > 0) {
                  const anoTeste = anos.anos[0]
                  console.log(`\n5️⃣ Testando busca de resultados para ano: ${anoTeste}`)
                  
                  const { data: resultados, error: resultadosError } = await supabase
                    .rpc('ocarhub_filtros', {
                      p_marca: marcaTeste,
                      p_modelo_base: modeloTeste,
                      p_versao: versaoTeste,
                      p_ano: anoTeste
                    })

                  if (resultadosError) {
                    console.log('❌ Erro ao buscar resultados:', resultadosError.message)
                  } else {
                    console.log(`✅ Encontrados ${resultados.resultados?.length || 0} resultados`)
                    console.log('📋 Primeiros 5 resultados:')
                    resultados.resultados?.slice(0, 5).forEach((resultado, index) => {
                      console.log(`   ${index + 1}. ${resultado.marca} ${resultado.modelo_base} ${resultado.versao} ${resultado.ano} - R$ ${resultado.preco}`)
                    })
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log('\n🎉 Testes concluídos!')

  } catch (error) {
    console.log('❌ Erro fatal:', error.message)
  }
}

testOcarFiltros()
