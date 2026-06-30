// Rotas do dashboard administrativo, incluindo horários de funcionamento e métricas.
const { Router } = require('express');
const DashboardController = require('../controllers/DashboardController');
const { authenticate, adminOnly } = require('../middlewares/authMiddleware');

const router = Router();

// ── Todas as rotas de dashboard exigem admin ─────────────────────
router.use(authenticate, adminOnly);

// Admin: visualiza dados da semana
router.get('/weekly',  DashboardController.weekly);

// Admin: visualiza dados do mês
router.get('/monthly', DashboardController.monthly);

// Admin: visualiza dados do ano
router.get('/yearly',  DashboardController.yearly);

// Admin: filtra por período e cliente
router.get('/filter',  DashboardController.filterByDateAndClient);

// Admin: visualiza horários de funcionamento
router.get('/business-hours', DashboardController.getBusinessHours);

// Admin: atualiza horários de funcionamento
router.patch('/business-hours', DashboardController.updateBusinessHours);

module.exports = router;