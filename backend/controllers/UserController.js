const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');

// Controlador de usuários: operações CRUD e listagem.
const UserController = {
  // Função que lista todos os usuários.
  // Usada principalmente pelo administrador.
  async index(req, res, next) {
    try {
      const users = await UserModel.findAll();
      return res.json({ users });
    } catch (err) {
      next(err);
    }
  },

  // Função que mostra os dados de um usuário específico.
  async show(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado.'
        });
      }

      return res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  // Função que cria um novo cliente pelo administrador.
  async create(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array()
        });
      }

      const { name, email, phone, password } = req.body;

      if (!name || !email || !password) {
        return res.status(422).json({
          message: 'Nome, e-mail e senha são obrigatórios.'
        });
      }

      const existingUser = await UserModel.findByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          message: 'E-mail já cadastrado.'
        });
      }

      const user = await UserModel.create({
        name,
        email,
        phone,
        password,
        role: 'client'
      });

      return res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  // Função que atualiza um usuário, com controle de acesso.
  async update(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array()
        });
      }

      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({
          message: 'Acesso negado.'
        });
      }

      const user = await UserModel.update(req.params.id, req.body);

      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado.'
        });
      }

      return res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  // Função que exclui um usuário do sistema.
  async destroy(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado.'
        });
      }

      await UserModel.delete(req.params.id);

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};

module.exports = UserController;