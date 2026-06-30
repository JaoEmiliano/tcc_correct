import { useEffect, useState } from 'react'
import api from '../services/api'

type PeriodType = 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom'

interface FinancialData {
  period: string
  startDate: string
  endDate: string
  client_id?: string

  received_revenue: number
  pending_revenue: number
  forecast_revenue: number

  completed_count: number
  completed_paid_count: number
  completed_pending_count: number
  scheduled_count: number
  cancelled_count: number

  average_ticket: number

  payment_methods: Array<{
    method: string
    total: number
    appointments: number
  }>

  top_services: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>

  top_clients: Array<{
    client_id: string | null
    name: string
    appointments: number
    revenue: number
  }>

  by_day: Array<{
    date: string
    received_revenue: number
    pending_revenue: number
    forecast_revenue: number
    completed: number
    scheduled: number
    cancelled: number
  }>
}

interface Client {
  id: string
  name: string
  role?: string
}

export default function Dashboard() {
  const initialRange = getMonthRange()

  const [data, setData] = useState<FinancialData | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  const [period, setPeriod] = useState<PeriodType>('monthly')
  const [startDate, setStartDate] = useState(initialRange.startDate)
  const [endDate, setEndDate] = useState(initialRange.endDate)
  const [selectedClient, setSelectedClient] = useState('')

  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchFinancialDashboard({
      startDate: initialRange.startDate,
      endDate: initialRange.endDate
    })
  }, [])

  function formatDateInput(date: Date) {
    return date.toISOString().split('T')[0]
  }

  function getToday() {
    return formatDateInput(new Date())
  }

  function getWeekRange() {
    const today = new Date()
    const day = today.getDay()

    const diffToMonday = day === 0 ? -6 : 1 - day

    const monday = new Date(today)
    monday.setDate(today.getDate() + diffToMonday)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return {
      startDate: formatDateInput(monday),
      endDate: formatDateInput(sunday)
    }
  }

  function getMonthRange() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    return {
      startDate: formatDateInput(firstDay),
      endDate: formatDateInput(lastDay)
    }
  }

  function getYearRange() {
    const today = new Date()
    const year = today.getFullYear()

    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    }
  }

  function getRangeByPeriod(selectedPeriod: PeriodType) {
    if (selectedPeriod === 'today') {
      const today = getToday()

      return {
        startDate: today,
        endDate: today
      }
    }

    if (selectedPeriod === 'weekly') {
      return getWeekRange()
    }

    if (selectedPeriod === 'monthly') {
      return getMonthRange()
    }

    if (selectedPeriod === 'yearly') {
      return getYearRange()
    }

    return {
      startDate,
      endDate
    }
  }

  function formatCurrency(value?: number | string | null) {
    if (value === undefined || value === null) {
      return 'R$ 0,00'
    }

    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function formatDateBR(dateString: string) {
    if (!dateString) {
      return '-'
    }

    return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  function formatPaymentMethod(method?: string) {
    switch (method) {
      case 'pix':
        return 'PIX'
      case 'credit_card':
        return 'Cartão de crédito'
      case 'debit_card':
        return 'Cartão de débito'
      case 'cash':
        return 'Dinheiro'
      case 'not_informed':
        return 'Não informado'
      default:
        return '—'
    }
  }

  async function fetchClients() {
    try {
      const res = await api.get('/api/users')

      const onlyClients = (res.data.users || []).filter((user: Client) => {
        return user.role === 'client'
      })

      setClients(onlyClients)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchFinancialDashboard(
    overrides: {
      startDate?: string
      endDate?: string
      selectedClient?: string
    } = {}
  ) {
    const currentStartDate = overrides.startDate ?? startDate
    const currentEndDate = overrides.endDate ?? endDate
    const currentClient = overrides.selectedClient ?? selectedClient

    if (!currentStartDate || !currentEndDate) {
      alert('Informe a data inicial e a data final.')
      return
    }

    if (currentStartDate > currentEndDate) {
      alert('A data inicial não pode ser maior que a data final.')
      return
    }

    try {
      setLoading(true)

      let url = `/api/dashboard/financial?startDate=${currentStartDate}&endDate=${currentEndDate}`

      if (currentClient) {
        url += `&client_id=${currentClient}`
      }

      const res = await api.get(url)
      setData(res.data)
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Erro ao carregar relatório financeiro.')
    } finally {
      setLoading(false)
    }
  }

  function handlePeriodChange(newPeriod: PeriodType) {
    setPeriod(newPeriod)

    if (newPeriod === 'custom') {
      return
    }

    const range = getRangeByPeriod(newPeriod)

    setStartDate(range.startDate)
    setEndDate(range.endDate)

    fetchFinancialDashboard({
      startDate: range.startDate,
      endDate: range.endDate
    })
  }

  function handleFilter() {
    fetchFinancialDashboard()
  }

  const panelStyle = {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    color: 'var(--text-h)'
  }

  const inputControlStyle = {
    padding: '0.5rem 0.8rem',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit'
  }

  const cardStyle = {
    padding: 20,
    backgroundColor: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    minHeight: 110
  }

  const tableHeaderStyle = {
    padding: 12,
    textAlign: 'left' as const,
    borderBottom: '2px solid var(--border)',
    fontWeight: 500,
    fontSize: '0.9rem'
  }

  const tableCellStyle = {
    padding: 12,
    borderBottom: '1px solid var(--border)',
    fontSize: '0.9rem'
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: '0 auto',
        color: 'var(--text-h)',
        marginBottom: 60
      }}
    >
      <h1 style={{ fontWeight: 500, marginBottom: 30, textAlign: 'center' }}>
        📊 Relatório Financeiro
      </h1>

      <div
        style={{
          ...panelStyle,
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <h3
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: '1.1rem',
            textAlign: 'center'
          }}
        >
          Filtros
        </h3>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            flexWrap: 'wrap'
          }}
        >
          {[
            { value: 'today', label: 'Hoje' },
            { value: 'weekly', label: 'Semanal' },
            { value: 'monthly', label: 'Mensal' },
            { value: 'yearly', label: 'Anual' },
            { value: 'custom', label: 'Customizado' }
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: '0.9rem',
                userSelect: 'none'
              }}
            >
              <input
                type="radio"
                value={item.value}
                checked={period === item.value}
                onChange={() => handlePeriodChange(item.value as PeriodType)}
                style={{
                  accentColor: 'var(--accent)',
                  width: 16,
                  height: 16,
                  margin: 0,
                  cursor: 'pointer'
                }}
              />

              {item.label}
            </label>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'end',
            gap: 14
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Data inicial
            </label>

            <input
              type="date"
              value={startDate}
              disabled={period !== 'custom'}
              style={{
                ...inputControlStyle,
                opacity: period !== 'custom' ? 0.7 : 1
              }}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Data final
            </label>

            <input
              type="date"
              value={endDate}
              disabled={period !== 'custom'}
              style={{
                ...inputControlStyle,
                opacity: period !== 'custom' ? 0.7 : 1
              }}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Cliente
            </label>

            <select
              value={selectedClient}
              style={{ ...inputControlStyle, minWidth: 220, cursor: 'pointer' }}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Todos</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFilter}
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              padding: '0.55rem 1.4rem',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              opacity: isHovered ? 0.85 : 1
            }}
          >
            {loading ? 'Carregando...' : 'Filtrar'}
          </button>
        </div>
      </div>

      {data && (
        <>
          <div
            style={{
              ...panelStyle,
              fontSize: '0.9rem',
              opacity: 0.85
            }}
          >
            Período analisado:{' '}
            <strong>
              {formatDateBR(data.startDate)} até {formatDateBR(data.endDate)}
            </strong>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 15,
              marginBottom: 30
            }}
          >
            <div style={{ ...cardStyle, borderLeft: '4px solid #2e7d32' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Receita recebida
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {formatCurrency(data.received_revenue)}
              </h2>
              <small style={{ opacity: 0.7 }}>
                Concluído + pago
              </small>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #f9a825' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Receita pendente
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {formatCurrency(data.pending_revenue)}
              </h2>
              <small style={{ opacity: 0.7 }}>
                Concluído + não pago
              </small>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #1565c0' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Receita prevista
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {formatCurrency(data.forecast_revenue)}
              </h2>
              <small style={{ opacity: 0.7 }}>
                Agendamentos ainda não concluídos
              </small>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #e65100' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ticket médio recebido
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {formatCurrency(data.average_ticket)}
              </h2>
              <small style={{ opacity: 0.7 }}>
                Apenas pagamentos recebidos
              </small>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #6a1b9a' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Atendimentos concluídos
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {data.completed_count}
              </h2>
              <small style={{ opacity: 0.7 }}>
                {data.completed_paid_count} pagos / {data.completed_pending_count} pendentes
              </small>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #00838f' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agendados
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {data.scheduled_count}
              </h2>
              <small style={{ opacity: 0.7 }}>
                Ainda não concluídos
              </small>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #c2185b' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cancelamentos
              </p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
                {data.cancelled_count}
              </h2>
              <small style={{ opacity: 0.7 }}>
                Não entram no faturamento
              </small>
            </div>
          </div>

          {data.payment_methods && data.payment_methods.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>
                💳 Recebimento por forma de pagamento
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Forma de pagamento</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                      Atendimentos
                    </th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                      Total recebido
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.payment_methods.map((payment) => (
                    <tr key={payment.method}>
                      <td style={tableCellStyle}>
                        {formatPaymentMethod(payment.method)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {payment.appointments}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        {formatCurrency(payment.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.top_services && data.top_services.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>
                🏆 Serviços mais realizados
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Serviço</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                      Quantidade
                    </th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                      Receita realizada
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.top_services.map((service) => (
                    <tr key={service.id}>
                      <td style={tableCellStyle}>{service.name}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {service.quantity}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        {formatCurrency(service.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.top_clients && data.top_clients.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>
                👥 Clientes mais frequentes
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Cliente</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                      Atendimentos concluídos
                    </th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                      Receita recebida
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.top_clients.map((client, index) => (
                    <tr key={client.client_id || `${client.name}-${index}`}>
                      <td style={tableCellStyle}>{client.name}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {client.appointments}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        {formatCurrency(client.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.by_day && data.by_day.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>
                📈 Resumo por dia
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Data</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Recebido</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Pendente</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Previsto</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Concluídos</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Agendados</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Cancelados</th>
                  </tr>
                </thead>

                <tbody>
                  {data.by_day.map((day) => (
                    <tr key={day.date}>
                      <td style={tableCellStyle}>{formatDateBR(day.date)}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        {formatCurrency(day.received_revenue)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {formatCurrency(day.pending_revenue)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {formatCurrency(day.forecast_revenue)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {day.completed}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {day.scheduled}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        {day.cancelled}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.payment_methods.length === 0 &&
            data.top_services.length === 0 &&
            data.top_clients.length === 0 &&
            data.by_day.length === 0 && (
              <div style={panelStyle}>
                <p style={{ textAlign: 'center', opacity: 0.7, margin: 0 }}>
                  Nenhum dado financeiro encontrado para o período selecionado.
                </p>
              </div>
            )}
        </>
      )}
    </div>
  )
}