'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { format, isToday, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import Layout from '@/components/Layout'

interface DashboardStats {
  totalClients: number
  todayAppointments: number
  monthlyBalance: number
  upcomingAppointments: any[]
}

export default function Dashboard() {
  const { 
    clients, 
    appointments, 
    expenses, 
    fetchClients, 
    fetchAppointments, 
    fetchExpenses,
    loading 
  } = useAppStore()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    todayAppointments: 0,
    monthlyBalance: 0,
    upcomingAppointments: []
  })

  useEffect(() => {
    fetchClients()
    fetchAppointments()
    fetchExpenses()
  }, [fetchClients, fetchAppointments, fetchExpenses])

  useEffect(() => {
    // Calculate dashboard statistics
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Total clients
    const totalClients = clients.length

    // Today's appointments
    const todayAppointments = appointments.filter(appointment => 
      isToday(new Date(appointment.appointment_date))
    ).length

    // Monthly balance
    const monthlyRevenue = appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        return appointmentDate >= monthStart && 
               appointmentDate <= monthEnd && 
               appointment.status === 'concluído'
      })
      .reduce((sum, appointment) => sum + appointment.total_value, 0)

    const monthlyExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.expense_date)
        return expenseDate >= monthStart && expenseDate <= monthEnd
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const monthlyBalance = monthlyRevenue - monthlyExpenses

    // Upcoming appointments (next 5)
    const upcomingAppointments = appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        return appointmentDate > now && appointment.status === 'agendado'
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 5)

    setStats({
      totalClients,
      todayAppointments,
      monthlyBalance,
      upcomingAppointments
    })
  }, [clients, appointments, expenses])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu estúdio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Clients */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Clientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalClients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Agendamentos Hoje
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Balance */}
          <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 sm:col-span-2">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {stats.monthlyBalance >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Balanço do Mês
                    </dt>
                    <dd className={`text-lg font-medium ${
                      stats.monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.monthlyBalance >= 0 ? 'Lucro de ' : 'Prejuízo de '}
                      {formatCurrency(Math.abs(stats.monthlyBalance))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Próximos Agendamentos
            </h3>
            {stats.upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum agendamento próximo
              </p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.client?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(appointment.total_value)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.procedures?.map((p: any) => p.name).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

