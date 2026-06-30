const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');

// Função que gera um JWT para o usuário autenticado.
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Controlador de autenticação e gerenciamento de conta.
const AuthController = {
  // Função que registra um novo usuário e retorna token.
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { name, email, phone, password } = req.body;

      const existing = await UserModel.findByEmail(email);
      if (existing) return res.status(409).json({ message: 'E-mail já cadastrado.' });

      const user  = await UserModel.create({ name, email, phone, password });
      const token = generateToken(user);

      return res.status(201).json({ user, token });
    } catch (err) { next(err); }
  },

  // Função que autentica usuário e retorna token.
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const valid = await UserModel.comparePassword(password, user.password_hash);
      if (!valid) return res.status(401).json({ message: 'Credenciais inválidas.' });

      if (!user.active) return res.status(403).json({ message: 'Conta desativada.' });

      const { password_hash, ...safeUser } = user;
      const token = generateToken(safeUser);

      return res.json({ user: safeUser, token });
    } catch (err) { next(err); }
  },

  // Função que retorna dados do usuário autenticado.
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
      return res.json({ user });
    } catch (err) { next(err); }
  },

  // Função que altera a senha do usuário autenticado.
  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      if (!new_password || new_password.length < 6)
        return res.status(422).json({ message: 'Nova senha deve ter ao menos 6 caracteres.' });

      const user  = await UserModel.findByEmail(req.user.email);
      const valid = await UserModel.comparePassword(current_password, user.password_hash);
      if (!valid) return res.status(401).json({ message: 'Senha atual incorreta.' });

      await UserModel.updatePassword(req.user.id, new_password);
      return res.json({ message: 'Senha alterada com sucesso.' });
    } catch (err) { next(err); }
  },
};

module.exports = AuthController;