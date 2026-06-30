import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface User {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

export default function Confirmacao() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const selectedServices: Service[] = state?.selectedServices || []
  const horario = state?.horario
  const date = state?.date
  const isAdminBooking = !!state?.isAdminBooking

  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const [users, setUsers] = useState<User[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [searchClient, setSearchClient] = useState('')

  useEffect(() => {
    if (!isAdminBooking) return

    api.get('/api/users')
      .then((res) => {
        const clients = (res.data.users || []).filter(
          (user: User) => user.role === 'client'
        )

        setUsers(clients)
      })
      .catch((err) => {
        console.error(err)
        alert('Erro ao carregar clientes.')
      })
  }, [isAdminBooking])

  function formatDate(dateStr: string) {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  function normalize(value: string) {
    return value.replace(/\D/g, '')
  }

  function durationServices(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins} min`
    }

    if (mins === 0) {
      return `${hours}h`
    }

    return `${hours}h ${mins}min`
  }

  const filteredUsers = users.filter((user) => {
    const searchText = searchClient.trim().toLowerCase()
    const searchPhone = normalize(searchClient)
    const userPhone = normalize(user.phone || '')

    return (
      user.name.toLowerCase().includes(searchText) ||
      (user.email || '').toLowerCase().includes(searchText) ||
      (searchPhone.length > 0 && userPhone.includes(searchPhone))
    )
  })

  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price)
  }, 0)

  const totalDuration = selectedServices.reduce((sum, service) => {
    return sum + Number(service.duration_minutes)
  }, 0)

  async function handleConfirm() {
    try {
      setLoading(true)

      if (!date || !horario || selectedServices.length === 0) {
        alert('Dados do agendamento inválidos.')
        navigate('/agendamento', {
          state: {
            isAdminBooking
          }
        })
        return
      }

      const token = localStorage.getItem('token')

      if (!token) {
        alert('Você precisa estar logado para criar um agendamento.')
        navigate('/login')
        return
      }

      if (isAdminBooking && !selectedClient) {
        alert('Selecione um cliente para este agendamento.')
        return
      }

      const payload: any = {
        date,
        start_time: horario,
        service_ids: selectedServices.map((service) => service.id),
        payment_method: paymentMethod,
        notes: ''
      }

      if (isAdminBooking) {
        payload.client_id = selectedClient
      }

      const response = await api.post('/api/appointments', payload)

      console.log('✅ Agendamento criado:', response.data)
      alert('Serviço agendado com sucesso!')

      if (isAdminBooking) {
        navigate('/admin-horarios')
      } else {
        navigate('/meus-agendamentos')
      }
    } catch (err: any) {
      console.error('❌ Erro ao criar agendamento:', err.response?.data || err.message)
      alert(err.response?.data?.message || 'Erro ao criar agendamento.')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    padding: 30,
    backgroundColor: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    color: 'var(--text-h)',
    maxWidth: 600,
    margin: '40px auto 0 auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  }

  const selectStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginBottom: '2rem'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    marginBottom: '0.8rem',
    boxSizing: 'border-box' as const
  }

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 15,
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.95rem'
  }

  return (
    <div style={{ padding: 20, color: 'var(--text-h)' }}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '2rem', fontWeight: 500, textAlign: 'center' }}>
          Confirmar agendamento
        </h2>

        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 15 }}>
            <h3 style={{ marginBottom: '0.8rem', fontWeight: 500, fontSize: '1.1rem' }}>
              Serviços selecionados
            </h3>

            {selectedServices.length === 0 ? (
              <p style={{ color: '#c62828' }}>
                Nenhum serviço foi selecionado.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedServices.map((service) => (
                  <div key={service.id} style={infoRowStyle}>
                    <span style={{ fontWeight: 500 }}>{service.name}</span>
                    <span>
                      R$ {Number(service.price).toFixed(2)} —{' '}
                      {durationServices(service.duration_minutes)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Preço total:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
              R$ {totalPrice.toFixed(2)}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Duração total:</span>
            <span style={{ fontWeight: 500 }}>
              {durationServices(totalDuration)}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Data:</span>
            <span style={{ fontWeight: 500 }}>{formatDate(date)}</span>
          </div>

          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Horário:</span>
            <span style={{ fontWeight: 500 }}>{horario}</span>
          </div>
        </div>

        {isAdminBooking && (
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ marginBottom: '0.8rem', fontWeight: 500, fontSize: '1.1rem' }}>
              Cliente
            </h3>

            <input
              type="text"
              placeholder="Pesquisar por nome, e-mail ou telefone..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              style={inputStyle}
            />

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              style={selectStyle}
            >
              <option value="">Selecione um cliente</option>

              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                  {user.phone ? ` - ${user.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <h3 style={{ marginBottom: '0.8rem', fontWeight: 500, fontSize: '1.1rem' }}>
            Forma de pagamento
          </h3>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={selectStyle}
          >
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de crédito</option>
            <option value="debit_card">Cartão de débito</option>
            <option value="cash">Dinheiro</option>
          </select>

          <button
            onClick={handleConfirm}
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isHovered ? 'transparent' : 'var(--accent)',
              color: isHovered ? 'var(--accent)' : '#fff',
              border: isHovered ? '1px solid var(--accent)' : '1px solid transparent',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}