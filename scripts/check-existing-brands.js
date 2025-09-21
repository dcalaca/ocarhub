import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkExistingBrands() {
  console.log('🏷️ Verificando marcas existentes no sistema...\n')

  try {
    // 1. Contar marcas existentes
    const { count: brandsCount, error: brandsCountError } = await supabase
      .from('ocar_fipe_brands')
      .select('*', { count: 'exact', head: true })
    
    if (brandsCountError) throw brandsCountError
    console.log(`📊 Total de marcas no sistema: ${brandsCount}\n`)

    // 2. Listar todas as marcas
    const { data: brands, error: brandsError } = await supabase
      .from('ocar_fipe_brands')
      .select('name, code')
      .order('name')
    
    if (brandsError) throw brandsError

    console.log('🏷️ MARCAS EXISTENTES NO SISTEMA:')
    console.log('=' .repeat(60))
    brands.forEach((brand, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${brand.name.padEnd(25, ' ')} (code: ${brand.code})`)
    })
    console.log('=' .repeat(60))

    // 3. Verificar marcas únicas na ocar_transbordo
    const { data: transbordoBrands, error: transbordoError } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .not('marca', 'is', null)
      .not('marca', 'eq', '')
    
    if (transbordoError) throw transbordoError

    // Contar marcas únicas no transbordo
    const uniqueBrands = [...new Set(transbordoBrands.map(t => t.marca))].sort()
    
    console.log(`\n📋 MARCAS ÚNICAS NA OCAR_TRANSBORDO: ${uniqueBrands.length}`)
    console.log('=' .repeat(60))
    uniqueBrands.forEach((brand, index) => {
      const code = brand.toLowerCase().replace(/ /g, '-').substring(0, 10)
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${brand.padEnd(25, ' ')} (code: ${code})`)
    })
    console.log('=' .repeat(60))

    // 4. Verificar conflitos potenciais
    console.log('\n⚠️ POSSÍVEIS CONFLITOS:')
    const existingCodes = brands.map(b => b.code)
    const potentialConflicts = uniqueBrands.filter(brand => {
      const code = brand.toLowerCase().replace(/ /g, '-').substring(0, 10)
      return existingCodes.includes(code)
    })

    if (potentialConflicts.length > 0) {
      console.log('Marcas que podem causar conflito:')
      potentialConflicts.forEach(conflict => {
        const code = conflict.toLowerCase().replace(/ /g, '-').substring(0, 10)
        console.log(`   • ${conflict} → ${code}`)
      })
    } else {
      console.log('   Nenhum conflito detectado!')
    }

  } catch (error) {
    console.error('Erro ao verificar marcas:', error.message)
  }
}

checkExistingBrands()
