import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Tipos Globais Exportados
export interface Client {
  id: string
  full_name: string
  phone: string
  created_at: string
}

export interface Procedure {
  id: string
  name: string
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string
  appointment_date: string
  total_value: number
  status: string
  created_at: string
  client?: Client
  procedures?: Procedure[]
}

export interface Expense {
  id: string
  category: string
  amount: number
  expense_date: string
  notes: string | null
  created_at: string
}

// Estado da Store
interface AppStoreState {
  clients: Client[]
  procedures: Procedure[]
  appointments: Appointment[]
  expenses: Expense[]
  loading: boolean

  fetchClients: () => Promise<void>
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>
  updateClient: (id: string, client: Partial<Omit<Client, 'id' | 'created_at'>>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  fetchProcedures: () => Promise<void>
  addProcedure: (procedure: Omit<Procedure, 'id' | 'created_at'>) => Promise<void>
  updateProcedure: (id: string, procedure: Partial<Omit<Procedure, 'id' | 'created_at'>>) => Promise<void>
  deleteProcedure: (id: string) => Promise<boolean>

  fetchAppointments: () => Promise<void>
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'client' | 'procedures'>, procedureIds: string[]) => Promise<Appointment | null>
  updateAppointment: (id: string, appointmentData: Partial<Omit<Appointment, 'id' | 'created_at' | 'client' | 'procedures'>>, procedureIds: string[]) => Promise<Appointment | null>
  deleteAppointment: (id: string) => Promise<boolean>

  fetchExpenses: () => Promise<void>
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<Expense | null>
  updateExpense: (id: string, expenseData: Partial<Omit<Expense, 'id' | 'created_at'>>) => Promise<Expense | null>
  deleteExpense: (id: string) => Promise<boolean>
}

const supabase = typeof window !== 'undefined' ? createClientComponentClient() : null

export const useAppStore = create<AppStoreState>()(
  devtools((set, get) => ({
    clients: [],
    procedures: [],
    appointments: [],
    expenses: [],
    loading: false,

    // --- CLIENTES ---
    fetchClients: async () => {
      if (!supabase) {
        set({
          clients: [
            {
              id: '1',
              full_name: 'Maria Silva',
              phone: '(11) 99999-9999',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              full_name: 'Ana Santos',
              phone: '(11) 88888-8888',
              created_at: new Date().toISOString()
            }
          ]
        })
        return
      }
      set({ loading: true })
      try {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
        if (error) throw error
        set({ clients: data || [] })
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
      } finally {
        set({ loading: false })
      }
    },

    addClient: async (clientData) => {
      if (!supabase) {
        const newClient = {
          id: Date.now().toString(),
          ...clientData,
          created_at: new Date().toISOString()
        }
        const { clients } = get()
        set({ clients: [newClient, ...clients] })
        return
      }

      try {
        const { data, error } = await supabase.from('clients').insert([clientData]).select()
        if (error) throw error
        const { clients } = get()
        set({ clients: [data[0], ...clients] })
      } catch (error) {
        console.error('Erro ao adicionar cliente:', error)
        throw error
      }
    },

    updateClient: async (id, clientData) => {
      if (!supabase) {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...clientData } : c))
        }))
        return
      }
      try {
        const { error } = await supabase.from('clients').update(clientData).eq('id', id)
        if (error) throw error
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...clientData } : c))
        }))
      } catch (error) {
        console.error('Erro ao atualizar cliente:', error)
        throw error
      }
    },

    deleteClient: async (id) => {
      if (!supabase) {
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
        return
      }
      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id')
          .eq('client_id', id)
          .limit(1)
        if (appointmentsError) throw appointmentsError
        if (appointmentsData && appointmentsData.length > 0) {
          throw new Error('Este cliente não pode ser excluído pois possui agendamentos associados.')
        }
        const { error } = await supabase.from('clients').delete().eq('id', id)
        if (error) throw error
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
      } catch (error) {
        console.error('Erro ao deletar cliente:', error)
        throw error
      }
    },

    // --- PROCEDURES ---
    fetchProcedures: async () => {
      if (!supabase) {
        set({
          procedures: [
            { id: '1', name: 'Extensão de Cílios', created_at: new Date().toISOString() },
            { id: '2', name: 'Design de Sobrancelhas', created_at: new Date().toISOString() }
          ]
        })
        return
      }
      set({ loading: true })
      try {
        const { data, error } = await supabase.from('procedures').select('*').order('created_at', { ascending: false })
        if (error) throw error
        set({ procedures: data || [] })
      } catch (error) {
        console.error('Erro ao buscar procedimentos:', error)
      } finally {
        set({ loading: false })
      }
    },

    addProcedure: async (procedureData) => {
      if (!supabase) {
        const newProcedure = {
          id: Date.now().toString(),
          ...procedureData,
          created_at: new Date().toISOString()
        }
        const { procedures } = get()
        set({ procedures: [newProcedure, ...procedures] })
        return
      }
      try {
        const { data, error } = await supabase.from('procedures').insert([procedureData]).select()
        if (error) throw error
        const { procedures } = get()
        set({ procedures: [data[0], ...procedures] })
      } catch (error) {
        console.error('Erro ao adicionar procedimento:', error)
        throw error
      }
    },

    updateProcedure: async (id, procedureData) => {
      if (!supabase) {
        set((state) => ({
          procedures: state.procedures.map((p) => (p.id === id ? { ...p, ...procedureData } : p))
        }))
        return
      }
      try {
        const { error } = await supabase.from('procedures').update(procedureData).eq('id', id)
        if (error) throw error
        set((state) => ({
          procedures: state.procedures.map((p) => (p.id === id ? { ...p, ...procedureData } : p))
        }))
      } catch (error) {
        console.error('Erro ao atualizar procedimento:', error)
        throw error
      }
    },

    deleteProcedure: async (id) => {
      if (!supabase) {
        set((state) => ({ procedures: state.procedures.filter((p) => p.id !== id) }))
        return true
      }
      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointment_procedures')
          .select('id')
          .eq('procedure_id', id)
          .limit(1)
        if (appointmentsError) throw appointmentsError
        if (appointmentsData && appointmentsData.length > 0) {
          throw new Error('Este procedimento não pode ser excluído pois está associado a um ou mais agendamentos.')
        }
        const { error } = await supabase.from('procedures').delete().eq('id', id)
        if (error) throw error
        set((state) => ({ procedures: state.procedures.filter((p) => p.id !== id) }))
        return true
      } catch (error) {
        console.error('Erro ao deletar procedimento:', error)
        throw error
      }
    },

    // --- APPOINTMENTS ---
    fetchAppointments: async () => {
      if (!supabase) {
        const mockAppointments = [
          {
            id: '1',
            client_id: '1',
            appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            total_value: 150,
            status: 'agendado',
            created_at: new Date().toISOString(),
            client: { id: '1', full_name: 'Maria Silva', phone: '(11) 99999-9999', created_at: new Date().toISOString() },
            procedures: [{ id: '1', name: 'Extensão de Cílios', created_at: new Date().toISOString() }]
          },
          {
            id: '2',
            client_id: '2',
            appointment_date: new Date().toISOString(),
            total_value: 80,
            status: 'concluído',
            created_at: new Date().toISOString(),
            client: { id: '2', full_name: 'Ana Santos', phone: '(11) 88888-8888', created_at: new Date().toISOString() },
            procedures: [{ id: '2', name: 'Design de Sobrancelhas', created_at: new Date().toISOString() }]
          }
        ]
        set({ appointments: mockAppointments })
        return
      }
      set({ loading: true })
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            client:clients(*),
            procedures:procedures(*)
          `)
          .order('appointment_date', { ascending: false })
        if (error) throw error
        set({ appointments: data || [] })
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error)
      } finally {
        set({ loading: false })
      }
    },

    addAppointment: async (appointmentData, procedureIds) => {
      if (!supabase) {
        const newAppointment = {
          id: Date.now().toString(),
          ...appointmentData,
          created_at: new Date().toISOString()
        }
        get().fetchAppointments()
        return newAppointment
      }
      try {
        const { data, error } = await supabase.from('appointments').insert([appointmentData]).select().single()
        if (error) throw error
        if (procedureIds && procedureIds.length) {
          const procedureRelations = procedureIds.map(pid => ({
            appointment_id: data.id,
            procedure_id: pid
          }))
          const { error: relError } = await supabase.from('appointment_procedures').insert(procedureRelations)
          if (relError) throw relError
        }
        await get().fetchAppointments()
        return data
      } catch (error) {
        console.error('Erro ao adicionar agendamento:', error)
        throw error
      }
    },

    updateAppointment: async (id, appointmentData, procedureIds) => {
      if (!supabase) {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...appointmentData } : a
          )
        }))
        return null
      }
      try {
        const { error } = await supabase.from('appointments').update(appointmentData).eq('id', id)
        if (error) throw error
        if (procedureIds) {
          await supabase.from('appointment_procedures').delete().eq('appointment_id', id)
          if (procedureIds.length > 0) {
            const relations = procedureIds.map(pid => ({
              appointment_id: id,
              procedure_id: pid
            }))
            const { error: relError } = await supabase.from('appointment_procedures').insert(relations)
            if (relError) throw relError
          }
        }
        await get().fetchAppointments()
        return null
      } catch (error) {
        console.error('Erro ao atualizar agendamento:', error)
        throw error
      }
    },

    deleteAppointment: async (id) => {
      if (!supabase) {
        set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }))
        return true
      }
      try {
        const { error } = await supabase.from('appointments').delete().eq('id', id)
        if (error) throw error
        set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }))
        return true
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error)
        throw error
      }
    },

    // --- EXPENSES ---
    fetchExpenses: async () => {
      if (!supabase) {
        set({
          expenses: [
            {
              id: '1',
              category: 'Materiais',
              amount: 200,
              expense_date: new Date().toISOString(),
              notes: 'Compras de produtos',
              created_at: new Date().toISOString()
            }
          ]
        })
        return
      }
      set({ loading: true })
      try {
        const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false })
        if (error) throw error
        set({ expenses: data || [] })
      } catch (error) {
        console.error('Erro ao buscar despesas:', error)
      } finally {
        set({ loading: false })
      }
    },

    addExpense: async (expenseData) => {
      if (!supabase) {
        const newExpense = {
          id: Date.now().toString(),
          ...expenseData,
          created_at: new Date().toISOString()
        }
        const { expenses } = get()
        set({ expenses: [newExpense, ...expenses] })
        return newExpense
      }
      try {
        const { data, error } = await supabase.from('expenses').insert([expenseData]).select().single()
        if (error) throw error
        await get().fetchExpenses()
        return data
      } catch (error) {
        console.error('Erro ao adicionar despesa:', error)
        throw error
      }
    },

    updateExpense: async (id, expenseData) => {
      if (!supabase) {
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expenseData } : e))
        }))
        return null
      }
      try {
        const { error } = await supabase.from('expenses').update(expenseData).eq('id', id)
        if (error) throw error
        await get().fetchExpenses()
        return null
      } catch (error) {
        console.error('Erro ao atualizar despesa:', error)
        throw error
      }
    },

    deleteExpense: async (id) => {
      if (!supabase) {
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
        return true
      }
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (error) throw error
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
        return true
      } catch (error) {
        console.error('Erro ao deletar despesa:', error)
        throw error
      }
    }
  }))
)