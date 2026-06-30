import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      const res = await api.post('/api/auth/login', {
        email,
        password
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      if (res.data.user.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/agendamento')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="form-container">
      <h2 className="text-center" style={{ marginBottom: '0.5rem', color: 'var(--accent)', fontSize: '2.25rem' }}>SANDRA-NAILS</h2>
      <h1 className="text-center mb-4">Autenticação</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <button className="btn" onClick={handleLogin}>Entrar</button>

      <p className="text-center mt-4">
        Não tem conta?{' '}
        <span className="text-link" onClick={() => navigate('/register')}>
          Criar conta
        </span>
      </p>
    </div>
  )
}