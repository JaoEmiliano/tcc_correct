const AppointmentModel = require("../models/AppointmentModel");
const UserModel = require("../models/UserModel");
const BusinessHourModel = require("../models/BusinessHourModel");
const { calcEndTime } = require("../utils/timeUtils");
const {
  calculateAppointmentServices,
} = require("../utils/appointmentCalculator");
const { validationResult } = require('express-validator');


// Controlador de agendamentos: gerencia consultas, criação, atualização e cancelamento.
const AppointmentController = {
  // Função que lista agendamentos, filtrando por data, status ou cliente.
  async index(req, res, next) {
    try {
      const { date, status } = req.query;
      const clientId =
        req.user.role === "client" ? req.user.id : req.query.client_id;
      const appointments = await AppointmentModel.findAll({
        date,
        status,
        clientId,
      });
      return res.json({ appointments });
    } catch (err) {
      next(err);
    }
  },

  async available(req, res, next) {
    try {
      const { date, service_id, service_ids } = req.query;

      if (!date) {
        return res.status(400).json({
          message: "Informe a data (date).",
        });
      }

      let serviceIds = [];

      if (service_ids) {
        serviceIds = String(service_ids)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
      } else if (service_id) {
        serviceIds = [String(service_id)];
      }

      let serviceDuration = 30;

      if (serviceIds.length > 0) {
        const { totalDuration } =
          await calculateAppointmentServices(serviceIds);
        serviceDuration = totalDuration;
      }

      const businessHours = await BusinessHourModel.getHoursForDate(date);

      if (!businessHours || !businessHours.is_open) {
        return res.json({
          date,
          isOpen: false,
          slots: [],
          message: "Sem expediente",
        });
      }

      const occupied = await AppointmentModel.findByDate(date);

      const [openH, openM] = businessHours.open_time.split(":").map(Number);
      const [closeH, closeM] = businessHours.close_time.split(":").map(Number);

      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      const hasInterval =
        businessHours.break_start_time && businessHours.break_end_time;

      const slots = [];

      for (
        let totalMinutes = openMinutes;
        totalMinutes < closeMinutes;
        totalMinutes += 30
      ) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const slotEnd = calcEndTime(time, serviceDuration);

        const [endH, endM] = slotEnd.split(":").map(Number);
        const slotEndMinutes = endH * 60 + endM;

        const overlaps = occupied.some(
          (appointment) =>
            appointment.status !== "cancelled" &&
            time < appointment.end_time &&
            slotEnd > appointment.start_time,
        );

        const isBlocked = occupied.some(
          (appointment) =>
            appointment.status === "blocked" &&
            time < appointment.end_time &&
            slotEnd > appointment.start_time,
        );

        let isInInterval = false;

        if (hasInterval) {
          isInInterval =
            time < businessHours.break_end_time &&
            slotEnd > businessHours.break_start_time;
        }

        const isAfterClose = slotEndMinutes > closeMinutes;

        slots.push({
          time,
          available: !isAfterClose && !overlaps && !isInInterval,
          blocked: isBlocked || isInInterval,
          service_duration: serviceDuration,
        });
      }

      return res.json({
        date,
        isOpen: true,
        service_duration: serviceDuration,
        slots,
      });
    } catch (err) {
      next(err);
    }
  },

  // Função que retorna detalhes de um agendamento específico.
  async show(req, res, next) {
    try {
      const appointment = await AppointmentModel.findById(req.params.id);
      if (!appointment)
        return res.status(404).json({ message: "Agendamento não encontrado." });

      if (req.user.role === "client" && appointment.client_id !== req.user.id)
        return res.status(403).json({ message: "Acesso negado." });

      return res.json({ appointment });
    } catch (err) {
      next(err);
    }
  },

  // Função que cria um novo agendamento e verifica conflito de horário.
  async create(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }

      const { date, start_time, service_ids, payment_method, notes } = req.body;

      if (!date || !start_time) {
        return res.status(400).json({
          message: "Informe date e start_time.",
        });
      }

      const serviceIds = Array.isArray(service_ids) ? service_ids : [];

      if (serviceIds.length === 0) {
        return res.status(400).json({
          message: "Informe pelo menos um serviço.",
        });
      }

      const client_id =
        req.user.role === "client" ? req.user.id : req.body.client_id || null;

      let client_name = req.body.client_name || null;

      if (client_id && !client_name) {
        const user = await UserModel.findById(client_id);

        if (user) {
          client_name = user.name;
        }
      }

      const { services, totalDuration, totalPrice } =
        await calculateAppointmentServices(serviceIds);

      const end_time = calcEndTime(start_time, totalDuration);

      const conflict = await AppointmentModel.hasConflict(
        date,
        start_time,
        end_time,
      );

      if (conflict) {
        return res.status(409).json({
          message: "Horário indisponível.",
        });
      }

      const appointment = await AppointmentModel.create({
        client_id,
        client_name,
        date,
        start_time,
        end_time,
        status: "scheduled",
        payment_method,
        total_price: totalPrice,
        notes,
        services: services.map((service) => ({
          service_id: service.id,
          price_at_time: service.price,
        })),
      });

      return res.status(201).json({
        appointment,
      });
    } catch (err) {
      next(err);
    }
  },

  // Função que atualiza um agendamento existente (admin).
  async update(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }

      const existing = await AppointmentModel.findById(req.params.id);

      if (!existing) {
        return res.status(404).json({
          message: "Agendamento não encontrado.",
        });
      }

      const {
        date,
        start_time,
        service_ids,
        payment_method,
        payment_status,
        status,
        notes,
      } = req.body;

      let client_name = req.body.client_name;
      const client_id = req.body.client_id || existing.client_id;

      if (client_id && !client_name) {
        const user = await UserModel.findById(client_id);

        if (user) {
          client_name = user.name;
        }
      }

      const newDate = date || existing.date;
      const newStart = start_time || existing.start_time.slice(0, 5);

      let end_time = existing.end_time;
      let total_price = existing.total_price;
      let serviceRows;

      if (service_ids) {
        const serviceIds = Array.isArray(service_ids) ? service_ids : [];

        if (serviceIds.length === 0) {
          return res.status(400).json({
            message: "Informe pelo menos um serviço.",
          });
        }

        const { services, totalDuration, totalPrice } =
          await calculateAppointmentServices(serviceIds);

        total_price = totalPrice;
        end_time = calcEndTime(newStart, totalDuration);

        serviceRows = services.map((service) => ({
          service_id: service.id,
          price_at_time: service.price,
        }));
      }

      if (date || start_time || service_ids) {
        const conflict = await AppointmentModel.hasConflict(
          newDate,
          newStart,
          end_time,
          req.params.id,
        );

        if (conflict) {
          return res.status(409).json({
            message: "Horário indisponível.",
          });
        }
      }

      const appointment = await AppointmentModel.update(req.params.id, {
        client_id,
        client_name,
        date: newDate,
        start_time: newStart,
        end_time,
        status,
        payment_method,
        payment_status,
        total_price,
        notes,
        services: serviceRows,
      });

      return res.json({
        appointment,
      });
    } catch (err) {
      next(err);
    }
  },

  // Função que cancela um agendamento pendente.
  async cancel(req, res, next) {
    try {
      const appointment = await AppointmentModel.findById(req.params.id);
      if (!appointment)
        return res.status(404).json({ message: "Agendamento não encontrado." });

      if (req.user.role === "client" && appointment.client_id !== req.user.id)
        return res.status(403).json({ message: "Acesso negado." });

      if (appointment.status !== "scheduled")
        return res.status(400).json({
          message: "Apenas agendamentos pendentes podem ser cancelados.",
        });

      let cancellation_reason = "";
      if (req.body) {
        cancellation_reason = req.body.cancellation_reason || "";
      }

      if (req.user.role === "client" && !cancellation_reason.trim()) {
        return res
          .status(400)
          .json({ message: "Informe o motivo do cancelamento." });
      }

      await AppointmentModel.update(req.params.id, {
        status: "cancelled",
        cancellation_reason,
      });
      return res.json({ message: "Agendamento cancelado." });
    } catch (err) {
      next(err);
    }
  },

  // Função que cria um bloqueio de horário para evitar agendamento.
  async block(req, res, next) {
    try {
      const { date, start_time, end_time, notes } = req.body;
      if (!date || !start_time || !end_time)
        return res
          .status(400)
          .json({ message: "Informe date, start_time e end_time." });

      if (start_time >= end_time)
        return res
          .status(400)
          .json({ message: "start_time deve ser menor que end_time." });

      // 1. Busca todos os registros (agendamentos e bloqueios) já existentes para este dia específico
      const occupied = await AppointmentModel.findByDate(date);

      // 2. Valida se há algum agendamento ativo ('scheduled') ocupando a exata janela temporal que o admin quer fechar
      const hasActiveAppointment = occupied.some(
        (appt) =>
          appt.status === "scheduled" &&
          start_time < appt.end_time &&
          end_time > appt.start_time,
      );

      // 3. Se encontrar um cliente agendado no horário, interrompe a requisição
      if (hasActiveAppointment) {
        return res.status(400).json({
          message:
            "Não é possível bloquear este período. Já existe um cliente agendado de forma ativa neste horário.",
        });
      }

      // Validação complementar para evitar sobreposição de bloqueios manuais duplicados
      const conflict = await AppointmentModel.hasConflict(
        date,
        start_time,
        end_time,
      );
      if (conflict)
        return res.status(409).json({
          message: "Horário já ocupado por outro bloqueio ou agendamento.",
        });

      const appointment = await AppointmentModel.create({
        date,
        start_time,
        end_time,
        status: "blocked",
        notes,
        services: [],
      });
      return res.status(201).json({ appointment });
    } catch (err) {
      next(err);
    }
  },

  // Função que deleta um agendamento do sistema.
  async destroy(req, res, next) {
    try {
      await AppointmentModel.delete(req.params.id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AppointmentController;
