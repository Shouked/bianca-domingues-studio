'use client'

import { useEffect, useState } from 'react'
import { useAppStore, Expense } from '@/store/useAppStore'
import {
  Plus,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  DollarSign,
  X
} from 'lucide-react'
import Layout from '@/components/Layout'

interface ExpenseFormData {
  category: string
  amount: number
  expense_date: string
  notes: string | null
}

interface ExpenseFormErrors {
  category?: string
  amount?: string
  expense_date?: string
}

const EXPENSE_CATEGORIES = [
  'Materiais',
  'Produtos',
  'Aluguel',
  'Salário',
  'Marketing',
  'Impostos',
  'Outros'
]

export default function ExpensesPage() {
  const {
    expenses,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense
  } = useAppStore()

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    amount: 0,
    expense_date: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<ExpenseFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const validateForm = () => {
    const errors: ExpenseFormErrors = {}

    if (!formData.category) {
      errors.category = 'Categoria obrigatória'
    }
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }
    if (!formData.expense_date) {
      errors.expense_date = 'Data obrigatória'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          category: formData.category,
          amount: formData.amount,
          expense_date: formData.expense_date,
          notes: formData.notes ? formData.notes.trim() : null
        })
      } else {
        await addExpense({
          category: formData.category,
          amount: formData.amount,
          expense_date: formData.expense_date,
          notes: formData.notes ? formData.notes.trim() : null
        })
      }
      setShowForm(false)
      setEditingExpense(null)
      resetForm()
    } catch (error: any) {
      alert(`Erro ao salvar despesa: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date.slice(0, 10),
      notes: expense.notes
    })
    setShowForm(true)
  }

  const handleDelete = async (expense: Expense) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
    try {
      await deleteExpense(expense.id)
    } catch (error: any) {
      alert(`Erro ao excluir despesa: ${error.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      category: '',
      amount: 0,
      expense_date: '',
      notes: ''
    })
    setFormErrors({})
    setEditingExpense(null)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
            <p className="text-gray-600">Controle suas despesas do estúdio</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-pink-600 rounded-md text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                    formErrors.category
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  {EXPENSE_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0
                    })
                  }
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                    formErrors.amount
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                  placeholder="0,00"
                />
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      expense_date: e.target.value
                    })
                  }
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                    formErrors.expense_date
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                />
                {formErrors.expense_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.expense_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      notes: e.target.value
                    })
                  }
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                  rows={2}
                  placeholder="Opcional"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Lista de Despesas
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoria
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Observações
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                      Nenhuma despesa cadastrada.
                    </td>
                  </tr>
                )}
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        {formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(expense.expense_date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {expense.notes}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-gray-500 hover:text-pink-600"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense)}
                        className="text-gray-500 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}