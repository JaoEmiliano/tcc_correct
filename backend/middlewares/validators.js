// Middleware de validação de entrada usando express-validator.
// Cada propriedade contém regras para uma rota específica.
const { body } = require('express-validator');

const validators = {
  register: [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres.'),
  ],

  login: [
    body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha obrigatória.'),
  ],

  updateUser: [
    body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.'),
    body('email').optional().isEmail().withMessage('E-mail inválido.'),
  ],

  createService: [
    body('name').trim().notEmpty().withMessage('Nome do serviço é obrigatório.'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo.'),
    body('duration_minutes').isInt({ min: 1 }).withMessage('Duração em minutos é obrigatória.'),
  ],

  updateService: [
    body('name').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('duration_minutes').optional().isInt({ min: 1 }),
    body('active').optional().isBoolean(),
  ],

  createAppointment: [
    body('date').isDate().withMessage('Data inválida (use YYYY-MM-DD).'),
    body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('Horário inválido (use HH:MM).'),
    body('service_ids').isArray({ min: 1 }).withMessage('Informe ao menos um serviço.'),
  ],

  updateAppointment: [
    body('date').optional().isDate(),
    body('start_time').optional().matches(/^\d{2}:\d{2}$/),
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'blocked']),
    body('payment_status').optional().isIn(['pending', 'paid']),
    body('payment_method').optional().isIn(['pix', 'credit_card', 'debit_card', 'cash']),
  ],
};

module.exports = validators;