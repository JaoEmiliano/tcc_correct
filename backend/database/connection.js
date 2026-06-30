// Cria conexão com o banco SQLite usado no ambiente de desenvolvimento.
const path = require('path');

const knex = require('knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'dev.sqlite3'),
  },
  useNullAsDefault: true,
});

module.exports = db;