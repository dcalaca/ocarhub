const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://kfsteismyqpekbaqwuez.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTg0MywiZXhwIjoyMDY1MDYxODQzfQ.4pcJS-lSfxwkfp4VoYMFqsgrpSf8qV-LYcVsjdY1nkw'
)

async function deleteVehicles() {
  // IDs dos veículos para excluir
  const vehicleIds = [
    'c850281c-de47-41ea-a9d4-551bc9e4be61', // Honda 2025
    '54a34e47-65e8-4337-a3aa-72a7364a06a3', // Honda 2001
    '2b1581f8-3a28-443e-a3b5-6ba8b04c8e2b', // Honda 2001
    'bccb4ca6-0804-4184-a9b8-f1c033c06220', // Chevrolet Cruze
    '04f4f16f-3840-494d-bcb7-d4827474ed07', // Ford Focus
    '339abd95-ea74-4326-9b17-711c14220878', // Volkswagen Golf
    '0144ea53-bd9d-4908-a325-13deeec718d2', // Toyota Corolla
    '29f80e73-e00c-4540-9b08-84202a99132b'  // Honda Civic
  ]

  console.log('🗑️ Excluindo todos os veículos...')
  
  for (const id of vehicleIds) {
    try {
      const { error } = await supabase
        .from('ocar_vehicles')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.log(`❌ Erro ao excluir ${id}:`, error.message)
      } else {
        console.log(`✅ Veículo ${id} excluído com sucesso`)
      }
    } catch (err) {
      console.log(`❌ Erro ao excluir ${id}:`, err.message)
    }
  }
  
  console.log('\n🎉 Processo de exclusão concluído!')
}

deleteVehicles()
