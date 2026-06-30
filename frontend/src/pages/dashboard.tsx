import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'

interface DashboardData {
  period: string
  startDate: string
  endDate: string
  total_revenue: number
  total_appointments: number
  cancelled_count: number
  average_ticket: number
  by_day: any[]
  by_client: any[]
  top_services: any[]
  appointments?: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
    status: string
    total_price: number
    services: Array<{ name: string; price: number }>
  }>
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPeriod = searchParams.get('period') || 'monthly'
  const initialStartDate = searchParams.get('startDate') || ''
  const initialEndDate = searchParams.get('endDate') || ''
  const initialClientId = searchParams.get('client_id') || ''

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState(initialPeriod) // weekly, monthly, yearly, custom
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [selectedClient, setSelectedClient] = useState(initialClientId)
  const [allClients, setAllClients] = useState<Array<{ id: string | null; name: string }>>([])

  // Estado auxiliar para gerenciar os efeitos visuais de hover nos botões
  const [isHovered, setIsHovered] = useState(false)

  const applyQueryParams = (params: { period: string; startDate?: string; endDate?: string; selectedClient?: string }) => {
    const next = new URLSearchParams()
    next.set('period', params.period)

    if (params.period === 'custom') {
      if (params.startDate) next.set('startDate', params.startDate)
      if (params.endDate) next.set('endDate', params.endDate)
      if (params.selectedClient) next.set('client_id', params.selectedClient)
    }

    setSearchParams(next, { replace: true })
  }

  async function fetchDashboard(overrides: { period?: string; startDate?: string; endDate?: string; selectedClient?: string } = {}) {
    try {
      setLoading(true)

      const currentPeriod = overrides.period ?? period
      const currentStart = overrides.startDate ?? startDate
      const currentEnd = overrides.endDate ?? endDate
      const currentClient = overrides.selectedClient ?? selectedClient

      let url = `/api/dashboard/${currentPeriod}`

      if (currentPeriod === 'custom' && currentStart && currentEnd) {
        url = `/api/dashboard/filter?startDate=${currentStart}&endDate=${currentEnd}`
        if (currentClient) url += `&client_id=${currentClient}`
      }

      const res = await api.get(url)
      setData(res.data)

      if (res.data.by_client) {
        const clients = res.data.by_client.map((c: any) => ({ id: c.client_id || null, name: c.client }))
        setAllClients(clients)
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (period !== 'custom') {
      fetchDashboard()
    } else if (startDate && endDate) {
      fetchDashboard()
    }
  }, [period])

  const handleFilter = () => {
    if (period === 'custom' && startDate && endDate) {
      applyQueryParams({ period, startDate, endDate, selectedClient })
      fetchDashboard()
    } else {
      alert('Selecione período e datas')
    }
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
    padding: '0.4rem 0.8rem',
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
    justifyContent: 'center'
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
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', color: 'var(--text-h)', marginBottom: 60 }}>
      <h1 style={{ fontWeight: 500, marginBottom: 30, textAlign: 'center' }}>📊 Dashboard - Relatório Financeiro</h1>

      {/* Seção de Filtros */}
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ margin: '0 0 20px 0', fontWeight: 500, fontSize: '1.1rem', width: '100%', textAlign: 'center' }}>Filtros</h3>

        <div style={{ 
          marginBottom: 15, 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '20px', 
          width: '100%' 
        }}>
          {['weekly', 'monthly', 'yearly', 'custom'].map((p) => (
            <label 
              key={p} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                cursor: 'pointer', 
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}
            >
              <input
                type="radio"
                value={p}
                checked={period === p}
                style={{ 
                  accentColor: 'var(--accent)', 
                  width: 16, 
                  height: 16, 
                  margin: 0, 
                  cursor: 'pointer' 
                }}
                onChange={() => {
                  setPeriod(p)
                  applyQueryParams({ period: p })
                }}
              />
              {p === 'weekly' && 'Semanal'}
              {p === 'monthly' && 'Mensal'}
              {p === 'yearly' && 'Anual'}
              {p === 'custom' && 'Período customizado'}
            </label>
          ))}
        </div>

        {/* Bloco de Filtros Customizados Centralizado */}
        {period === 'custom' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12, 
            width: '100%',
            maxWidth: 400, 
            margin: '20px auto 0 auto',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <span style={{ minWidth: 65, fontSize: '0.9rem', textAlign: 'right' }}>De:</span>
              <input
                type="date"
                value={startDate}
                style={{ ...inputControlStyle, flex: 1 }}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <span style={{ minWidth: 65, fontSize: '0.9rem', textAlign: 'right' }}>Até:</span>
              <input
                type="date"
                value={endDate}
                style={{ ...inputControlStyle, flex: 1 }}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <span style={{ minWidth: 65, fontSize: '0.9rem', textAlign: 'right' }}>Cliente:</span>
              <select
                value={selectedClient}
                style={{ ...inputControlStyle, cursor: 'pointer', flex: 1 }}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">Todos</option>
                {allClients.map((client) => (
                  <option key={client.id ?? client.name} value={client.id ?? ''}>
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
                padding: '0.5rem 2.5rem',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'opacity 0.2s',
                opacity: isHovered ? 0.85 : 1,
                marginTop: 10,
                width: 'auto'
              }}
            >
              {loading ? 'Carregando...' : 'Filtrar'}
            </button>
          </div>
        )}
      </div>

      {/* Cards Principais e Métricas */}
      {data && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 15,
            marginBottom: 30
          }}>
            <div style={{ ...cardStyle, borderLeft: '4px solid #2e7d32' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receita Total</p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600, color: 'var(--text-h)' }}>
                R$ {data.total_revenue.toFixed(2)}
              </h2>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #1565c0' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Atendimentos</p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600, color: 'var(--text-h)' }}>
                {data.total_appointments}
              </h2>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #e65100' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Médio</p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600, color: 'var(--text-h)' }}>
                R$ {data.average_ticket.toFixed(2)}
              </h2>
            </div>

            <div style={{ ...cardStyle, borderLeft: '4px solid #c2185b' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelamentos</p>
              <h2 style={{ margin: '8px 0 0 0', fontWeight: 600, color: 'var(--text-h)' }}>
                {data.cancelled_count}
              </h2>
            </div>
          </div>

          {/* Tabela de Receita por Cliente */}
          {data.by_client && data.by_client.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>💰 Receita por Cliente</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Cliente</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Receita</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Atendimentos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_client.map((client: any, idx: number) => (
                    <tr key={idx}>
                      <td style={tableCellStyle}>{client.client}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        R$ {client.revenue.toFixed(2)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', opacity: 0.8 }}>
                        {client.appointments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Serviços Mais Vendidos */}
          {data.top_services && data.top_services.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>🏆 Serviços Mais Vendidos</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Serviço</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Quantidade</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_services.map((service: any, idx: number) => (
                    <tr key={idx}>
                      <td style={tableCellStyle}>{service.name}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', opacity: 0.8 }}>{service.quantity}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        R$ {parseFloat(service.revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receita por Dia */}
          {data.by_day && data.by_day.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>📈 Receita por Dia</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Data</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Receita</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Atendimentos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_day.map((day: any, idx: number) => (
                    <tr key={idx}>
                      <td style={tableCellStyle}>
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        R$ {day.revenue.toFixed(2)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', opacity: 0.8 }}>{day.appointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lista Detalhada de Agendamentos (Filtro Customizado por Cliente) */}
          {period === 'custom' && selectedClient && data.appointments && data.appointments.length > 0 && (
            <div style={panelStyle}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>📋 Agendamentos do Cliente</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Data</th>
                    <th style={tableHeaderStyle}>Horário</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Total</th>
                    <th style={tableHeaderStyle}>Serviços</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td style={tableCellStyle}>{new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td style={tableCellStyle}>{appt.start_time} - {appt.end_time}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                          backgroundColor: appt.status === 'confirmed' || appt.status === 'completed' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(198, 40, 40, 0.15)',
                          color: appt.status === 'confirmed' || appt.status === 'completed' ? '#2e7d32' : '#c62828'
                        }}>
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 500 }}>
                        R$ {parseFloat(String(appt.total_price)).toFixed(2)}
                      </td>
                      <td style={tableCellStyle}>
                        {appt.services.map((service, idx) => (
                          <div key={idx} style={{ marginBottom: 4, fontSize: '0.85rem', opacity: 0.9 }}>
                            • {service.name} (R$ {parseFloat(String(service.price)).toFixed(2)})
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}