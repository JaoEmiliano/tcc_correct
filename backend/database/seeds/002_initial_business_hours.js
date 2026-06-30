const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  await knex('business_hours').del();

  // Padrão: segunda a sábado 09:00-18:00, domingo fechado
  const businessHours = [
    { day_of_week: 0, open_time: '09:00', close_time: '18:00', is_open: false }, // Domingo (fechado)
    { day_of_week: 1, open_time: '09:00', close_time: '18:00', is_open: true },  // Segunda
    { day_of_week: 2, open_time: '09:00', close_time: '18:00', is_open: true },  // Terça
    { day_of_week: 3, open_time: '09:00', close_time: '18:00', is_open: true },  // Quarta
    { day_of_week: 4, open_time: '09:00', close_time: '18:00', is_open: true },  // Quinta
    { day_of_week: 5, open_time: '09:00', close_time: '18:00', is_open: true },  // Sexta
    { day_of_week: 6, open_time: '09:00', close_time: '18:00', is_open: true },  // Sábado
  ];

  await knex('business_hours').insert(
    businessHours.map(h => ({ id: uuidv4(), ...h }))
  );
};
