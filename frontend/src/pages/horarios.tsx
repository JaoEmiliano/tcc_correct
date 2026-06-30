import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

interface Slot {
  time: string
  available: boolean
  blocked: boolean
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

export default function Horarios() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const selectedServices: Service[] = location.state?.selectedServices || []
  const isAdminBooking = location.state?.isAdminBooking

  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(true)

  useEffect(() => {
    if (!date || !serviceId) return

    api
      .get(`/api/appointments/available?date=${date}&service_ids=${serviceId}`)
      .then((res) => {
        setIsOpen(res.data.isOpen !== false)
        setSlots(res.data.slots || [])
      })
      .catch((err) => {
        console.error(err)
        setSlots([])
      })
  }, [date, serviceId])

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

  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + Number(service.price)
  }, 0)

  const totalDuration = selectedServices.reduce((sum, service) => {
    return sum + Number(service.duration_minutes)
  }, 0)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <h2>Escolha uma data</h2>

      {selectedServices.length > 0 && (
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg)',
            color: 'var(--text-h)'
          }}
        >
          <strong>Serviços selecionados:</strong>

          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            {selectedServices.map((service) => (
              <li key={service.id}>
                {service.name} — R$ {Number(service.price).toFixed(2)} —{' '}
                {durationServices(service.duration_minutes)}
              </li>
            ))}
          </ul>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <strong>Total:</strong> R$ {totalPrice.toFixed(2)}
            <br />
            <strong>Duração total:</strong> {durationServices(totalDuration)}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '400px', width: '100%' }}>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <h2>Horários disponíveis</h2>

      {!date ? (
        <p style={{ opacity: 0.6, fontStyle: 'italic' }}>
          Selecione uma data para ver os horários.
        </p>
      ) : !isOpen ? (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            border: '1px solid #d32f2f',
            maxWidth: '400px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <p
            style={{
              fontSize: '18px',
              margin: '0 0 5px 0',
              fontWeight: 'bold'
            }}
          >
            🚫 Sem expediente
          </p>

          <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>
            O estabelecimento não funciona neste dia.
          </p>
        </div>
      ) : slots.length === 0 ? (
        <p style={{ opacity: 0.6, fontStyle: 'italic' }}>
          Nenhum horário disponível para esta data.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '10px',
            maxWidth: '400px',
            width: '100%'
          }}
        >
          {slots.map((slot) => {
            let backgroundColor = '#fff'
            let borderColor = '#ddd'
            let textColor = '#000'

            if (!slot.available) {
              if (slot.blocked) {
                backgroundColor = '#ffebee'
                borderColor = '#d32f2f'
                textColor = '#c62828'
              } else {
                backgroundColor = '#f5f5f5'
                borderColor = '#ddd'
                textColor = '#999'
              }
            }

            return (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() =>
                  navigate('/confirmacao', {
                    state: {
                      selectedServices,
                      serviceIds: serviceId,
                      horario: slot.time,
                      date,
                      isAdminBooking
                    }
                  })
                }
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor,
                  color: textColor,
                  cursor: !slot.available ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: slot.blocked ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
                title={slot.blocked ? 'Horário de Intervalo' : undefined}
              >
                {slot.time}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}