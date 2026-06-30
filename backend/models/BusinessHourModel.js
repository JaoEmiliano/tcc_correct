const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');

const TABLE = 'business_hours';

const BusinessHourModel = {
  // Função que retorna todos os horários de funcionamento.
  async findAll() {
    return db(TABLE).select('*').orderBy('day_of_week');
  },

  // Função que busca o horário de funcionamento de um dia específico.
  async findByDayOfWeek(dayOfWeek) {
    return db(TABLE).where({ day_of_week: dayOfWeek }).first();
  },

  // Função que atualiza horário de abertura, fechamento e status do dia.
  async update(dayOfWeek, { open_time, close_time, is_open }) {
    await db(TABLE)
      .where({ day_of_week: dayOfWeek })
      .update({ open_time, close_time, is_open, updated_at: db.fn.now() });
    return this.findByDayOfWeek(dayOfWeek);
  },

  // Função que busca o horário de funcionamento baseado em uma data.
  async getHoursForDate(dateStr) {
    // dateStr formato: "YYYY-MM-DD"
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0=domingo, 6=sábado
    return this.findByDayOfWeek(dayOfWeek);
  },

  async update(dayOfWeek, { open_time, close_time, is_open, break_start_time, break_end_time }) {
    await db(TABLE)
      .where({ day_of_week: dayOfWeek })
      .update({ 
        open_time, 
        close_time, 
        is_open, 
        break_start_time, // Salva o início do intervalo
        break_end_time,   // Salva o fim do intervalo
        updated_at: db.fn.now() 
      });
    return this.findByDayOfWeek(dayOfWeek);
  },
};

module.exports = BusinessHourModel;
