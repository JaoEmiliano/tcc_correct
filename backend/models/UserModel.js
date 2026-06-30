const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const bcrypt = require('bcryptjs');

const TABLE = 'users';

const UserModel = {
  // Função que retorna todos os usuários cadastrados.
  async findAll() {
    return db(TABLE)
      .select('id', 'name', 'email', 'phone', 'role', 'active', 'created_at')
      .orderBy('name');
  },

  // Função que busca um usuário pelo ID.
  async findById(id) {
    return db(TABLE)
      .select('id', 'name', 'email', 'phone', 'role', 'active', 'created_at')
      .where({ id })
      .first();
  },

  // Função que busca um usuário pelo e-mail.
  async findByEmail(email) {
    return db(TABLE).where({ email }).first();
  },

  // Função que cria um novo usuário com senha criptografada.
  async create({ name, email, phone, password, role = 'client' }) {
    const id            = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    await db(TABLE).insert({ id, name, email, phone, password_hash, role });
    return this.findById(id);
  },

  // Função que atualiza os dados permitidos de um usuário.
  async update(id, fields) {
    const allowed = ['name', 'email', 'phone', 'active'];
    const data    = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );
    await db(TABLE).where({ id }).update({ ...data, updated_at: db.fn.now() });
    return this.findById(id);
  },

  // Função que altera a senha do usuário no banco.
  async updatePassword(id, password) {
    const password_hash = await bcrypt.hash(password, 10);
    await db(TABLE).where({ id }).update({ password_hash, updated_at: db.fn.now() });
  },

  // Função que remove um usuário pelo ID.
  async delete(id) {
    return db(TABLE).where({ id }).del();
  },

  // Função que compara senha em texto com hash armazenado.
  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },
};

module.exports = UserModel;