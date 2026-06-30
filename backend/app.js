require('dotenv').config();
const express = require('express');
const cors = require('cors');
 
const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const serviceRoutes     = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');
const errorHandler      = require('./middlewares/errorMiddleware');
 
const app = express();
 
// ── Middlewares globais ───────────────────────────────────────────
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// ── Rotas ─────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/services',     serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard',    dashboardRoutes);
 
// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));
 
// ── Rota não encontrada ───────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
 
// ── Tratamento de erros (deve ser o último middleware) ────────────
app.use(errorHandler);
 
// ── Inicializar servidor ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Servidor rodando em http://localhost:${PORT}`);
});
 
module.exports = app;
 