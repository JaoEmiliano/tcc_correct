const ServiceModel = require('../models/ServiceModel');

/**
 * Calcula os dados consolidados de um agendamento com base nos serviços escolhidos.
 *
 * @param {string[]} serviceIds Lista de IDs dos serviços selecionados
 * @returns {Promise<{
 *   services: Array,
 *   totalDuration: number,
 *   totalPrice: number
 * }>}
 */
async function calculateAppointmentServices(serviceIds) {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    const error = new Error('Informe pelo menos um serviço.');
    error.status = 400;
    throw error;
  }
  // Busca os serviços no banco de dados com base nos IDs fornecidos.
  const services = await ServiceModel.findByIds(serviceIds);

  if (!services || services.length === 0) {
    const error = new Error('Nenhum serviço encontrado.');
    error.status = 404;
    throw error;
  }

  if (services.length !== serviceIds.length) {
    const error = new Error('Um ou mais serviços informados são inválidos.');
    error.status = 400;
    throw error;
  }
  // Calcula a duração total
  const totalDuration = services.reduce((sum, service) => {
    return sum + Number(service.duration_minutes || 0);
  }, 0);
  // Calcula o preço total
  const totalPrice = services.reduce((sum, service) => {
    return sum + Number(service.price || 0);
  }, 0);

  return {
    services,
    totalDuration,
    totalPrice
  };
}

module.exports = {
  calculateAppointmentServices
};