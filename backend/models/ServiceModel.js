const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');

const TABLE = 'services';

const ServiceModel = {
  // Função que lista serviços, opcionalmente apenas ativos.
  async findAll(onlyActive = false) {
    const query = db(TABLE).select('*').orderBy('name');

    if (onlyActive) {
      query.where({ active: true });
    }

    return query;
  },

  // Função que busca um serviço pelo ID.
  async findById(id) {
    return db(TABLE)
      .where({ id })
      .first();
  },

  // Função que busca vários serviços por ID.
  // Será usada para calcular preço e duração total de agendamentos com múltiplos serviços.
  async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    return db(TABLE)
      .whereIn('id', ids)
      .where({ active: true })
      .select('*');
  },

  // Função que cria um novo serviço no catálogo.
  async create({ name, description, price, duration_minutes }) {
    const id = uuidv4();

    await db(TABLE).insert({
      id,
      name,
      description,
      price,
      duration_minutes
    });

    return this.findById(id);
  },

  // Função que atualiza um serviço existente.
  async update(id, fields) {
    await db(TABLE)
      .where({ id })
      .update({
        ...fields,
        updated_at: db.fn.now()
      });

    return this.findById(id);
  },

  // Função que exclui um serviço pelo ID.
  async delete(id) {
    return db(TABLE)
      .where({ id })
      .del();
  }
};

module.exports = ServiceModel;