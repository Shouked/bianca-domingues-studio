'use client'

import { useEffect, useState } from 'react'

interface NotificationHook {
  permission: NotificationPermission | null
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => void
  scheduleAppointmentReminder: (appointmentDate: Date, clientName: string) => void
}

export const useNotifications = (): NotificationHook => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }

    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return 'denied'
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      })
    }
  }

  const scheduleAppointmentReminder = (appointmentDate: Date, clientName: string) => {
    const now = new Date()
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
    
    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime()
      
      setTimeout(() => {
        sendNotification('Lembrete de Agendamento', {
          body: `Você tem um agendamento com ${clientName} amanhã às ${appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          tag: 'appointment-reminder',
          requireInteraction: true
        })
      }, timeUntilReminder)
    }
  }

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleAppointmentReminder
  }
}

