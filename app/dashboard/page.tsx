// Arquivo: app/dashboard/page.tsx
import { VehicleSearchForm } from "./vehicle-search-form" // Criaremos este a seguir

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Removido: <h1 className="text-3xl font-bold">Consulta de Veículo</h1> */}
      {/* Removido: <p className="text-muted-foreground">Digite a placa ou chassi do veículo para consultar as informações.</p> */}
      <VehicleSearchForm />
      {/* Os resultados serão exibidos por VehicleSearchForm ou um componente filho */}
    </div>
  )
}
