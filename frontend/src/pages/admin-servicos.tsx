import { useEffect, useState } from 'react'
import api from '../services/api'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

export default function AdminServicos() {
  const [services, setServices] = useState<Service[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: ''
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function loadServices() {
    try {
      const response = await api.get('/api/services')
      setServices(response.data.services)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar serviços')
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  async function handleCreate() {
    try {
      setError('')
      setMessage('')

      await api.post('/api/services', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes)
      })

      setMessage('Serviço criado com sucesso')

      setForm({
        name: '',
        description: '',
        price: '',
        duration_minutes: ''
      })

      loadServices()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao criar serviço')
    }
  }

  async function handleUpdate() {
    if (!editingService) return

    try {
      await api.put(`/api/services/${editingService.id}`, editingService)

      setMessage('Serviço atualizado com sucesso')
      setEditingService(null)

      loadServices()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao atualizar serviço')
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      'Deseja realmente excluir este serviço?'
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/api/services/${id}`)

      setMessage('Serviço excluído com sucesso')

      loadServices()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao excluir serviço')
    }
  }
  
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'opacity 0.2s',
  }

  const buttonBase = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'opacity 0.2s',
  }

  const primaryButtonStyle = {
    ...buttonBase,
    backgroundColor: 'var(--accent)',
    color: '#fff',
  }

  const cancelButtonStyle = {
    ...buttonBase,
    backgroundColor: 'var(--border)',
    color: 'var(--text-h)',
  }

  const deleteButtonStyle = {
    ...buttonBase,
    backgroundColor: '#d32f2f', // Mantido vermelho padrão para exclusão de segurança
    color: '#fff',
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-h)', marginBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 500 }}>Serviços</h1>

      {message && <p style={{ color: 'green', textAlign: 'center', fontSize: '0.9rem' }}>{message}</p>}
      {error && <p style={{ color: '#d32f2f', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

      {/* Bloco Superior: Formulários */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        {!editingService && (
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: '0 0 5px 0', textAlign: 'center', fontWeight: 500 }}>Novo Serviço</h2>

            <input
              placeholder="Nome"
              value={form.name}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Descrição"
              value={form.description}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <input
              type="number"
              placeholder="Preço"
              value={form.price}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              type="number"
              placeholder="Duração (em minutos)"
              value={form.duration_minutes}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
            />

            <button onClick={handleCreate} style={primaryButtonStyle}>
              Criar Serviço
            </button>
          </div>
        )}

        {editingService && (
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: '0 0 5px 0', textAlign: 'center', fontWeight: 500 }}>Editar Serviço</h2>

            <input
              value={editingService.name}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
            />

            <input
              value={editingService.description}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
            />

            <input
              type="number"
              value={editingService.price}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
            />

            <input
              type="number"
              value={editingService.duration_minutes}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleUpdate} style={{ ...primaryButtonStyle, flex: 1 }}>
                Salvar
              </button>
              <button onClick={() => setEditingService(null)} style={{ ...cancelButtonStyle, flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />

      {/* Bloco Inferior: Listagem e Pesquisa */}
      <h2 style={{ textAlign: 'center', marginTop: 30, marginBottom: 15, fontWeight: 500 }}>Serviços cadastrados</h2>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 25 }}>
        <input
          type="text"
          placeholder="🔍 Pesquisar serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px' }}
        />
      </div>

      <table width="100%" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Nome</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Preço</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500 }}>Duração</th>
            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((service) => (
            <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px' }}>{service.name}</td>
              <td style={{ padding: '12px' }}>R$ {service.price.toFixed(2)}</td>
              <td style={{ padding: '12px' }}>{service.duration_minutes} min</td>

              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => setEditingService(service)} style={{ ...primaryButtonStyle, padding: '0.4rem 0.8rem' }}>
                  Editar
                </button>

                <button onClick={() => handleDelete(service.id)} style={{ ...deleteButtonStyle, marginLeft: 10, padding: '0.4rem 0.8rem' }}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}