const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');

const TABLE  = 'appointments';
const AS_TBL = 'appointment_services';

const AppointmentModel = {
  // Função que lista agendamentos com filtros de data, status e cliente.
  async findAll({ date, status, clientId } = {}) {
    const query = db(TABLE)
      .select(`${TABLE}.*`, 'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone')
      .leftJoin('users as u', `${TABLE}.client_id`, 'u.id')
      .orderBy([`${TABLE}.date`, `${TABLE}.start_time`]);

    if (date)     query.where(`${TABLE}.date`, date);
    if (status)   query.where(`${TABLE}.status`, status);
    if (clientId) query.where(`${TABLE}.client_id`, clientId);

    const appointments = await query;

    // Busca serviços para cada agendamento (SQLite não tem json_agg)
    for (const appt of appointments) {
        appt.services = await db(`${AS_TBL} as ap`)
         .select('ap.service_id as id','s.name','ap.price_at_time as price')
        .join('services as s', 'ap.service_id', 's.id')
        .where('ap.appointment_id', appt.id);
    }

    return appointments;
  },

  // Função que busca um agendamento completo pelo ID, incluindo serviços.
  async findById(id) {
    const appt = await db(TABLE)
      .select(`${TABLE}.*`, 'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone')
      .leftJoin('users as u', `${TABLE}.client_id`, 'u.id')
      .where(`${TABLE}.id`, id)
      .first();

    if (!appt) return null;

    appt.services = await db(`${AS_TBL} as ap`)
      .select(
        'ap.service_id as id',
        's.name',
        'ap.price_at_time as price'
      )
      .join('services as s', 'ap.service_id', 's.id')
      .where('ap.appointment_id', id);

    return appt;
  },

  // Função que retorna os agendamentos de um dia para verificar conflitos.
  async findByDate(date) {
    return db(TABLE)
      .select(`${TABLE}.start_time`, `${TABLE}.end_time`, `${TABLE}.status`, `${TABLE}.client_name`, 'u.name as user_name')
      .leftJoin('users as u', `${TABLE}.client_id`, 'u.id')
      .where({ date })
      .whereIn(`${TABLE}.status`, ['scheduled', 'blocked'])
      .orderBy(`${TABLE}.start_time`);
  },

  // Função que cria um novo agendamento e registra os serviços associados.
  async create({ client_id, client_name, date, start_time, end_time, status, payment_method, total_price, notes, services }) {
    const id = uuidv4();
    await db(TABLE).insert({ id, client_id, client_name, date, start_time, end_time, status, payment_method, total_price, notes });

    if (services && services.length > 0) {
      await db(AS_TBL).insert(
        services.map((s) => ({ id: uuidv4(), appointment_id: id, service_id: s.service_id, price_at_time: s.price_at_time }))
      );
    }
    return this.findById(id);
  },

  // Função que atualiza dados de um agendamento e seus serviços relacionados.
  async update(id, { client_name, date, start_time, end_time, status, payment_method, payment_status, total_price, notes, cancellation_reason, services }) {
    const data = {};
    if (client_name    !== undefined) data.client_name    = client_name;
    if (date           !== undefined) data.date           = date;
    if (start_time     !== undefined) data.start_time     = start_time;
    if (end_time       !== undefined) data.end_time       = end_time;
    if (status         !== undefined) data.status         = status;
    if (payment_method !== undefined) data.payment_method = payment_method;
    if (payment_status !== undefined) data.payment_status = payment_status;
    if (total_price    !== undefined) data.total_price    = total_price;
    if (notes          !== undefined) data.notes          = notes;
    if (cancellation_reason !== undefined) data.cancellation_reason = cancellation_reason;
    data.updated_at = db.fn.now();

    await db(TABLE).where({ id }).update(data);

    if (services !== undefined) {
      await db(AS_TBL).where({ appointment_id: id }).del();
      if (services.length > 0) {
        await db(AS_TBL).insert(
          services.map((s) => ({ id: uuidv4(), appointment_id: id, service_id: s.service_id, price_at_time: s.price_at_time }))
        );
      }
    }
    return this.findById(id);
  },

  // Função que exclui um agendamento do banco.
  async delete(id) {
    return db(TABLE).where({ id }).del();
  },

  // Função que verifica se há conflito de horários para um intervalo.
  async hasConflict(date, start_time, end_time, excludeId = null) {
    const query = db(TABLE)
      .where({ date })
      .whereIn('status', ['scheduled', 'blocked'])
      .where(function () {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      });
    if (excludeId) query.whereNot({ id: excludeId });
    const result = await query.count('id as count').first();
    return parseInt(result.count) > 0;
  },

  // Função que calcula métricas de receita e agendamentos para o dashboard.
  async getStats({ startDate, endDate, clientId } = {}) {
    let query = db(TABLE)
      .whereBetween('date', [startDate, endDate])
      .whereIn('status', ['scheduled', 'completed'])
      .select('total_price', 'date', 'client_id', 'client_name');

    if (clientId) query = query.where({ client_id: clientId });

    const rows = await query;

    const total_revenue      = rows.reduce((s, r) => s + parseFloat(r.total_price || 0), 0);
    const total_appointments = rows.length;

    let cancelledQuery = db(TABLE)
      .whereBetween('date', [startDate, endDate])
      .where({ status: 'cancelled' });

    if (clientId) cancelledQuery = cancelledQuery.where({ client_id: clientId });

    const cancelled = await cancelledQuery
      .count('id as count')
      .first();

    // Agrupa por dia
    const byDayMap = {};
    const byClientMap = {};
    for (const r of rows) {
      const d = r.date;
      const c = r.client_name || r.client_id || 'sem_cliente';
      const clientId = r.client_id || null;
      
      if (!byDayMap[d]) byDayMap[d] = { date: d, revenue: 0, appointments: 0 };
      byDayMap[d].revenue      += parseFloat(r.total_price || 0);
      byDayMap[d].appointments += 1;

      if (!byClientMap[c]) byClientMap[c] = { client: c, client_id: clientId, revenue: 0, appointments: 0 };
      byClientMap[c].revenue      += parseFloat(r.total_price || 0);
      byClientMap[c].appointments += 1;
    }
    const by_day = Object.values(byDayMap).sort((a, b) => a.date.localeCompare(b.date));
    const by_client = Object.values(byClientMap).sort((a, b) => b.revenue - a.revenue);

    // Top services - using raw query due to knex SQLite limitations with complex aggregations
    let topServicesQuery = `
      select s.name, COUNT(*) as quantity, SUM(ap.price_at_time) as revenue
      from appointment_services as ap
      inner join services as s on ap.service_id = s.id
      inner join appointments as a on ap.appointment_id = a.id
      where a.date between ? and ?
        and a.status in ('scheduled', 'completed')
    `;
    const params = [startDate, endDate];

    if (clientId) {
      topServicesQuery += ` and a.client_id = ?`;
      params.push(clientId);
    }

    topServicesQuery += `
      group by s.id, s.name
      order by quantity desc
      limit 5
    `;
    const topServicesRaw = await db.raw(topServicesQuery, params);

    // Se o filtro de cliente foi usado, traz os agendamentos e serviços detalhados.
    let appointments = [];
    if (clientId) {
      appointments = await db(TABLE)
        .select(
          `${TABLE}.id`,
          `${TABLE}.date`,
          `${TABLE}.start_time`,
          `${TABLE}.end_time`,
          `${TABLE}.status`,
          `${TABLE}.total_price`,
          `${TABLE}.client_name`,
          'u.name as client_name_full'
        )
        .leftJoin('users as u', `${TABLE}.client_id`, 'u.id')
        .whereBetween('date', [startDate, endDate])
        .whereIn('status', ['scheduled', 'completed'])
        .where({ client_id: clientId })
        .orderBy([`${TABLE}.date`, `${TABLE}.start_time`]);

      for (const appt of appointments) {
        appt.services = await db(`${AS_TBL} as ap`)
          .select('s.name', 'ap.price_at_time as price')
          .join('services as s', 'ap.service_id', 's.id')
          .where('ap.appointment_id', appt.id);
      }
    }

    return {
      total_revenue:      parseFloat(total_revenue.toFixed(2)),
      total_appointments,
      cancelled_count:    parseInt(cancelled.count || 0),
      average_ticket:     total_appointments > 0 ? parseFloat((total_revenue / total_appointments).toFixed(2)) : 0,
      by_day,
      by_client,
      top_services:       topServicesRaw,
      appointments,
    };
  },
};

module.exports = AppointmentModel;