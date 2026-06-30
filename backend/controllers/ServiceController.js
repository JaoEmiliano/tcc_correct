const { validationResult } = require('express-validator');
const ServiceModel = require('../models/ServiceModel');

// Controlador de serviços: lista, cria, altera e remove serviços.
const ServiceController = {
  // Função que lista serviços disponíveis (clientes veem apenas ativos).
  async index(req, res, next) {
    try {
      const onlyActive = req.user?.role !== 'admin';
      const services   = await ServiceModel.findAll(onlyActive);
      return res.json({ services });
    } catch (err) { next(err); }
  },

  // Função que retorna detalhes de um serviço específico.
  async show(req, res, next) {
    try {
      const service = await ServiceModel.findById(req.params.id);
      if (!service) return res.status(404).json({ message: 'Serviço não encontrado.' });
      return res.json({ service });
    } catch (err) { next(err); }
  },

  // Função que cria um novo serviço no sistema.
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
      const service = await ServiceModel.create(req.body);
      return res.status(201).json({ service });
    } catch (err) { next(err); }
  },

  // Função que atualiza os dados de um serviço.
  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
      const service = await ServiceModel.update(req.params.id, req.body);
      if (!service) return res.status(404).json({ message: 'Serviço não encontrado.' });
      return res.json({ service });
    } catch (err) { next(err); }
  },

  // Função que remove um serviço do catálogo.
  async destroy(req, res, next) {
    try {
      await ServiceModel.delete(req.params.id);
      return res.status(204).send();
    } catch (err) { next(err); }
  },
};

module.exports = ServiceController;