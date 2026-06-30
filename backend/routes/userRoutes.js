// Rotas de usuário: CRUD para usuários e perfil.
const { Router } = require('express');
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/authMiddleware');
const { adminOnly, ownerOrAdmin } = require('../middlewares/authorizationMiddleware');
const { updateUser } = require('../middlewares/validators');

const router = Router();

router.use(authenticate);

// ── Admin: lista todos usuários ──────────────────────────────
router.get('/',       adminOnly,                       UserController.index);

// ──Admin: visualiza perfil ──────────────────────────
router.get('/:id',    adminOnly,                       UserController.show);

// ──Admin: atualiza perfil ──────────────────────────
router.patch('/:id',  adminOnly,                       UserController.update);

// ──Admin: deleta usuário ───────────────────────────────────
router.delete('/:id', adminOnly,                       UserController.destroy);

router.post('/', adminOnly, UserController.create)
module.exports = router;