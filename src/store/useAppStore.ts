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
  addProcedure: (procedure: Omit<Procedure, 'id' | 'created_at'>) => Promise<Procedure | null>
  updateProcedure: (id: string, procedureData: Partial<Omit<Procedure, 'id' | 'created_at'>>) => Promise<Procedure | null>
  deleteProcedure: (id: string) => Promise<boolean>

  fetchAppointments: () => Promise<void>
  fetchExpenses: () => Promise<void>
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>
  updateClient: (id: string, clientData: Partial<Omit<Client, 'id' | 'created_at'>>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'client' | 'procedures'>, procedureIds: string[]) => Promise<Appointment | null>
  updateAppointment: (id: string, appointmentData: Partial<Omit<Appointment, 'id' | 'created_at' | 'client' | 'procedures'>>, procedureIds: string[]) => Promise<Appointment | null>
  deleteAppointment: (id: string) => Promise<boolean>

  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<Expense | null>
  updateExpense: (id: string, expenseData: Partial<Omit<Expense, 'id' | 'created_at'>>) => Promise<Expense | null>
  deleteExpense: (id: string) => Promise<boolean>
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  procedures: [],
  appointments: [],
  expenses: [],
  loading: false,

  // --- CLIENTS ---
  fetchClients: async () => {
    set({ loading: true })
    if (!supabase) {
      console.log("Supabase not configured, using mock data for clients.");
      set({ 
        clients: [
          { id: '1', full_name: 'Maria Silva (Mock)', phone: '(11) 99999-9999', created_at: new Date().toISOString() },
          { id: '2', full_name: 'Ana Santos (Mock)', phone: '(11) 88888-8888', created_at: new Date().toISOString() }
        ],
        loading: false
      })
      return
    }
    
    try {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (error) throw error
      set({ clients: data || [] })
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      set({ clients: [] }) // Evita manter dados antigos em caso de erro
    } finally {
      set({ loading: false })
    }
  },

  addClient: async (clientData) => {
    if (!supabase) {
      console.log("Supabase not configured, mocking addClient.");
      const newClient = { id: Date.now().toString(), ...clientData, created_at: new Date().toISOString() }
      set((state) => ({ clients: [newClient, ...state.clients] }))
      return
    }
    try {
      const { data, error } = await supabase.from('clients').insert([clientData]).select()
      if (error) throw error
      if (data) set((state) => ({ clients: [data[0], ...state.clients] }))
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      throw error
    }
  },

  updateClient: async (id, clientData) => {
    if (!supabase) {
      console.log("Supabase not configured, mocking updateClient.");
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...clientData } : c)),
      }))
      return
    }
    try {
      const { data, error } = await supabase.from('clients').update(clientData).eq('id', id).select()
      if (error) throw error
      if (data) {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? data[0] : c)),
        }))
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  },

  deleteClient: async (id) => {
     if (!supabase) {
      console.log("Supabase not configured, mocking deleteClient.");
      set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
      return
    }
    try {
      // Primeiro, verificar se o cliente tem agendamentos associados
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('client_id', id)
        .limit(1)

      if (appointmentsError) throw appointmentsError;

      if (appointmentsData && appointmentsData.length > 0) {
        throw new Error('Este cliente não pode ser excluído pois possui agendamentos associados.');
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
    // Não setar loading aqui para permitir loading individual em outras fetches
    if (!supabase) {
      console.log("Supabase not configured, using mock data for procedures.");
      set({ 
        procedures: [
          { id: '1', name: 'Extensão de Cílios (Mock)', created_at: new Date().toISOString() },
          { id: '2', name: 'Design de Sobrancelhas (Mock)', created_at: new Date().toISOString() },
          { id: '3', name: 'Lash Lifting (Mock)', created_at: new Date().toISOString() }
        ]
      })
      return
    }
    try {
      const { data, error } = await supabase.from('procedures').select('*').order('name')
      if (error) throw error
      set({ procedures: data || [] })
    } catch (error) {
      console.error('Erro ao buscar procedimentos:', error)
      set({ procedures: [] })
    }
  },

  addProcedure: async (procedureData) => {
    if (!supabase) {
      console.log("Supabase not configured, mocking addProcedure.");
      const newProcedure = { id: Date.now().toString(), ...procedureData, created_at: new Date().toISOString() }
      set((state) => ({ procedures: [...state.procedures, newProcedure].sort((a,b) => a.name.localeCompare(b.name)) }))
      return newProcedure;
    }
    try {
      const { data, error } = await supabase.from('procedures').insert([procedureData]).select()
      if (error) throw error
      if (data && data.length > 0) {
        set((state) => ({ procedures: [...state.procedures, data[0]].sort((a,b) => a.name.localeCompare(b.name)) }))
        return data[0]
      }
      return null;
    } catch (error) {
      console.error('Erro ao adicionar procedimento:', error)
      throw error
    }
  },

  updateProcedure: async (id, procedureData) => {
    if (!supabase) {
      console.log("Supabase not configured, mocking updateProcedure.");
      let updatedProc: Procedure | null = null;
      set((state) => ({
        procedures: state.procedures.map((p) => {
          if (p.id === id) {
            updatedProc = { ...p, ...procedureData };
            return updatedProc;
          }
          return p;
        }).sort((a,b) => a.name.localeCompare(b.name)),
      }))
      return updatedProc;
    }
    try {
      const { data, error } = await supabase.from('procedures').update(procedureData).eq('id', id).select()
      if (error) throw error
      if (data && data.length > 0) {
        set((state) => ({
          procedures: state.procedures.map((p) => (p.id === id ? data[0] : p)).sort((a,b) => a.name.localeCompare(b.name)),
        }))
        return data[0];
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error)
      throw error
    }
  },

  deleteProcedure: async (id) => {
    if (!supabase) {
      console.log("Supabase not configured, mocking deleteProcedure.");
      set((state) => ({ procedures: state.procedures.filter((p) => p.id !== id) }))
      return true;
    }
    try {
      const { data: appointmentProcedures, error: checkError } = await supabase
        .from('appointment_procedures')
        .select('id')
        .eq('procedure_id', id)
        .limit(1)

      if (checkError) throw checkError;

      if (appointmentProcedures && appointmentProcedures.length > 0) {
        // Em vez de alert, vamos lançar um erro para ser tratado na UI
        throw new Error('Este procedimento não pode ser excluído pois está associado a um ou mais agendamentos.');
      }

      const { error } = await supabase.from('procedures').delete().eq('id', id)
      if (error) throw error
      set((state) => ({ procedures: state.procedures.filter((p) => p.id !== id) }))
      return true;
    } catch (error) {
      console.error('Erro ao deletar procedimento:', error)
      throw error // Re-throw para ser pego na UI
    }
  },

  // --- APPOINTMENTS ---
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

