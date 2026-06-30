const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  await knex('appointment_services').del();
  await knex('appointments').del();
  await knex('services').del();
  await knex('users').del();

  await knex('users').insert({
    id: uuidv4(),
    name: 'Administradora',
    email: 'admin@manicure.com',
    password_hash: await bcrypt.hash('admin123', 10),
    role: 'admin',
    phone: '(44) 99999-0000',
  });

  await knex('services').insert([
    { id: uuidv4(), name: 'Esmaltação simples',  price: 30.00,  duration_minutes: 30 },
    { id: uuidv4(), name: 'Esmaltação em gel',   price: 55.00,  duration_minutes: 60 },
    { id: uuidv4(), name: 'Manicure completa',   price: 50.00,  duration_minutes: 50 },
    { id: uuidv4(), name: 'Pedicure',            price: 60.00,  duration_minutes: 60 },
    { id: uuidv4(), name: 'Acrigel / Fibra',     price: 120.00, duration_minutes: 90 },
    { id: uuidv4(), name: 'Remoção de gel',      price: 35.00,  duration_minutes: 30 },
  ]);
};