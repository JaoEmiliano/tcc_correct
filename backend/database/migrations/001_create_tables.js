// Compatível com SQLite (dev) e PostgreSQL (prod).
// O knex abstrai as diferenças — não use gen_random_uuid() nem
// tipos ENUM nativos aqui; use string com checagens na camada de modelo.

exports.up = async function (knex) {
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary();
    t.string('name', 100).notNullable();
    t.string('email', 150).notNullable().unique();
    t.string('phone', 20);
    t.string('password_hash').notNullable();
    t.string('role', 10).notNullable().defaultTo('client'); // 'client' | 'admin'
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('services', (t) => {
    t.uuid('id').primary();
    t.string('name', 100).notNullable();
    t.text('description');
    t.decimal('price', 8, 2).notNullable();
    t.integer('duration_minutes').notNullable();
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('appointments', (t) => {
    t.uuid('id').primary();
    t.uuid('client_id').references('id').inTable('users').onDelete('SET NULL').nullable();
    t.string('client_name', 100);
    t.date('date').notNullable();
    t.string('start_time', 5).notNullable();  // "HH:MM"
    t.string('end_time', 5).notNullable();    // "HH:MM"
    t.string('status', 20).notNullable().defaultTo('scheduled');
    // status: 'scheduled' | 'completed' | 'cancelled' | 'blocked'
    t.string('payment_method', 20).nullable();
    // payment_method: 'pix' | 'credit_card' | 'debit_card' | 'cash'
    t.string('payment_status', 10).notNullable().defaultTo('pending');
    // payment_status: 'pending' | 'paid'
    t.decimal('total_price', 8, 2).defaultTo(0);
    t.text('notes');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('appointment_services', (t) => {
    t.uuid('id').primary();
    t.uuid('appointment_id').references('id').inTable('appointments').onDelete('CASCADE');
    t.uuid('service_id').references('id').inTable('services').onDelete('CASCADE');
    t.decimal('price_at_time', 8, 2).notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('appointment_services');
  await knex.schema.dropTableIfExists('appointments');
  await knex.schema.dropTableIfExists('services');
  await knex.schema.dropTableIfExists('users');
};