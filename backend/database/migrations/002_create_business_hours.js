// Tabela para armazenar horários de funcionamento por dia da semana

exports.up = async function (knex) {
  await knex.schema.createTable('business_hours', (t) => {
    t.uuid('id').primary();
    t.integer('day_of_week').notNullable(); // 0=domingo, 1=segunda, ..., 6=sábado
    t.string('open_time', 5).notNullable();  // "HH:MM", ex: "09:00"
    t.string('close_time', 5).notNullable(); // "HH:MM", ex: "18:00"
    t.boolean('is_open').notNullable().defaultTo(true); // false = fechado nesse dia
    t.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('business_hours');
};
