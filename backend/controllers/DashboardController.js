const AppointmentModel = require('../models/AppointmentModel');
const BusinessHourModel = require('../models/BusinessHourModel');
const { getWeekRange, getMonthRange, getYearRange } = require('../utils/dateUtils');

// Controlador do dashboard financeiro e de horários.
const DashboardController = {
  // Estatísticas semanais.
  async weekly(req, res, next) {
    try {
      const { startDate, endDate } = getWeekRange(req.query.date);
      const stats = await AppointmentModel.getStats({ startDate, endDate });

      return res.json({
        period: 'weekly',
        startDate,
        endDate,
        ...stats
      });
    } catch (err) {
      next(err);
    }
  },

  // Estatísticas mensais.
  async monthly(req, res, next) {
    try {
      const { year, month } = req.query;
      const { startDate, endDate } = getMonthRange(year, month);
      const stats = await AppointmentModel.getStats({ startDate, endDate });

      return res.json({
        period: 'monthly',
        startDate,
        endDate,
        ...stats
      });
    } catch (err) {
      next(err);
    }
  },

  // Estatísticas anuais.
  async yearly(req, res, next) {
    try {
      const { year } = req.query;
      const { startDate, endDate } = getYearRange(year);
      const stats = await AppointmentModel.getStats({ startDate, endDate });

      const byMonth = Array.from({ length: 12 }, (_, index) => {
        const month = String(index + 1).padStart(2, '0');

        const monthData = stats.by_day.filter((day) => {
          return String(day.date).slice(5, 7) === month;
        });

        return {
          month: index + 1,
          revenue: Number(
            monthData.reduce((sum, day) => {
              return sum + Number(day.revenue || 0);
            }, 0).toFixed(2)
          ),
          appointments: monthData.reduce((sum, day) => {
            return sum + Number(day.appointments || 0);
          }, 0)
        };
      });

      return res.json({
        period: 'yearly',
        year: startDate.slice(0, 4),
        by_month: byMonth,
        ...stats
      });
    } catch (err) {
      next(err);
    }
  },

  // Estatísticas customizadas por período e cliente.
  async filterByDateAndClient(req, res, next) {
    try {
      const { startDate, endDate, client_id } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          message: 'Informe startDate e endDate.'
        });
      }

      const stats = await AppointmentModel.getStats({
        startDate,
        endDate,
        clientId: client_id
      });

      return res.json({
        period: 'custom',
        startDate,
        endDate,
        client_id: client_id || 'all',
        ...stats
      });
    } catch (err) {
      next(err);
    }
  },

  // Relatório financeiro principal.
  // Regra:
  // - Receita recebida: completed + paid
  // - Receita pendente: completed + pending
  // - Receita prevista: scheduled
  // - Cancelados: cancelled
  async financial(req, res, next) {
    try {
      const { startDate, endDate, client_id } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          message: 'Informe startDate e endDate.'
        });
      }

      const stats = await AppointmentModel.getFinancialStats({
        startDate,
        endDate,
        clientId: client_id
      });

      return res.json({
        period: 'financial',
        startDate,
        endDate,
        client_id: client_id || 'all',
        ...stats
      });
    } catch (err) {
      next(err);
    }
  },

  // Retorna horários de funcionamento configurados.
  async getBusinessHours(req, res, next) {
    try {
      const hours = await BusinessHourModel.findAll();

      return res.json({
        business_hours: hours
      });
    } catch (err) {
      next(err);
    }
  },

  // Atualiza horários de funcionamento por dia da semana.
  async updateBusinessHours(req, res, next) {
    try {
      const {
        day_of_week,
        open_time,
        close_time,
        is_open,
        break_start_time,
        break_end_time
      } = req.body;

      if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
        return res.status(400).json({
          message: 'day_of_week deve estar entre 0 e 6.'
        });
      }

      if (break_start_time && break_end_time && break_start_time >= break_end_time) {
        return res.status(400).json({
          message: 'O início do intervalo deve ser menor que o fim.'
        });
      }

      const updated = await BusinessHourModel.update(day_of_week, {
        open_time,
        close_time,
        is_open,
        break_start_time: break_start_time || null,
        break_end_time: break_end_time || null
      });

      return res.json({
        message: 'Horários atualizados com sucesso.',
        business_hour: updated
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DashboardController;