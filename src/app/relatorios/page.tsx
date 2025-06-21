'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Users,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import Layout from '@/components/Layout'

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface ExpenseByCategory {
  category: string
  amount: number
  percentage: number
}

interface TopClient {
  name: string
  total: number
  appointments: number
}

const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function ReportsPage() {
  const { clients, appointments, expenses, fetchClients, fetchAppointments, fetchExpenses, loading } = useAppStore()
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    fetchClients()
    fetchAppointments()
    fetchExpenses()
  }, [fetchClients, fetchAppointments, fetchExpenses])

  // Calculate monthly data for the last 6 months
  const monthlyData = useMemo(() => {
    const data: MonthlyData[] = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      // Calculate revenue for this month
      const monthRevenue = appointments
        .filter(appointment => {
          const appointmentDate = new Date(appointment.appointment_date)
          const appointmentMonth = appointmentDate.toISOString().slice(0, 7)
          return appointmentMonth === monthKey && appointment.status === 'concluído'
        })
        .reduce((sum, appointment) => sum + appointment.total_value, 0)
      
      // Calculate expenses for this month
      const monthExpenses = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.expense_date)
          const expenseMonth = expenseDate.toISOString().slice(0, 7)
          return expenseMonth === monthKey
        })
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      data.push({
        month: monthName,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      })
    }
    
    return data
  }, [appointments, expenses])

  // Calculate expenses by category for selected month
  const expensesByCategory = useMemo(() => {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      const expenseMonth = expenseDate.toISOString().slice(0, 7)
      return expenseMonth === selectedMonth
    })
    
    const categoryTotals: { [key: string]: number } = {}
    let totalExpenses = 0
    
    filteredExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
      totalExpenses += expense.amount
    })
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses, selectedMonth])

  // Calculate top 5 clients for selected month
  const topClients = useMemo(() => {
    const clientTotals: { [key: string]: { total: number, appointments: number, name: string } } = {}
    
    appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        const appointmentMonth = appointmentDate.toISOString().slice(0, 7)
        return appointmentMonth === selectedMonth && appointment.status === 'concluído'
      })
      .forEach(appointment => {
        const clientId = appointment.client_id
        const clientName = appointment.client?.full_name || 'Cliente não encontrado'
        
        if (!clientTotals[clientId]) {
          clientTotals[clientId] = { total: 0, appointments: 0, name: clientName }
        }
        
        clientTotals[clientId].total += appointment.total_value
        clientTotals[clientId].appointments += 1
      })
    
    return Object.values(clientTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [appointments, selectedMonth])

  // Calculate metrics for selected month
  const monthlyMetrics = useMemo(() => {
    const monthRevenue = appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        const appointmentMonth = appointmentDate.toISOString().slice(0, 7)
        return appointmentMonth === selectedMonth && appointment.status === 'concluído'
      })
      .reduce((sum, appointment) => sum + appointment.total_value, 0)
    
    const monthExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.expense_date)
        const expenseMonth = expenseDate.toISOString().slice(0, 7)
        return expenseMonth === selectedMonth
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
    
    return {
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses
    }
  }, [appointments, expenses, selectedMonth])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
            <p className="text-gray-600">Análise do desempenho do seu negócio</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Mês
            </label>
            <input
              type="month"
              id="month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Receita Total
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      {formatCurrency(monthlyMetrics.revenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Despesa Total
                    </dt>
                    <dd className="text-lg font-medium text-red-600">
                      {formatCurrency(monthlyMetrics.expenses)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {monthlyMetrics.profit >= 0 ? (
                    <DollarSign className="h-6 w-6 text-green-400" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {monthlyMetrics.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                    </dt>
                    <dd className={`text-lg font-medium ${
                      monthlyMetrics.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(monthlyMetrics.profit))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Profit Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Lucro x Prejuízo Mensal</h3>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'revenue' ? 'Receita' : name === 'expenses' ? 'Despesas' : 'Lucro'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" name="Receita" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                  <Bar dataKey="profit" fill="#ec4899" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses by Category Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Despesas por Categoria</h3>
            </div>
            {expensesByCategory.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${formatPercentage(percentage)})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">Nenhuma despesa no período selecionado</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Top 5 Clientes do Mês</h3>
          </div>
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-pink-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.appointments} agendamento(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(client.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">Nenhum cliente com agendamentos concluídos no período</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

