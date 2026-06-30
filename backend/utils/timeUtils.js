/**
 * Calcula o horário de término somando minutos ao horário de início.
 * @param {string} start  Formato "HH:MM"
 * @param {number} minutes
 * @returns {string}       Formato "HH:MM"
 */
function calcEndTime(start, minutes) {
  const [h, m] = start.split(':').map(Number);
  const total  = h * 60 + m + minutes;
  const endH   = Math.floor(total / 60) % 24;
  const endM   = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

module.exports = { calcEndTime };