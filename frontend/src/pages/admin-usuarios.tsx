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

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')  
  const [newUser, setNewUser] = useState({
  name: '',
  email: '',
  phone: '',
  password: ''})

  // Estado para capturar o ID do botão atualmente em hover
  const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null)

  async function fetchUsers() {
    try {
      setLoading(true)
      const res = await api.get('/api/users')
      setUsers(res.data.users || [])
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  async function handleCreate() {
  setError('')
  setMessage('')

  if (!newUser.name || !newUser.email || !newUser.password) {
    setError('Nome, e-mail e senha são obrigatórios.')
    return
  }

  try {
    setLoading(true)

    await api.post('/api/users', {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password
    })

    setMessage('Cliente cadastrado com sucesso.')

    setNewUser({
      name: '',
      email: '',
      phone: '',
      password: ''
    })

    fetchUsers()
  } catch (err: any) {
    console.error(err)
    setError(err.response?.data?.message || 'Erro ao cadastrar cliente')
  } finally {
    setLoading(false)
  }
}
  async function handleUpdate() {
    if (!editingUser) return

    setError('')
    setMessage('')

    if (!editingUser.name || !editingUser.email) {
      setError('Nome e e-mail são obrigatórios.')
      return
    }

    try {
      setLoading(true)
      await api.patch(`/api/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        active: editingUser.active,
      })

      setMessage('Usuário atualizado com sucesso.')
      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este usuário?')) return

    try {
      setLoading(true)
      await api.delete(`/api/users/${id}`)
      setMessage('Usuário excluído com sucesso.')
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao excluir usuário')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();
    
    // Remove tudo o que não for número para comparar telefones puramente por dígitos
    const cleanSearchDigits = search.replace(/\D/g, '');
    const cleanUserPhoneDigits = (user.phone || '').replace(/\D/g, '');

    const matchesName = user.name.toLowerCase().includes(searchTerm);
    const matchesEmail = user.email.toLowerCase().includes(searchTerm);
    
    // Valida o telefone original com o texto digitado
    const matchesPhone = 
      (user.phone || '').toLowerCase().includes(searchTerm) || 
      (cleanSearchDigits !== '' && cleanUserPhoneDigits.includes(cleanSearchDigits));

    return matchesName || matchesEmail || matchesPhone;
  });

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
    outline: 'none',
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

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', color: 'var(--text-h)', marginBottom: 80 }}>
      <h1 style={{ textAlign: 'center', fontWeight: 500, marginBottom: 30 }}>👥 Administração de Usuários</h1>

      {error && <p style={{ color: '#d32f2f', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
      {message && <p style={{ color: 'green', textAlign: 'center', fontSize: '0.9rem' }}>{message}</p>}

      {/* Bloco de Edição (Só aparece se houver usuário selecionado) */}
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
          
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={!!editingUser.active}
              onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }}
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
              onClick={() => setEditingUser(null)}
              disabled={loading}
              style={getCancelStyle('btn-cancel')}
              onMouseEnter={() => setHoveredButtonId('btn-cancel')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              Cancelar edição
            </button>
          </div>
        </div>
      )}
      {/* Bloco de Criação de Novo Usuário */}
      <div style={{ padding: 20, background: '#fff', borderRadius: 8, border: '1px solid #ddd', marginBottom: 30 }}>
  <h2>Cadastrar novo cliente</h2>

  <input
    placeholder="Nome"
    value={newUser.name}
    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
    style={{ width: '100%', marginBottom: 10, padding: 10 }}
  />

  <input
    placeholder="E-mail"
    type="email"
    value={newUser.email}
    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
    style={{ width: '100%', marginBottom: 10, padding: 10 }}
  />

  <input
    placeholder="Telefone"
    value={newUser.phone}
    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
    style={{ width: '100%', marginBottom: 10, padding: 10 }}
  />

  <input
    placeholder="Senha inicial"
    type="password"
    value={newUser.password}
    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
    style={{ width: '100%', marginBottom: 10, padding: 10 }}
  />

  <button
    onClick={handleCreate}
    disabled={loading}
    style={{
      width: '100%',
      padding: 12,
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: 4
    }}
  >
    {loading ? 'Cadastrando...' : 'Cadastrar cliente'}
  </button>
</div>

      {/* Bloco da Listagem Principal */}
      <div style={containerPanelStyle}>
        <h2 style={{ fontWeight: 500, marginBottom: 20 }}>Usuários cadastrados</h2>
        
        <input
          type="text"
          placeholder="🔍 Pesquisar por nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        {loading && <p style={{ textAlign: 'center', opacity: 0.6 }}>Carregando...</p>}
        {!loading && filteredUsers.length === 0 && <p style={{ textAlign: 'center', opacity: 0.6, fontStyle: 'italic' }}>Nenhum usuário encontrado.</p>}
        
        {!loading && filteredUsers.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>Nome</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>E-mail</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>Telefone</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 500 }}>Role</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 500 }}>Ativo</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>{user.name}</td>
                  <td style={{ padding: 12 }}>{user.email}</td>
                  <td style={{ padding: 12 }}>{user.phone || '—'}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{ textTransform: 'lowercase', opacity: 0.8 }}>
                      {user.role || 'client'}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 'bold',
                      backgroundColor: user.active ? '#c8e6c9' : '#ffcdd2',
                      color: user.active ? '#2e7d32' : '#c62828'
                    }}>
                      {user.active ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button 
                      onClick={() => setEditingUser(user)} 
                      style={{ ...getPrimaryStyle(`edit-${user.id}`), padding: '0.4rem 0.8rem', marginRight: 10 }}
                      onMouseEnter={() => setHoveredButtonId(`edit-${user.id}`)}
                      onMouseLeave={() => setHoveredButtonId(null)}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      style={{ ...getDeleteStyle(`del-${user.id}`), padding: '0.4rem 0.8rem' }}
                      onMouseEnter={() => setHoveredButtonId(`del-${user.id}`)}
                      onMouseLeave={() => setHoveredButtonId(null)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}