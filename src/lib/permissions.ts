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
    allowedRoles: ['admin', 'diretor', 'financeiro', 'gestor', 'logistica']
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
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
  },
  {
    id: 'auditoria',
    name: 'Auditoria',
    icon: 'Search',
    path: '/dashboard/auditoria',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
  },
  {
    id: 'planejamento',
    name: 'Planejamento',
    icon: 'Calendar',
    path: '/dashboard/planejamento',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
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
    allowedRoles: ['admin', 'diretor', 'financeiro', 'gestor', 'logistica']
  },
  {
    id: 'documentos',
    name: 'Documentos',
    icon: 'FolderOpen',
    path: '/dashboard/documentos',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
  },
  {
    id: 'pedidos',
    name: 'Pedidos',
    icon: 'Package',
    path: '/dashboard/pedidos',
    allowedRoles: ['admin', 'diretor', 'gestor', 'logistica']
  },
  {
    id: 'estoque',
    name: 'Estoque',
    icon: 'Warehouse',
    path: '/dashboard/estoque',
    allowedRoles: ['admin', 'diretor', 'gestor', 'logistica']
  },
  {
    id: 'veiculos',
    name: 'Veículos',
    icon: 'Truck',
    path: '/dashboard/veiculos',
    allowedRoles: ['admin', 'diretor', 'gestor', 'logistica']
  },
  {
    id: 'motoristas',
    name: 'Motoristas',
    icon: 'User',
    path: '/dashboard/motoristas',
    allowedRoles: ['admin', 'diretor', 'gestor', 'logistica']
  },
  {
    id: 'manutencao',
    name: 'Manutenção',
    icon: 'Wrench',
    path: '/dashboard/manutencao',
    allowedRoles: ['admin', 'diretor', 'gestor', 'logistica']
  },
  {
    id: 'rastreamento',
    name: 'Rastreamento',
    icon: 'MapPin',
    path: '/dashboard/rastreamento',
    allowedRoles: ['admin', 'diretor', 'gestor', 'logistica']
  },
  {
    id: 'contratos',
    name: 'Contratos',
    icon: 'FileCheck',
    path: '/dashboard/contratos',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
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
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'BarChart2',
    path: '/dashboard/analytics',
    allowedRoles: ['admin', 'diretor', 'logistica']
  },
  {
    id: 'data-hub',
    name: 'Data Hub',
    icon: 'Database',
    path: '/dashboard/data-hub',
    allowedRoles: ['admin', 'diretor', 'logistica']
  },
  {
    id: 'forecast',
    name: 'Forecast',
    icon: 'TrendingUp',
    path: '/dashboard/forecast',
    allowedRoles: ['admin', 'diretor', 'financeiro', 'logistica']
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
    allowedRoles: ['admin', 'diretor', 'financeiro', 'gestor', 'logistica', 'adm_contratos']
  },
  {
    id: 'supervisores',
    name: 'Supervisores',
    icon: 'Users',
    path: '/dashboard/supervisores',
    allowedRoles: ['admin', 'diretor', 'logistica']
  },
  {
    id: 'configuracoes-periodo',
    name: 'Período de Pedidos',
    icon: 'Calendar',
    path: '/dashboard/configuracoes-periodo',
    allowedRoles: ['admin', 'diretor', 'logistica']
  },
  // ── Gestão ADM ──────────────────────────────────────────────────────────
  {
    id: 'gestao-adm',
    name: 'Gestão ADM',
    icon: 'Briefcase',
    path: '/gestao-adm',
    // logistica: acesso somente-leitura (apenas custo materiais)
    allowedRoles: ['admin', 'diretor', 'adm_contratos', 'logistica']
  },
  {
    id: 'gestao-adm-contratos',
    name: 'Contratos ADM',
    icon: 'FileCheck2',
    path: '/gestao-adm/contratos',
    // logistica: acesso somente-leitura (apenas custo materiais)
    allowedRoles: ['admin', 'diretor', 'adm_contratos', 'logistica']
  },
  {
    id: 'gestao-adm-analytics',
    name: 'Analytics ADM',
    icon: 'BarChart3',
    path: '/gestao-adm/analytics',
    allowedRoles: ['admin', 'diretor', 'adm_contratos']
  },
];

export function hasModuleAccess(userRole: string, moduleId: string): boolean {
  const module = ALL_MODULES.find(m => m.id === moduleId);
  if (!module) return false;
  return module.allowedRoles.includes(userRole);
}

export function getModulesForRole(userRole: string): ModulePermission[] {
  return ALL_MODULES.filter(module => module.allowedRoles.includes(userRole));
}

export function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case 'adm_contratos':
      return '/gestao-adm/contratos';
    case 'encarregado':
    case 'supervisor':
      return '/operacional';
    default:
      return '/dashboard';
  }
}

export function canAccessRoute(userRole: string, path: string): boolean {
  if (path === '/login' || path === '/' || path.startsWith('/_next')) {
    return true;
  }

  // Portal operacional: qualquer autenticado pode acessar
  if (path.startsWith('/operacional')) {
    return true;
  }

  const sortedModules = [...ALL_MODULES].sort((a, b) => b.path.length - a.path.length);
  const module = sortedModules.find(m => path === m.path || path.startsWith(m.path + '/'));

  if (module) {
    return module.allowedRoles.includes(userRole);
  }

  if (path.startsWith('/dashboard')) {
    const dashboardModule = ALL_MODULES.find(m => m.id === 'dashboard');
    return dashboardModule ? dashboardModule.allowedRoles.includes(userRole) : false;
  }

  return false;
}

// Definições de perfis
export const USER_ROLES = {
  ADMIN: 'admin',
  DIRETOR: 'diretor',
  FINANCEIRO: 'financeiro',
  GESTOR: 'gestor',
  LOGISTICA: 'logistica',
  ADM_CONTRATOS: 'adm_contratos',
  SUPERVISOR: 'supervisor',
  ENCARREGADO: 'encarregado',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
