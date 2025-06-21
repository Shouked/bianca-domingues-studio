import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Create a mock client if using placeholder values
const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseAnonKey === 'placeholder_key'

export const supabase = isPlaceholder 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          full_name: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          created_at?: string
        }
      }
      procedures: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          appointment_date: string
          total_value: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          appointment_date: string
          total_value: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          appointment_date?: string
          total_value?: number
          status?: string
          created_at?: string
        }
      }
      appointment_procedures: {
        Row: {
          id: string
          appointment_id: string
          procedure_id: string
        }
        Insert: {
          id?: string
          appointment_id: string
          procedure_id: string
        }
        Update: {
          id?: string
          appointment_id?: string
          procedure_id?: string
        }
      }
      expenses: {
        Row: {
          id: string
          category: string
          amount: number
          expense_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          amount: number
          expense_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          amount?: number
          expense_date?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

