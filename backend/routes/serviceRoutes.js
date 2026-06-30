// Rotas de serviços: listagem pública e operações administrativas.
const { Router } = require('express');
const ServiceController = require('../controllers/ServiceController');
const { authenticate, adminOnly, optionalAuth } = require('../middlewares/authMiddleware');
const { createService, updateService } = require('../middlewares/validators');

const router = Router();

// ── Públicas/Clientes: lista e visualiza serviços ──────────────
router.get('/',     optionalAuth,                                 ServiceController.index);
router.get('/:id',  optionalAuth,                                 ServiceController.show);

// ── Admin: cria, edita e deleta serviços ─────────────────────
router.post('/',    authenticate, adminOnly, createService,      ServiceController.create);
router.put('/:id',  authenticate, adminOnly, updateService,      ServiceController.update);
router.delete('/:id', authenticate, adminOnly,                    ServiceController.destroy);

module.exports = router;