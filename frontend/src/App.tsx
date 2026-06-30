import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar.jsx'
import Login from './pages/login'
import Register from './pages/register'
import Agendamento from './pages/agendamento'
import Horarios from './pages/horarios'
import Confirmacao from './pages/confirmacao'
import MeusAgendamentos from './pages/meusAgendamentos'
import Dashboard from './pages/dashboard'
import AdminHorarios from './pages/admin-horarios'
import AdminUsuarios from './pages/admin-usuarios'
import AdminServicos from './pages/admin-servicos'

// Função que protege rotas e exige autenticação.
function PrivateRoute({ children }: any) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

// Função que protege rotas por perfil de usuário (admin/client).
function RoleRoute({ children, roles }: any) {
  const token = localStorage.getItem('token')
  let user: { role?: string } = {}

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    user = {}
  }

  if (!token) return <Navigate to="/" />

  if (!roles.includes(user.role)) {
    return <Navigate to="/agendamento" />
  }

  return children
}

//Função que monta todas as rotas do aplicativo usando BrowserRouter.
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route path="/agendamento" element={<PrivateRoute><Agendamento /></PrivateRoute>} />

        <Route path="/horarios/:serviceId" element={<PrivateRoute><Horarios /></PrivateRoute>} />

        <Route path="/confirmacao" element={<PrivateRoute><Confirmacao /></PrivateRoute>} />

        <Route path="/meus-agendamentos" element={<PrivateRoute><MeusAgendamentos /></PrivateRoute>} />

        <Route path="/dashboard" element={<RoleRoute roles={['admin']}><Dashboard /></RoleRoute>} />

        {/* Rota administrativa para gerenciar usuários cadastrados */}
        <Route path="/admin-usuarios" element={<RoleRoute roles={['admin']}><AdminUsuarios /></RoleRoute>} />

        <Route path="/admin-horarios" element={<RoleRoute roles={['admin']}><AdminHorarios /></RoleRoute>} />

        <Route path="/admin-servicos" element={<RoleRoute roles={['admin']}><AdminServicos /></RoleRoute>} />

      </Routes>
    </BrowserRouter>
  )
}