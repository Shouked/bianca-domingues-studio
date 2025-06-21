'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Bell, BellOff, Settings } from 'lucide-react'

export default function NotificationSettings() {
  const { permission, requestPermission, sendNotification } = useNotifications()
  const [showSettings, setShowSettings] = useState(false)

  const handleEnableNotifications = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      sendNotification('Notificações Ativadas!', {
        body: 'Você receberá lembretes sobre seus agendamentos.',
        tag: 'notification-enabled'
      })
    }
  }

  const testNotification = () => {
    sendNotification('Notificação de Teste', {
      body: 'Esta é uma notificação de teste do seu estúdio.',
      tag: 'test-notification'
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-md"
        title="Configurações de Notificação"
      >
        {permission === 'granted' ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
      </button>

      {showSettings && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Notificações</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Status das Notificações</p>
                  <p className="text-sm text-gray-500">
                    {permission === 'granted'
                      ? 'Ativadas - Você receberá lembretes'
                      : permission === 'denied'
                      ? 'Bloqueadas - Ative nas configurações do navegador'
                      : 'Desativadas - Clique para ativar'
                    }
                  </p>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  permission === 'granted'
                    ? 'bg-green-100 text-green-800'
                    : permission === 'denied'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {permission === 'granted' ? 'Ativado' : permission === 'denied' ? 'Bloqueado' : 'Inativo'}
                </div>
              </div>

              {permission !== 'granted' && permission !== 'denied' && (
                <button
                  onClick={handleEnableNotifications}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Ativar Notificações
                </button>
              )}

              {permission === 'granted' && (
                <button
                  onClick={testNotification}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Testar Notificação
                </button>
              )}

              {permission === 'denied' && (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Para ativar as notificações:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Clique no ícone de cadeado na barra de endereços</li>
                    <li>Altere as permissões de notificação para "Permitir"</li>
                    <li>Recarregue a página</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

