// Rotas de autenticação: registro, login e dados do usuário atual.
const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/authorizationMiddleware');
const { register, login } = require('../middlewares/validators');

const router = Router();

// ── Rotas públicas ───────────────────────────────────────────
router.post('/register',       register, AuthController.register);
router.post('/login',          login,    AuthController.login);

// ── Rotas autenticadas ───────────────────────────────────────
router.get('/me',              authenticate, AuthController.me);
router.patch('/me/password',   authenticate, AuthController.changePassword);

module.exports = router;