// Rotas de agendamento: horários disponíveis, criação, atualização e cancelamento.
const { Router } = require('express');
const AppointmentController = require('../controllers/AppointmentController');
const { authenticate, adminOnly } = require('../middlewares/authMiddleware');
const { clientCanOnlyCreateOwn } = require('../middlewares/authorizationMiddleware');
const { createAppointment, updateAppointment } = require('../middlewares/validators');

const router = Router();

// ── Rotas específicas sem :id ───────────────────────────────────────────────

// Cliente/Public: visualiza horários disponíveis
router.get('/available', AppointmentController.available);

// Admin: bloqueia horários
router.post('/block', authenticate, adminOnly, AppointmentController.block);

// ── Rotas genéricas ─────────────────────────────────────────────────────────

// Admin: vê todos os agendamentos | Cliente: vê apenas seus próprios
router.get('/', authenticate, AppointmentController.index);

// Cliente cria para si mesmo | Admin cria para qualquer cliente
router.post(
  '/',
  authenticate,
  createAppointment,
  clientCanOnlyCreateOwn,
  AppointmentController.create
);

// ── Rotas parametrizadas ────────────────────────────────────────────────────

// Dono/Admin: visualiza agendamento
router.get('/:id', authenticate, AppointmentController.show);

// Admin: atualiza somente pagamento do agendamento
router.patch(
  '/:id/payment',
  authenticate,
  adminOnly,
  AppointmentController.updatePayment
);

// Dono/Admin: cancela agendamento
router.patch('/:id/cancel', authenticate, AppointmentController.cancel);

// Admin: atualiza agendamento completo
router.put(
  '/:id',
  authenticate,
  adminOnly,
  updateAppointment,
  AppointmentController.update
);

// Admin: deleta agendamento
router.delete('/:id', authenticate, adminOnly, AppointmentController.destroy);

module.exports = router;