// Sistema de permissões por perfil de usuário

export interface ModulePermission {
  id: string;
  name: string;
  icon: string;
  path: string;
  allowedRoles: string[];
}

// Definição de todos os módulos do sistema
export const ALL_MODULES: ModulePermission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'gestor']
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    icon: 'DollarSign',
    path: '/dashboard/financeiro',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'fiscal',
    name: 'Fiscal',
    icon: 'FileText',
    path: '/dashboard/fiscal',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'auditoria',
    name: 'Auditoria',
    icon: 'Search',
    path: '/dashboard/auditoria',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'planejamento',
    name: 'Planejamento',
    icon: 'Calendar',
    path: '/dashboard/planejamento',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'relatorios',
    name: 'Relatórios',
    icon: 'BarChart3',
    path: '/dashboard/relatorios',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'gestor']
  },
  {
    id: 'documentos',
    name: 'Documentos',
    icon: 'FolderOpen',
    path: '/dashboard/documentos',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'pedidos',
    name: 'Pedidos',
    icon: 'Package',
    path: '/dashboard/pedidos',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'estoque',
    name: 'Estoque',
    icon: 'Warehouse',
    path: '/dashboard/estoque',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'usuarios',
    name: 'Usuários',
    icon: 'Users',
    path: '/dashboard/configuracoes/usuarios',
    allowedRoles: ['admin', 'diretor']
  },
  {
    id: 'centro-custos',
    name: 'Centro de Custos',
    icon: 'Target',
    path: '/dashboard/centro-custos',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'configuracoes',
    name: 'Configurações',
    icon: 'Settings',
    path: '/dashboard/configuracoes',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'gestor']
  }
];

// Função para verificar se um usuário tem acesso a um módulo
export function hasModuleAccess(userRole: string, moduleId: string): boolean {
  const module = ALL_MODULES.find(m => m.id === moduleId);
  if (!module) return false;
  
  return module.allowedRoles.includes(userRole);
}

// Função para obter todos os módulos permitidos para um perfil
export function getModulesForRole(userRole: string): ModulePermission[] {
  return ALL_MODULES.filter(module => module.allowedRoles.includes(userRole));
}

// Função para verificar se um usuário pode acessar uma rota
export function canAccessRoute(userRole: string, path: string): boolean {
  const module = ALL_MODULES.find(m => path.startsWith(m.path));
  if (!module) return false;
  
  return module.allowedRoles.includes(userRole);
}

// Definições de perfis
export const USER_ROLES = {
  ADMIN: 'admin',
  DIRETOR: 'diretor', 
  FINANCEIRO: 'financeiro',
  GESTOR: 'gestor'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
