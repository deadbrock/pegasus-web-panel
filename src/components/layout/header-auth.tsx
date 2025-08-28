"use client"
import React from 'react'
import { useAuth } from '../../lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export function HeaderAuth() {
	const { user, logout } = useAuth()
	const router = useRouter()

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	if (!user) {
		return null // Não mostra nada se não estiver logado
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<User className="w-5 h-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64">
				<div className="space-y-3">
					<div className="border-b pb-3">
						<div className="font-medium text-sm">{user.name || user.email}</div>
						<div className="text-xs text-gray-500 capitalize">{user.role}</div>
					</div>
					<div className="space-y-1">
						<button
							onClick={handleLogout}
							className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
						>
							<LogOut className="w-4 h-4 mr-2" />
							Sair do Sistema
						</button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}


