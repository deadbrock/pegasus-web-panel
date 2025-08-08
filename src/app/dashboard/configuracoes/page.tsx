"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ConfiguracoesPage() {
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(true)
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState<boolean>(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-gray-500">
          Ajuste preferências do sistema, notificações e integrações.
        </p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="empresa">Nome da Empresa</Label>
                <Input id="empresa" placeholder="Ex.: Pegasus Logística" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso horário</Label>
                <Input id="timezone" placeholder="America/Sao_Paulo" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={() => console.log("Salvar geral")}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas por e-mail</Label>
                  <p className="text-sm text-gray-500">Receber notificações importantes por e-mail.</p>
                </div>
                <Switch
                  checked={emailAlertsEnabled}
                  onCheckedChange={setEmailAlertsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas push</Label>
                  <p className="text-sm text-gray-500">Receber notificações em tempo real.</p>
                </div>
                <Switch
                  checked={pushAlertsEnabled}
                  onCheckedChange={setPushAlertsEnabled}
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => console.log("Salvar notificações")}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">URL (public)</Label>
                <Input id="supabase-url" placeholder="NEXT_PUBLIC_SUPABASE_URL" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase-anon">Anon Key</Label>
                <Input id="supabase-anon" placeholder="NEXT_PUBLIC_SUPABASE_ANON_KEY" readOnly />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={() => console.log("Salvar integrações")}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


