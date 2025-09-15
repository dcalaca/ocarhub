"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DebugInteractions() {
  const { user, userInteractions } = useAuth()

  if (!user) return null

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Debug - Interações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="text-xs font-medium">Favoritos:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {userInteractions.favoritos.length > 0 ? (
              userInteractions.favoritos.map((id) => (
                <Badge key={id} variant="secondary" className="text-xs">
                  {id.slice(-4)}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-500">Nenhum</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium">Curtidas:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {userInteractions.curtidas.length > 0 ? (
              userInteractions.curtidas.map((id) => (
                <Badge key={id} variant="outline" className="text-xs">
                  {id.slice(-4)}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-500">Nenhuma</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
