'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { 
  Plus, 
  Receipt, 
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Search,
  Edit, // Ícone de Editar
  Trash2 // Ícone de Excluir
} from 'lucide-react'
import Layout from '@/components/Layout'
import { Expense } from '@/store/useAppStore' // Supondo que Expense seja exportado


// A interface Expense pode ser importada do store se for exportada de lá
// interface Expense {
//   id: string;
//   category: string;
//   amount: number;
//   expense_date: string;
//   notes: string | null;
//   created_at: string;
// }


interface ExpenseFormData {
  category: string
  amount: number
  expense_date: string
  notes: string | null // Permitir null para notes
}

interface ExpenseFormErrors {
  category?: string
  amount?: string
  expense_date?: string
  notes?: string
}

const EXPENSE_CATEGORIES = [
  'Luz',
  'Aluguel', 
  'Internet',
  'Gasolina',
  'Material de Trabalho',
  'Outros'
]

export default function ExpensesPage() {
  const {
    expenses,
    fetchExpenses,
    addExpense,
    updateExpense, // Adicionado
    deleteExpense, // Adicionado
    loading
  } = useAppStore()
  
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null) // Para edição
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<ExpenseFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Filter expenses based on category and month
  // Ordenar despesas pela data da despesa, mais recentes primeiro
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date)
    const expenseMonth = expenseDate.toISOString().slice(0, 7)
    
    const categoryMatch = !filterCategory || expense.category === filterCategory
    const monthMatch = !filterMonth || expenseMonth === filterMonth
    
    return categoryMatch && monthMatch
  })

  // Calculate total for filtered expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const validateForm = () => {
    const errors: ExpenseFormErrors = {}
    
    if (!formData.category) {
      errors.category = 'Categoria é obrigatória'
    }
    
    if (formData.amount <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }
    
    if (!formData.expense_date) {
      errors.expense_date = 'Data é obrigatória'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await addExpense({
        category: formData.category,
        amount: formData.amount,
        expense_date: formData.expense_date,
        notes: formData.notes.trim() || null
      })
      
      setShowForm(false)
      setFormData({
        category: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setFormErrors({})
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Luz':
      case 'Internet':
        return '⚡'
      case 'Aluguel':
        return '🏠'
      case 'Gasolina':
        return '⛽'
      case 'Material de Trabalho':
        return '💄'
      default:
        return '📝'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Luz':
        return 'bg-yellow-100 text-yellow-800'
      case 'Aluguel':
        return 'bg-blue-100 text-blue-800'
      case 'Internet':
        return 'bg-purple-100 text-purple-800'
      case 'Gasolina':
        return 'bg-red-100 text-red-800'
      case 'Material de Trabalho':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
            <p className="text-gray-600">Registre e acompanhe suas despesas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancelar' : 'Nova Despesa'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Nova Despesa</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.category
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Valor
                  </label>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.amount
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                    placeholder="0,00"
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700">
                    Data da Despesa
                  </label>
                  <input
                    type="date"
                    id="expense_date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                      formErrors.expense_date
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                    }`}
                  />
                  {formErrors.expense_date && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.expense_date}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações
                  </label>
                  <input
                    type="text"
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Observações opcionais"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Category Filter */}
              <div>
                <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Categoria
                </label>
                <select
                  id="filter-category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Todas as categorias</option>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <label htmlFor="filter-month" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Mês
                </label>
                <input
                  type="month"
                  id="filter-month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Total */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Total do período</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma despesa encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterCategory || filterMonth 
                  ? 'Tente ajustar os filtros ou adicione uma nova despesa.'
                  : 'Comece adicionando sua primeira despesa.'
                }
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <li key={expense.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {expense.category}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(expense.expense_date)}
                          </div>
                          {expense.notes && (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {expense.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(expense.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

