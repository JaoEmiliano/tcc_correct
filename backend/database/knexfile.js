require('dotenv').config({ path: '../.env' });

module.exports = {
  // ── SQLite (desenvolvimento local) ────────────────────────────────
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',   // arquivo gerado em backend/database/dev.sqlite3
    },
    useNullAsDefault: true,        // obrigatório no SQLite
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  // ── PostgreSQL (produção) ─────────────────────────────────────────
  // Para migrar: defina NODE_ENV=production no .env
  // e preencha as variáveis DB_* abaixo.
  production: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT     || 5432,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  // ── PostgreSQL (staging/homologação) ─────────────────────────────
  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};