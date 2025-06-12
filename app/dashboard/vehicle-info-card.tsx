// Arquivo: app/dashboard/vehicle-info-card.tsx
import type React from "react"
import { CheckCircle2, XCircle } from "lucide-react"

type VehicleInfoItemProps = {
  label: string
  value: string | number | boolean | string[] | undefined
  icon?: React.ReactNode
  isAlert?: boolean
  isGood?: boolean
}

const VehicleInfoItem: React.FC<VehicleInfoItemProps> = ({ label, value, icon, isAlert, isGood }) => {
  let displayValue: React.ReactNode = String(value)
  if (typeof value === "boolean") {
    displayValue = value ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  } else if (Array.isArray(value)) {
    displayValue = (
      <ul className="list-disc list-inside">
        {value.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )
  } else if (value === undefined || value === null || String(value).trim() === "") {
    displayValue = <span className="text-muted-foreground">Não informado</span>
  }

  return (
    <div
      className={`p-4 rounded-lg border ${
        isAlert
          ? "bg-red-500/10 border-red-500/20"
          : isGood
            ? "bg-green-500/10 border-green-500/20"
            : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div
        className={`text-base font-semibold ${
          isAlert ? "text-red-400" : isGood ? "text-green-400" : "text-foreground"
        }`}
      >
        {displayValue}
      </div>
    </div>
  )
}

export default VehicleInfoItem
