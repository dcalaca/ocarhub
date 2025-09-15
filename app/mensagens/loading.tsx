import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function MensagensLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="rounded-lg shadow-sm border h-[calc(100vh-140px)] flex bg-card">
          {/* Lista de Conversas - Skeleton */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex-1 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área do Chat - Skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
