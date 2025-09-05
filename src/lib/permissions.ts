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
    id: 'planejamento-financeiro',
    name: 'Planejamento Financeiro',
    icon: 'TrendingUp',
    path: '/dashboard/planejamento-financeiro',
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
    id: 'veiculos',
    name: 'Veículos',
    icon: 'Truck',
    path: '/dashboard/veiculos',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'motoristas',
    name: 'Motoristas',
    icon: 'User',
    path: '/dashboard/motoristas',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'manutencao',
    name: 'Manutenção',
    icon: 'Wrench',
    path: '/dashboard/manutencao',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'rastreamento',
    name: 'Rastreamento',
    icon: 'MapPin',
    path: '/dashboard/rastreamento',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'contratos',
    name: 'Contratos',
    icon: 'FileCheck',
    path: '/dashboard/contratos',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'custos',
    name: 'Custos',
    icon: 'Calculator',
    path: '/dashboard/custos',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'centro-custos',
    name: 'Centro de Custos',
    icon: 'Target',
    path: '/dashboard/centro-custos',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'BarChart2',
    path: '/dashboard/analytics',
    allowedRoles: ['admin', 'diretor']
  },
  {
    id: 'data-hub',
    name: 'Data Hub',
    icon: 'Database',
    path: '/dashboard/data-hub',
    allowedRoles: ['admin', 'diretor']
  },
  {
    id: 'forecast',
    name: 'Forecast',
    icon: 'TrendingUp',
    path: '/dashboard/forecast',
    allowedRoles: ['admin', 'diretor', 'financeiro']
  },
  {
    id: 'insights',
    name: 'Insights',
    icon: 'Lightbulb',
    path: '/dashboard/insights',
    allowedRoles: ['admin', 'diretor']
  },
  {
    id: 'radar',
    name: 'Radar Logístico',
    icon: 'Radar',
    path: '/dashboard/radar',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'pegai',
    name: 'PegAI',
    icon: 'Bot',
    path: '/dashboard/pegai',
    allowedRoles: ['admin', 'diretor', 'gestor']
  },
  {
    id: 'gamificacao',
    name: 'Gamificação',
    icon: 'Trophy',
    path: '/dashboard/gamificacao',
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
    id: 'workflows',
    name: 'Workflows',
    icon: 'GitBranch',
    path: '/dashboard/configuracoes/workflows',
    allowedRoles: ['admin', 'diretor']
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
