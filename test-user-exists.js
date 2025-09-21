/**
 * Script para testar se o usuário existe na tabela ocar_usuarios
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUserExists() {
  try {
    const userId = '091ef3dc-923b-467a-a4f6-a9660281494a'
    
    console.log('🔍 Testando se o usuário existe na tabela ocar_usuarios...')
    console.log('🆔 User ID:', userId)
    
    // Testar consulta simples
    const { data, error } = await supabase
      .from('ocar_usuarios')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('🔍 Resultado da consulta:', { data, error })
    
    if (error) {
      console.log('❌ Erro na consulta:', error)
      console.log('❌ Código do erro:', error.code)
      console.log('❌ Mensagem do erro:', error.message)
    } else {
      if (data) {
        console.log('✅ Usuário encontrado:', data)
      } else {
        console.log('❌ Usuário não encontrado (data é null)')
      }
    }
    
    // Testar consulta sem .single()
    console.log('\n🔍 Testando consulta sem .single()...')
    const { data: data2, error: error2 } = await supabase
      .from('ocar_usuarios')
      .select('*')
      .eq('id', userId)

    console.log('🔍 Resultado da consulta 2:', { data: data2, error: error2 })
    
    if (error2) {
      console.log('❌ Erro na consulta 2:', error2)
    } else {
      console.log('✅ Dados retornados:', data2)
      console.log('📊 Quantidade de registros:', data2?.length || 0)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testUserExists()
