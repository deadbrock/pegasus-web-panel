'use client'

import React, { useState } from 'react'
import { Users, Database, CheckCircle, AlertCircle, Play } from 'lucide-react'

export default function SetupUsersPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const setupUsers = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await fetch('/api/setup/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erro ao criar usuários')
      }
    } catch (e: any) {
      setError(e?.message || 'Erro de rede')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center bg-blue-100 rounded-full mb-4">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Setup Inicial do Sistema</h1>
            <p className="mt-2 text-gray-600">
              Configure os usuários padrão do Sistema Pegasus
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Informações dos Usuários */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Usuários que serão criados
              </h2>
              
              <div className="space-y-4">
                {[
                  { email: 'diretor@pegasus.com', password: 'diretor123', role: 'Diretor', access: 'Acesso total ao sistema' },
                  { email: 'admin@pegasus.com', password: 'admin123', role: 'Administrador', access: 'Gestão técnica e usuários' },
                  { email: 'gestor@pegasus.com', password: 'gestor123', role: 'Gestor', access: 'Módulos logísticos' },
                  { email: 'financeiro@pegasus.com', password: 'financeiro123', role: 'Financeiro', access: 'Módulos financeiros' }
                ].map((user, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{user.role}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-sm text-gray-500 mt-1">{user.access}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Senha:</div>
                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {user.password}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ação de Setup */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Executar Setup</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Este processo criará usuários padrão no banco de dados. 
                      Execute apenas uma vez durante a configuração inicial.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={setupUsers}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando usuários...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Criar Usuários Padrão
                  </div>
                )}
              </button>

              {/* Resultado */}
              {result && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        {result.message}
                      </h3>
                      {result.users && (
                        <div className="mt-2">
                          <p className="text-sm text-green-700">Credenciais de acesso:</p>
                          <div className="mt-2 space-y-1">
                            {result.users.map((user: any, index: number) => (
                              <div key={index} className="text-xs font-mono bg-green-100 p-2 rounded">
                                {user.email} / {user.password} ({user.role})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Erro</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">Alternativa: SQL Manual</h3>
            <p className="text-sm text-gray-600 mb-3">
              Se preferir, você pode executar o script SQL diretamente no seu Supabase:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <div className="text-green-400">-- Baixe o arquivo: scripts/setup-default-users.sql</div>
              <div className="text-blue-400">-- Execute no SQL Editor do Supabase</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
