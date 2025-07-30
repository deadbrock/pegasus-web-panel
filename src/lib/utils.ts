import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'Pendente': 'text-yellow-600 bg-yellow-50',
    'Agendada': 'text-blue-600 bg-blue-50',
    'Em Andamento': 'text-orange-600 bg-orange-50',
    'Concluída': 'text-green-600 bg-green-50',
    'Cancelada': 'text-red-600 bg-red-50',
    'Ativo': 'text-green-600 bg-green-50',
    'Inativo': 'text-gray-600 bg-gray-50',
    'Manutenção': 'text-orange-600 bg-orange-50',
    'Entregue': 'text-green-600 bg-green-50',
    'Cancelado': 'text-red-600 bg-red-50',
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-50'
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 