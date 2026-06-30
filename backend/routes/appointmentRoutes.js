// Rotas de agendamento: horários disponíveis, criação, atualização e cancelamento.
    const { Router } = require('express');
    const AppointmentController = require('../controllers/AppointmentController');
    const { authenticate, adminOnly } = require('../middlewares/authMiddleware');
    const { clientCanOnlyCreateOwn } = require('../middlewares/authorizationMiddleware');
    const { createAppointment, updateAppointment } = require('../middlewares/validators');

    const router = Router();

    // ── Rotas específicas (sem :id) devem vir ANTES das rotas parametrizadas ──
    
    // Cliente/Public: visualiza horários disponíveis (sem autenticação obrigatória)
    router.get('/available', AppointmentController.available);
    
    // Admin: bloqueia horários
    router.post('/block', authenticate, adminOnly, AppointmentController.block);

    // ── Rotas genéricas ──────────────────────────────────────────────────────
    
    // Admin: vê TODOS os agendamentos | Cliente: vê apenas seus próprios
    router.get('/', authenticate, AppointmentController.index);
    
    // Cliente: cria agendamento para si mesmo | Admin: cria para qualquer cliente
    router.post('/', authenticate, createAppointment, clientCanOnlyCreateOwn, AppointmentController.create);

    // ── Rotas parametrizadas (com :id) - TODAS devem vir por último ──────────
    
    // Dono/Admin: visualiza agendamento (validação no controller)
    router.get('/:id', authenticate, AppointmentController.show);
    
    // Admin: atualiza agendamento
    router.put('/:id', authenticate, adminOnly, updateAppointment, AppointmentController.update);
    
    // Dono/Admin: cancela agendamento (validação no controller)
    router.patch('/:id/cancel', authenticate, AppointmentController.cancel);
    
    // Admin: deleta agendamento
    router.delete('/:id', authenticate, adminOnly, AppointmentController.destroy);

    module.exports = router;