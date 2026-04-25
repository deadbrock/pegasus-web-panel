import { supabase } from '@/lib/supabaseClient'

export type DeletePermissionRole =
  | 'admin'
  | 'diretor'
  | 'financeiro'
  | 'gestor'
  | 'logistica'
  | 'adm_contratos'

export interface DeletePermissions {
  allowed_roles: DeletePermissionRole[]
}

interface AppSettingRow<TValue> {
  key: string
  value: TValue
  description?: string | null
  updated_by?: string | null
  updated_at?: string | null
}

export const DEFAULT_DELETE_PERMISSIONS: DeletePermissions = {
  allowed_roles: ['admin'],
}

export const DELETE_PERMISSION_ROLE_OPTIONS: {
  id: DeletePermissionRole
  label: string
  description: string
}[] = [
  { id: 'admin', label: 'Admin', description: 'Sempre possui permissão total.' },
  { id: 'diretor', label: 'Diretor', description: 'Perfil executivo com acesso amplo.' },
  { id: 'financeiro', label: 'Financeiro', description: 'Equipe financeira.' },
  { id: 'gestor', label: 'Gestor', description: 'Gestores operacionais.' },
  { id: 'logistica', label: 'Logística', description: 'Operação logística.' },
  { id: 'adm_contratos', label: 'ADM Contratos', description: 'Gestão ADM e contratos.' },
]

export function canRoleDeleteData(
  role?: string | null,
  permissions: DeletePermissions = DEFAULT_DELETE_PERMISSIONS
): boolean {
  if (!role) return false
  if (role === 'admin') return true
  return permissions.allowed_roles.includes(role as DeletePermissionRole)
}

export async function fetchDeletePermissions(): Promise<DeletePermissions> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key,value,description,updated_by,updated_at')
    .eq('key', 'delete_permissions')
    .maybeSingle()

  if (error) {
    console.warn('[configuracoesService] fetchDeletePermissions error:', error.message)
    return DEFAULT_DELETE_PERMISSIONS
  }

  const row = data as AppSettingRow<Partial<DeletePermissions>> | null
  const roles = row?.value?.allowed_roles

  if (!Array.isArray(roles) || roles.length === 0) {
    return DEFAULT_DELETE_PERMISSIONS
  }

  return {
    allowed_roles: Array.from(new Set(['admin', ...roles])) as DeletePermissionRole[],
  }
}

export async function saveDeletePermissions(
  allowedRoles: DeletePermissionRole[]
): Promise<{ ok: boolean; message?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const sanitized = Array.from(new Set(['admin', ...allowedRoles])) as DeletePermissionRole[]

  const { error } = await supabase
    .from('app_settings')
    .upsert(
      {
        key: 'delete_permissions',
        value: { allowed_roles: sanitized },
        description: 'Perfis autorizados a excluir dados no sistema.',
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )

  if (error) {
    console.error('[configuracoesService] saveDeletePermissions error:', error.message)
    return { ok: false, message: error.message }
  }

  return { ok: true }
}
