exports.up = async function (knex) {
  await knex.schema.alterTable('appointments', (table) => {
    table.text('cancellation_reason').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('appointments', (table) => {
    table.dropColumn('cancellation_reason');
  });
};