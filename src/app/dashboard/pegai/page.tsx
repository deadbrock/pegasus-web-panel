"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SimulationChat from '@/components/simulacao/SimulationChat'

export default function PegAIPage() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PegAI</CardTitle>
          <CardDescription>
            Assistente inteligente para logística. Faça perguntas e receba respostas preditivas e prescritivas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SimulationChat />
        </CardContent>
      </Card>
    </div>
  )
}



