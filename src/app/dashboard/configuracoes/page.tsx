"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import {
  canRoleDeleteData,
  DELETE_PERMISSION_ROLE_OPTIONS,
  DEFAULT_DELETE_PERMISSIONS,
  type DeletePermissionRole,
  fetchDeletePermissions,
  saveDeletePermissions,
} from "@/services/configuracoesService"

interface LocalPreferences {
  empresa: string
  timezone: string
  compactMode: boolean
  emailAlertsEnabled: boolean
  pushAlertsEnabled: boolean
}

const LOCAL_STORAGE_KEY = "pegasus:configuracoes:preferencias"

const DEFAULT_PREFERENCES: LocalPreferences = {
  empresa: "Pegasus Logística",
  timezone: "America/Sao_Paulo",
  compactMode: false,
  emailAlertsEnabled: true,
  pushAlertsEnabled: true,
}

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [preferences, setPreferences] = useState<LocalPreferences>(DEFAULT_PREFERENCES)
  const [allowedDeleteRoles, setAllowedDeleteRoles] = useState<DeletePermissionRole[]>(
    DEFAULT_DELETE_PERMISSIONS.allowed_roles
  )
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const currentUserCanDelete = useMemo(
    () => canRoleDeleteData(user?.role, { allowed_roles: allowedDeleteRoles }),
    [allowedDeleteRoles, user?.role]
  )

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!stored) return

    try {
      setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) })
    } catch {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadPermissions() {
      setLoadingPermissions(true)
      const permissions = await fetchDeletePermissions()
      if (!mounted) return
      setAllowedDeleteRoles(permissions.allowed_roles)
      setLoadingPermissions(false)
    }

    loadPermissions()
    return () => {
      mounted = false
    }
  }, [])

  function updatePreference<TKey extends keyof LocalPreferences>(
    key: TKey,
    value: LocalPreferences[TKey]
  ) {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  function savePreferences() {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences))
    setErrorMessage(null)
    setStatusMessage("Preferências salvas neste navegador.")
  }

  function toggleDeleteRole(role: DeletePermissionRole, enabled: boolean) {
    if (role === "admin") return

    setAllowedDeleteRoles((prev) => {
      const next = enabled
        ? [...prev, role]
        : prev.filter((item) => item !== role)

      return Array.from(new Set(["admin", ...next])) as DeletePermissionRole[]
    })
  }

  async function handleSaveDeletePermissions() {
    if (!isAdmin) return

    setSavingPermissions(true)
    setStatusMessage(null)
    setErrorMessage(null)

    const result = await saveDeletePermissions(allowedDeleteRoles)
    setSavingPermissions(false)

    if (result.ok) {
      setStatusMessage("Permissões de exclusão atualizadas com sucesso.")
    } else {
      setErrorMessage(result.message ?? "Não foi possível salvar as permissões.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-3">
            <Settings className="w-3.5 h-3.5" />
            Módulo do sistema
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ajuste preferências, notificações e permissões sensíveis do Pegasus.
          </p>
        </div>

        <Card className="lg:w-[320px] border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Seu perfil</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.role ?? "sem perfil"}</p>
              <p className="text-xs text-slate-500">
                Exclusão: {currentUserCanDelete ? "permitida" : "bloqueada"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={[
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
            errorMessage
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700",
          ].join(" ")}
        >
          {errorMessage ? (
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{errorMessage ?? statusMessage}</span>
        </div>
      )}

      <Tabs defaultValue="geral" className="w-full">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                Preferências do usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="empresa">Nome da Empresa</Label>
                <Input
                  id="empresa"
                  value={preferences.empresa}
                  onChange={(event) => updatePreference("empresa", event.target.value)}
                  placeholder="Ex.: Pegasus Logística"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso horário</Label>
                <Input
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(event) => updatePreference("timezone", event.target.value)}
                  placeholder="America/Sao_Paulo"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="space-y-1">
                  <Label>Modo compacto</Label>
                  <p className="text-sm text-slate-500">Preferência local para telas com maior densidade de informação.</p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(value) => updatePreference("compactMode", value)}
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={savePreferences}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar preferências
                </Button>
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
                  <p className="text-sm text-slate-500">Receber notificações importantes por e-mail.</p>
                </div>
                <Switch
                  checked={preferences.emailAlertsEnabled}
                  onCheckedChange={(value) => updatePreference("emailAlertsEnabled", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas push</Label>
                  <p className="text-sm text-slate-500">Receber notificações em tempo real.</p>
                </div>
                <Switch
                  checked={preferences.pushAlertsEnabled}
                  onCheckedChange={(value) => updatePreference("pushAlertsEnabled", value)}
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={savePreferences}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar notificações
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Workflows Automatizados</div>
                    <p className="text-sm text-slate-500">Crie regras personalizadas e receba alertas direcionados.</p>
                  </div>
                  <Link href="/dashboard/configuracoes/workflows" className="text-blue-600 hover:underline">
                    Abrir criador
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Permissão de exclusão de dados
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Controle quais perfis podem excluir registros. O perfil admin sempre permanece habilitado.
                  </p>
                </div>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "Somente leitura"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {!isAdmin && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Alteração restrita ao admin</p>
                    <p className="text-sm text-amber-700">
                      Você pode visualizar a configuração atual, mas apenas o perfil admin pode liberar exclusão para outros usuários.
                    </p>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {DELETE_PERMISSION_ROLE_OPTIONS.map((role) => {
                  const checked = allowedDeleteRoles.includes(role.id)
                  const disabled = loadingPermissions || !isAdmin || role.id === "admin"

                  return (
                    <div key={role.id} className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{role.label}</p>
                          {role.id === "admin" && (
                            <Badge variant="secondary" className="text-[10px]">Obrigatório</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{role.description}</p>
                      </div>
                      <Switch
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(value) => toggleDeleteRole(role.id, value)}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Para enforcement no banco, execute o SQL `scripts/sql/configuracoes_sistema.sql` no Supabase.
                </p>
                <Button
                  type="button"
                  onClick={handleSaveDeletePermissions}
                  disabled={!isAdmin || savingPermissions || loadingPermissions}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingPermissions ? "Salvando..." : "Salvar permissões"}
                </Button>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
