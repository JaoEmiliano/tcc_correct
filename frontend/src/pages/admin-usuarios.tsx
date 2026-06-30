import { useEffect, useState } from 'react'
import api from '../services/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role?: string
  active?: boolean
}

interface NewUser {
  name: string
  email: string
  phone: string
  password: string
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [search, setSearch] = useState('')

  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      setError('')

      const res = await api.get('/api/users')
      setUsers(res.data.users || [])
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  function resetNewUserForm() {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      password: ''
    })
  }

  function handleOpenCreateForm() {
    setError('')
    setMessage('')
    setEditingUser(null)
    setShowCreateForm(true)
  }

  function handleCancelCreate() {
    setShowCreateForm(false)
    resetNewUserForm()
  }

  function handleOpenEdit(user: User) {
    setError('')
    setMessage('')
    setShowCreateForm(false)
    setEditingUser(user)
  }

  function handleCancelEdit() {
    setEditingUser(null)
  }

  async function handleCreate() {
    setError('')
    setMessage('')

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setError('Nome, e-mail e senha são obrigatórios.')
      return
    }

    try {
      setLoading(true)

      await api.post('/api/users', {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        phone: newUser.phone.trim(),
        password: newUser.password
      })

      setMessage('Cliente cadastrado com sucesso.')
      setShowCreateForm(false)
      resetNewUserForm()

      await fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao cadastrar cliente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    if (!editingUser) return

    setError('')
    setMessage('')

    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      setError('Nome e e-mail são obrigatórios.')
      return
    }

    try {
      setLoading(true)

      await api.patch(`/api/users/${editingUser.id}`, {
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone?.trim() || '',
        active: editingUser.active
      })

      setMessage('Usuário atualizado com sucesso.')
      setEditingUser(null)

      await fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao atualizar usuário.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(user: User) {
    if (user.role === 'admin') {
      alert('Não é recomendado excluir usuário administrador.')
      return
    }

    if (!window.confirm(`Deseja realmente excluir o usuário "${user.name}"?`)) {
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      await api.delete(`/api/users/${user.id}`)

      setMessage('Usuário excluído com sucesso.')

      if (editingUser?.id === user.id) {
        setEditingUser(null)
      }

      await fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao excluir usuário.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase().trim()

    if (!searchTerm) {
      return true
    }

    const cleanSearchDigits = search.replace(/\D/g, '')
    const cleanUserPhoneDigits = (user.phone || '').replace(/\D/g, '')

    const matchesName = user.name.toLowerCase().includes(searchTerm)
    const matchesEmail = user.email.toLowerCase().includes(searchTerm)

    const matchesPhone =
      (user.phone || '').toLowerCase().includes(searchTerm) ||
      (cleanSearchDigits !== '' && cleanUserPhoneDigits.includes(cleanSearchDigits))

    return matchesName || matchesEmail || matchesPhone
  })

  function formatRole(role?: string) {
    if (role === 'admin') return 'Administrador'
    return 'Cliente'
  }

  const containerPanelStyle = {
    padding: 20,
    backgroundColor: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    color: 'var(--text-h)',
    marginBottom: 30
  }

  const inputStyle = {
    width: '100%',
    marginBottom: 15,
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    fontSize: '0.9rem',
    boxSizing: 'border-box' as const,
    outline: 'none'
  }

  const buttonBase = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'opacity 0.2s'
  }

  const getPrimaryStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: 'var(--accent)',
    color: '#fff',
    opacity: hoveredButtonId === id ? 0.85 : 1
  })

  const getCancelStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: 'var(--border)',
    color: 'var(--text-h)',
    opacity: hoveredButtonId === id ? 0.8 : 1
  })

  const getDeleteStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: '#d32f2f',
    color: '#fff',
    opacity: hoveredButtonId === id ? 0.85 : 1
  })

  const getSecondaryStyle = (id: string) => ({
    ...buttonBase,
    backgroundColor: 'transparent',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    opacity: hoveredButtonId === id ? 0.75 : 1
  })

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: '0 auto',
        color: 'var(--text-h)',
        marginBottom: 80
      }}
    >
      <h1 style={{ textAlign: 'center', fontWeight: 500, marginBottom: 30 }}>
        👥 Administração de Usuários
      </h1>

      {error && (
        <p style={{ color: '#d32f2f', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      {message && (
        <p style={{ color: '#2e7d32', textAlign: 'center', fontSize: '0.9rem' }}>
          {message}
        </p>
      )}

      <div
        style={{
          ...containerPanelStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 15,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h2 style={{ fontWeight: 500, margin: 0 }}>Clientes e usuários</h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
            Cadastre clientes, edite dados e gerencie contas ativas.
          </p>
        </div>

        <button
          onClick={handleOpenCreateForm}
          disabled={loading}
          style={getPrimaryStyle('btn-open-create')}
          onMouseEnter={() => setHoveredButtonId('btn-open-create')}
          onMouseLeave={() => setHoveredButtonId(null)}
        >
          + Novo cliente
        </button>
      </div>

      {showCreateForm && (
        <div style={containerPanelStyle}>
          <h2 style={{ fontWeight: 500, marginBottom: 20 }}>Cadastrar novo cliente</h2>

          <input
            placeholder="Nome"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="E-mail"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="Telefone"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="Senha inicial"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            style={inputStyle}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={getPrimaryStyle('btn-create')}
              onMouseEnter={() => setHoveredButtonId('btn-create')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar cliente'}
            </button>

            <button
              onClick={handleCancelCreate}
              disabled={loading}
              style={getCancelStyle('btn-cancel-create')}
              onMouseEnter={() => setHoveredButtonId('btn-cancel-create')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              Cancelar cadastro
            </button>
          </div>
        </div>
      )}

      {editingUser && (
        <div style={containerPanelStyle}>
          <h2 style={{ fontWeight: 500, marginBottom: 20 }}>Editar usuário</h2>

          <input
            placeholder="Nome"
            value={editingUser.name}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="E-mail"
            value={editingUser.email}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="Telefone"
            value={editingUser.phone || ''}
            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
            style={inputStyle}
          />

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={!!editingUser.active}
              onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
              style={{
                width: 16,
                height: 16,
                cursor: 'pointer',
                accentColor: 'var(--accent)'
              }}
            />
            Conta ativa
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleUpdate}
              disabled={loading}
              style={getPrimaryStyle('btn-save')}
              onMouseEnter={() => setHoveredButtonId('btn-save')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>

            <button
              onClick={handleCancelEdit}
              disabled={loading}
              style={getCancelStyle('btn-cancel-edit')}
              onMouseEnter={() => setHoveredButtonId('btn-cancel-edit')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              Cancelar edição
            </button>
          </div>
        </div>
      )}

      <div style={containerPanelStyle}>
        <h2 style={{ fontWeight: 500, marginBottom: 20 }}>Usuários cadastrados</h2>

        <input
          type="text"
          placeholder="🔍 Pesquisar por nome, e-mail ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        {loading && (
          <p style={{ textAlign: 'center', opacity: 0.6 }}>Carregando...</p>
        )}

        {!loading && filteredUsers.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.6, fontStyle: 'italic' }}>
            Nenhum usuário encontrado.
          </p>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>
                    Nome
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>
                    E-mail
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>
                    Telefone
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>
                    Perfil
                  </th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 500 }}>
                    Ativo
                  </th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 500 }}>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12 }}>{user.name}</td>
                    <td style={{ padding: 12 }}>{user.email}</td>
                    <td style={{ padding: 12 }}>{user.phone || '—'}</td>

                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor:
                            user.role === 'admin'
                              ? 'rgba(106, 27, 154, 0.18)'
                              : 'rgba(21, 101, 192, 0.18)',
                          color: user.role === 'admin' ? '#ab47bc' : '#42a5f5'
                        }}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>

                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 'bold',
                          backgroundColor: user.active ? '#c8e6c9' : '#ffcdd2',
                          color: user.active ? '#2e7d32' : '#c62828'
                        }}
                      >
                        {user.active ? 'Sim' : 'Não'}
                      </span>
                    </td>

                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 10,
                          flexWrap: 'wrap'
                        }}
                      >
                        <button
                          onClick={() => handleOpenEdit(user)}
                          style={{
                            ...getSecondaryStyle(`edit-${user.id}`),
                            padding: '0.4rem 0.8rem'
                          }}
                          onMouseEnter={() => setHoveredButtonId(`edit-${user.id}`)}
                          onMouseLeave={() => setHoveredButtonId(null)}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          disabled={loading || user.role === 'admin'}
                          style={{
                            ...getDeleteStyle(`del-${user.id}`),
                            padding: '0.4rem 0.8rem',
                            cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                            opacity:
                              user.role === 'admin'
                                ? 0.45
                                : hoveredButtonId === `del-${user.id}`
                                  ? 0.85
                                  : 1
                          }}
                          onMouseEnter={() => setHoveredButtonId(`del-${user.id}`)}
                          onMouseLeave={() => setHoveredButtonId(null)}
                          title={user.role === 'admin' ? 'Administrador não deve ser excluído' : 'Excluir usuário'}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}