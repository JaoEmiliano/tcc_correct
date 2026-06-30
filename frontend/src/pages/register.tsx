import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')

  const handleRegister = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

      if (!phone.trim()) {
        setError('Por favor, informe seu telefone')
        return
      }

      if (!phone.replace(/\D/g, '').match(/^\d{10,11}$/)) {
        setError('Telefone inválido. Informe um número com DDD (10 ou 11 dígitos).')
        return
      }

    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        phone,
        password,
      }) 

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      setSuccess('Usuário cadastrado com sucesso!')
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')

      setTimeout(() => navigate('/'), 1000)
    } catch (error: any) {
      const message =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.message ||
        'Erro ao cadastrar'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function formatPhone(value: string): string {
    const cleaned = value.replace(/\D/g, '').slice(0, 11) // remove caracteres não numéricos e limita a 11 dígitos

    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
    } else {
      return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
    }
  }

  return (
    <div className="form-container">
      <h1 className="text-center mb-4">Cadastro</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group">
        <input
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          placeholder="Telefone"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button className="btn" onClick={handleRegister} disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      <p className="text-center mt-4">
        Já tem conta?{' '}
        <span className="text-link" onClick={() => navigate('/')}>
          Fazer login
        </span>
      </p>
    </div>
  )
}