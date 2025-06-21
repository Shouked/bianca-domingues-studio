'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/pt-br'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  DollarSign,
  X,
  Edit,
  Trash2,
  MessageCircle
} from 'lucide-react'
import Layout from '@/components/Layout'

// Configure moment locale
moment.locale('pt-br')
const localizer = momentLocalizer(moment)

interface AppointmentFormData {
  client_id: string
  procedure_ids: string[]
  appointment_date: string
  total_value: number
}

interface AppointmentFormErrors {
  client_id?: string
  procedure_ids?: string
  appointment_date?: string
  total_value?: string
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    id: string
    client?: { full_name: string; phone: string }
    procedures?: { name: string }[]
    appointment_date: string
    total_value: number
    status: string
    created_at: string
  }
}

export default function AppointmentsPage() {
  const { 
    clients, 
    procedures, 
    appointments, 
    fetchClients, 
    fetchProcedures, 
    fetchAppointments,
    addAppointment,
    updateAppointment, // Adicionado
    deleteAppointment, // Adicionado
    loading 
  } = useAppStore()
  
  const [view, setView] = useState<'calendar' | 'form'>('calendar')
  const [editingAppointment, setEditingAppointment] = useState<CalendarEvent['resource'] | null>(null) // Para edição
  const [showModal, setShowModal] = useState(false) // Modal de detalhes do evento
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent['resource'] | null>(null) // Evento selecionado no calendário
  
  const initialFormData: AppointmentFormData = {
    client_id: '',
    procedure_ids: [],
    appointment_date: '',
    total_value: 0,
    // status: 'agendado' // Status inicial pode ser definido aqui se não vier do backend no edit
  }
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<AppointmentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)


  useEffect(() => {
    // Fetch inicial de dados
    // Considerar se o loading global do useAppStore é suficiente ou se precisa de loading local.
    fetchClients()
    fetchProcedures()
    fetchAppointments()
  }, [fetchClients, fetchProcedures, fetchAppointments])

  // Convert appointments to calendar events
  const calendarEvents: CalendarEvent[] = appointments.map(appointment => {
    const startDate = new Date(appointment.appointment_date)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    return {
      id: appointment.id,
      title: `${appointment.client?.full_name} - ${appointment.procedures?.map(p => p.name).join(', ')}`,
      start: startDate,
      end: endDate,
      resource: appointment
    }
  })

  const validateForm = () => {
    const errors: AppointmentFormErrors = {}
    
    if (!formData.client_id) {
      errors.client_id = 'Cliente é obrigatório'
    }
    
    if (formData.procedure_ids.length === 0) {
      errors.procedure_ids = 'Pelo menos um procedimento deve ser selecionado'
    }
    
    if (!formData.appointment_date) {
      errors.appointment_date = 'Data e hora são obrigatórias'
    }
    
    if (formData.total_value <= 0) {
      errors.total_value = 'Valor deve ser maior que zero'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const appointmentPayload = {
        client_id: formData.client_id,
        appointment_date: formData.appointment_date,
        total_value: formData.total_value,
        status: editingAppointment ? editingAppointment.status : 'agendado', 
      };

      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentPayload, formData.procedure_ids)
      } else {
        await addAppointment(appointmentPayload, formData.procedure_ids)
      }
      
      closeFormAndReset()
      // fetchAppointments() // Opcional, store deve ter atualizado.
    } catch (error: any) {
      console.error('Erro ao salvar agendamento:', error)
      setFormErrors({ client_id: `Erro: ${error.message}` }) // Erro genérico
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    if (!selectedEvent) return;
    setEditingAppointment(selectedEvent)
    setFormData({
      client_id: selectedEvent.client?.id || '',
  procedure_ids: selectedEvent.procedures?.map((p: any) => p.id) || [],
  appointment_date: new Date(selectedEvent.appointment_date).toISOString().slice(0, 16),
  total_value: selectedEvent.total_value, 
      // status: selectedEvent.status // Status não é editável diretamente no form, mas pode ser necessário
    })
    setShowModal(false) // Fecha o modal de detalhes
    setView('form')     // Abre o formulário em modo de edição
  }

  const handleDelete = async () => {
    if (!selectedEvent || !confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      await deleteAppointment(selectedEvent.id)
      closeModal()
      // fetchAppointments(); // Opcional
    } catch (error: any) {
      console.error('Erro ao cancelar agendamento:', error)
      alert(`Erro ao cancelar agendamento: ${error.message}`)
    }
  }

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event.resource)
    setEditingAppointment(null) // Limpa qualquer edição pendente ao abrir detalhes
    setShowModal(true)
  }

  const handleProcedureToggle = (procedureId: string) => {
    const newProcedureIds = formData.procedure_ids.includes(procedureId)
      ? formData.procedure_ids.filter(id => id !== procedureId)
      : [...formData.procedure_ids, procedureId]
    
    setFormData({ ...formData, procedure_ids: newProcedureIds })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const generateWhatsAppMessage = (appointment: any) => {
    const date = new Date(appointment.appointment_date)
    const formattedDate = date.toLocaleDateString('pt-BR')
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const procedures = appointment.procedures?.map((p: any) => p.name).join(', ') || ''
    
    const message = `Olá ${appointment.client?.full_name}! Passando para confirmar seu agendamento de ${procedures} amanhã, dia ${formattedDate}, às ${formattedTime}. Atenciosamente, Bianca Domingues.`
    
    const phone = appointment.client?.phone?.replace(/\D/g, '') || ''
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }
  // ✅ ADICIONE ESTA FUNÇÃO ABAIXO:
  const closeFormAndReset = () => {
  setView('calendar')
  setFormData(initialFormData)
  setEditingAppointment(null)

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
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600">Gerencie seus agendamentos</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                view === 'calendar'
                  ? 'border-pink-600 text-pink-600 bg-pink-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendário
            </button>
            <button
              onClick={() => setView('form')}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                view === 'form'
                  ? 'border-pink-600 text-pink-600 bg-pink-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleEventSelect}
                views={['month', 'week', 'day']}
                defaultView="month"
                messages={{
                  next: 'Próximo',
                  previous: 'Anterior',
                  today: 'Hoje',
                  month: 'Mês',
                  week: 'Semana',
                  day: 'Dia',
                  agenda: 'Agenda',
                  date: 'Data',
                  time: 'Hora',
                  event: 'Evento',
                  noEventsInRange: 'Não há agendamentos neste período',
                  showMore: (total) => `+ Ver mais (${total})`
                }}
                formats={{
                  monthHeaderFormat: 'MMMM YYYY',
                  dayHeaderFormat: 'dddd, DD [de] MMMM',
                  dayRangeHeaderFormat: ({ start, end }) => 
                    `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`,
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }) => 
                    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
                }}
                style={{ height: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Form View */}
        {view === 'form' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Novo Agendamento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                  Cliente
                </label>
                <select
                  id="client_id"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                    formErrors.client_id
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
                {formErrors.client_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.client_id}</p>
                )}
              </div>

              {/* Procedures Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Procedimentos
                </label>
                <div className="space-y-2">
                  {procedures.map((procedure) => (
                    <label key={procedure.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.procedure_ids.includes(procedure.id)}
                        onChange={() => handleProcedureToggle(procedure.id)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{procedure.name}</span>
                    </label>
                  ))}
                </div>
                {formErrors.procedure_ids && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.procedure_ids}</p>
                )}
              </div>

              {/* Date and Time */}
              <div>
                <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700">
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  id="appointment_date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                    formErrors.appointment_date
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                />
                {formErrors.appointment_date && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.appointment_date}</p>
                )}
              </div>

              {/* Total Value */}
              <div>
                <label htmlFor="total_value" className="block text-sm font-medium text-gray-700">
                  Valor Total
                </label>
                <input
                  type="number"
                  id="total_value"
                  step="0.01"
                  min="0"
                  value={formData.total_value}
                  onChange={(e) => setFormData({ ...formData, total_value: parseFloat(e.target.value) || 0 })}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
                    formErrors.total_value
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                  }`}
                  placeholder="0,00"
                />
                {formErrors.total_value && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.total_value}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Event Details Modal */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={closeModal}
              ></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Detalhes do Agendamento
                    </h3>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    >
                      <span className="sr-only">Fechar</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedEvent.client?.full_name}</p>
                        <p className="text-sm text-gray-500">{selectedEvent.client?.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedEvent.appointment_date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedEvent.appointment_date).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Procedimentos</p>
                        <p className="text-sm text-gray-500">
                          {selectedEvent.procedures?.map((p: any) => p.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(selectedEvent.total_value)}
                        </p>
                        <p className="text-sm text-gray-500">Valor total</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedEvent.status === 'agendado' 
                          ? 'bg-blue-100 text-blue-800'
                          : selectedEvent.status === 'concluído'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEvent.status}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => generateWhatsAppMessage(selectedEvent)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

