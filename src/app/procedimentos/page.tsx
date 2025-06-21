'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase' // Necessário para adicionar/editar/deletar
import { Plus, Edit, Trash2, X, Package, DollarSign, Clock } from 'lucide-react'
import Layout from '@/components/Layout'

interface Procedure { // Esta interface pode ser removida se a do store for importada e usada
  id: string
  name: string
  // Adicione outros campos se necessário, ex: duration, price
  // duration: number; // em minutos
  // price: number;
  created_at: string // Já vem do store
}

interface ProcedureFormData {
  name: string
  // duration: number; // Exemplo
  // price: number;  // Exemplo
}

export default function ProceduresPage() {
  const { 
    procedures, 
    fetchProcedures, 
    addProcedure, 
    updateProcedure, 
    deleteProcedure, 
    loading 
  } = useAppStore((state) => ({
    procedures: state.procedures,
    fetchProcedures: state.fetchProcedures,
    addProcedure: state.addProcedure,
    updateProcedure: state.updateProcedure,
    deleteProcedure: state.deleteProcedure,
    loading: state.loading, // Pode ser um loading específico para procedures se preferir
  }))

  const [searchTerm, setSearchTerm] = useState('') // Não implementado na UI ainda
  const [showModal, setShowModal] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)
  const [formData, setFormData] = useState<ProcedureFormData>({
    name: '',
    // duration: 0,
    // price: 0,
  })
  const [formErrors, setFormErrors] = useState<Partial<ProcedureFormData>>({})

  useEffect(() => {
    fetchProcedures()
  }, [fetchProcedures])

  const filteredProcedures = procedures.filter(proc =>
    proc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const validateForm = () => {
    const errors: Partial<ProcedureFormData> = {}
    if (!formData.name.trim()) {
      errors.name = 'Nome do procedimento é obrigatório'
    }
    // if (formData.duration <= 0) {
    //   errors.duration = 'Duração deve ser maior que zero';
    // }
    // if (formData.price <= 0) {
    //   errors.price = 'Preço deve ser maior que zero';
    // }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (!supabase) { // Modo Simulado
        console.log("Modo Simulado - Supabase não configurado");
        if (editingProcedure) {
          console.log('Simulando atualização de procedimento:', editingProcedure.id, formData)
          // Atualizar localmente no Zustand store (precisaria da função no store)
        } else {
          console.log('Simulando adição de procedimento:', formData)
          // Adicionar localmente no Zustand store (precisaria da função no store)
        }
        fetchProcedures(); // Re-fetch para atualizar a lista (ou atualizar o estado local)
        closeModalAndResetForm();
        return;
      }

      if (editingProcedure) {
        // Lógica de Atualização com Supabase
        const { error } = await supabase
          .from('procedures')
          .update({ name: formData.name.trim() /*, duration: formData.duration, price: formData.price */ })
          .eq('id', editingProcedure.id)
        if (error) throw error
        // Idealmente, o useAppStore.updateProcedure faria isso e atualizaria o estado
      } else {
        // Lógica de Adição com Supabase
        const { error } = await supabase
          .from('procedures')
          .insert([{ name: formData.name.trim() /*, duration: formData.duration, price: formData.price */ }])
        if (error) throw error
        // Idealmente, o useAppStore.addProcedure faria isso e atualizaria o estado
      }
      fetchProcedures() // Re-fetch para atualizar a lista.
      closeModalAndResetForm()
    } catch (error: any) {
      console.error('Erro ao salvar procedimento:', error)
      setFormErrors({ name: `Erro do servidor: ${error.message}` }) // Exibe erro genérico no formulário
    }
  }

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure)
    setFormData({
      name: procedure.name,
      // duration: procedure.duration || 0,
      // price: procedure.price || 0,
    })
    setShowModal(true)
  }

  const handleDelete = async (procedureId: string) => {
    if (confirm('Tem certeza que deseja excluir este procedimento? Esta ação não pode ser desfeita.')) {
      try {
        if (!supabase) { // Modo Simulado
          console.log("Modo Simulado - Supabase não configurado");
          console.log('Simulando exclusão de procedimento:', procedureId);
          // Deletar localmente no Zustand store (precisaria da função no store)
          fetchProcedures(); // Re-fetch para atualizar a lista
          return;
        }

        // Verificar se o procedimento está sendo usado em 'appointment_procedures'
        const { data: appointmentProcedures, error: checkError } = await supabase
          .from('appointment_procedures')
          .select('id')
          .eq('procedure_id', procedureId)
          .limit(1)

        if (checkError) throw checkError;

        if (appointmentProcedures && appointmentProcedures.length > 0) {
          alert('Este procedimento não pode ser excluído pois está associado a um ou mais agendamentos.')
          return
        }

        const { error } = await supabase
          .from('procedures')
          .delete()
          .eq('id', procedureId)
        if (error) throw error
        // Idealmente, o useAppStore.deleteProcedure faria isso e atualizaria o estado
        fetchProcedures() // Re-fetch para atualizar a lista.
      } catch (error: any) {
        console.error('Erro ao excluir procedimento:', error)
        alert(`Erro ao excluir: ${error.message}`)
      }
    }
  }
  
  const closeModalAndResetForm = () => {
    setShowModal(false)
    setEditingProcedure(null)
    setFormData({ name: '' /*, duration: 0, price: 0 */ })
    setFormErrors({})
  }

  const openModal = () => {
    closeModalAndResetForm() // Garante que o formulário esteja limpo
    setShowModal(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Procedimentos</h1>
            <p className="text-gray-600">Gerencie os procedimentos oferecidos</p>
          </div>
          <button
            onClick={openModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Procedimento
          </button>
        </div>

        {/* TODO: Adicionar campo de busca se necessário */}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredProcedures.length === 0 ? (
              <div className="text-center py-12">
                 <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'Nenhum procedimento encontrado' : 'Nenhum procedimento cadastrado'}
                </p>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando um novo procedimento.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredProcedures.map((proc) => (
                  <li key={proc.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {proc.name}
                        </h3>
                        {/* <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                          {proc.duration > 0 && (
                            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {proc.duration} min</span>
                          )}
                          {proc.price > 0 && (
                            <span className="flex items-center"><DollarSign className="h-4 w-4 mr-1" /> R$ {proc.price.toFixed(2)}</span>
                          )}
                        </div> */}
                        <p className="text-xs text-gray-400 mt-1">
                          Criado em {new Date(proc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(proc)}
                          className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full"
                          aria-label="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={closeModalAndResetForm}
              ></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
                      </h3>
                      <button
                        type="button"
                        onClick={closeModalAndResetForm}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                        aria-label="Fechar"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nome do Procedimento
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                            formErrors.name
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                          }`}
                          placeholder="Ex: Extensão de Cílios Volume Russo"
                          autoFocus
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                      </div>
                      {/* 
                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                          Duração (minutos)
                        </label>
                        <input
                          type="number"
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                            formErrors.duration
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                          }`}
                          placeholder="Ex: 120"
                        />
                        {formErrors.duration && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Preço (R$)
                        </label>
                        <input
                          type="number"
                          id="price"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                            formErrors.price
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                          }`}
                          placeholder="Ex: 150.00"
                        />
                        {formErrors.price && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                        )}
                      </div>
                      */}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      // disabled={loading} // Adicionar estado de loading para o submit do form
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {/* {loading ? 'Salvando...' : (editingProcedure ? 'Atualizar' : 'Salvar')} */}
                      {editingProcedure ? 'Atualizar' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModalAndResetForm}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
