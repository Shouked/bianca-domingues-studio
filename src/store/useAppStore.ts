import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  full_name: string
  phone: string
  created_at: string
}

interface Procedure {
  id: string
  name: string
  created_at: string
}

interface Appointment {
  id: string
  client_id: string
  appointment_date: string
  total_value: number
  status: string
  created_at: string
  client?: Client
  procedures?: Procedure[]
}

interface Expense {
  id: string
  category: string
  amount: number
  expense_date: string
  notes: string | null
  created_at: string
}

interface AppState {
  clients: Client[]
  procedures: Procedure[]
  appointments: Appointment[]
  expenses: Expense[]
  loading: boolean
  
  // Actions
  fetchClients: () => Promise<void>
  fetchProcedures: () => Promise<void>
  fetchAppointments: () => Promise<void>
  fetchExpenses: () => Promise<void>
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  procedures: [],
  appointments: [],
  expenses: [],
  loading: false,

  fetchClients: async () => {
    if (!supabase) {
      // Mock data for demonstration
      set({ 
        clients: [
          { id: '1', full_name: 'Maria Silva', phone: '(11) 99999-9999', created_at: new Date().toISOString() },
          { id: '2', full_name: 'Ana Santos', phone: '(11) 88888-8888', created_at: new Date().toISOString() }
        ]
      })
      return
    }
    
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ clients: data || [] })
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchProcedures: async () => {
    if (!supabase) {
      // Mock data for demonstration
      set({ 
        procedures: [
          { id: '1', name: 'Extensão de Cílios', created_at: new Date().toISOString() },
          { id: '2', name: 'Design de Sobrancelhas', created_at: new Date().toISOString() },
          { id: '3', name: 'Lash Lifting', created_at: new Date().toISOString() }
        ]
      })
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('name')
      
      if (error) throw error
      set({ procedures: data || [] })
    } catch (error) {
      console.error('Erro ao buscar procedimentos:', error)
    }
  },

  fetchAppointments: async () => {
    if (!supabase) {
      // Mock data for demonstration
      const mockAppointments = [
        {
          id: '1',
          client_id: '1',
          appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          total_value: 150,
          status: 'agendado',
          created_at: new Date().toISOString(),
          client: { id: '1', full_name: 'Maria Silva', phone: '(11) 99999-9999', created_at: new Date().toISOString() },
          procedures: [{ id: '1', name: 'Extensão de Cílios', created_at: new Date().toISOString() }]
        },
        {
          id: '2',
          client_id: '2',
          appointment_date: new Date().toISOString(), // Today
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
          appointment_procedures(
            procedure:procedures(*)
          )
        `)
        .order('appointment_date', { ascending: false })
      
      if (error) throw error
      
      const appointmentsWithProcedures = data?.map(appointment => ({
        ...appointment,
        procedures: appointment.appointment_procedures?.map((ap: any) => ap.procedure) || []
      })) || []
      
      set({ appointments: appointmentsWithProcedures })
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchExpenses: async () => {
    if (!supabase) {
      // Mock data for demonstration
      const mockExpenses = [
        {
          id: '1',
          category: 'Material de Trabalho',
          amount: 200,
          expense_date: new Date().toISOString().split('T')[0],
          notes: 'Compra de produtos para extensão',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          category: 'Aluguel',
          amount: 800,
          expense_date: new Date().toISOString().split('T')[0],
          notes: null,
          created_at: new Date().toISOString()
        }
      ]
      set({ expenses: mockExpenses })
      return
    }
    
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
      
      if (error) throw error
      set({ expenses: data || [] })
    } catch (error) {
      console.error('Erro ao buscar despesas:', error)
    } finally {
      set({ loading: false })
    }
  },

  addClient: async (clientData) => {
    if (!supabase) {
      // Mock implementation for demonstration
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
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
      
      if (error) throw error
      
      const { clients } = get()
      set({ clients: [data[0], ...clients] })
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      throw error
    }
  },

  addAppointment: async (appointmentData) => {
    if (!supabase) {
      // Mock implementation for demonstration
      const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        created_at: new Date().toISOString()
      }
      get().fetchAppointments()
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
      
      if (error) throw error
      
      // Refresh appointments to get complete data
      get().fetchAppointments()
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error)
      throw error
    }
  },

  addExpense: async (expenseData) => {
    if (!supabase) {
      // Mock implementation for demonstration
      const newExpense = {
        id: Date.now().toString(),
        ...expenseData,
        created_at: new Date().toISOString()
      }
      const { expenses } = get()
      set({ expenses: [newExpense, ...expenses] })
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
      
      if (error) throw error
      
      const { expenses } = get()
      set({ expenses: [data[0], ...expenses] })
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error)
      throw error
    }
  },
}))

