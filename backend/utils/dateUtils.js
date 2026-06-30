//Função auxiliar que formata números com dois dígitos (ex: 9 → 09)
function pad(n) { return String(n).padStart(2, '0'); }

//Função que converte um objeto Date para string no formato ISO YYYY-MM-DD
function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Retorna início (segunda) e fim (domingo) da semana que contém `dateStr`.
 * Se `dateStr` não for informado usa a data atual.
 */
//Função que retorna o início (segunda) e fim (domingo) da semana para uma data
function getWeekRange(dateStr) {
  const ref  = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
  const day  = ref.getDay(); // 0=dom … 6=sab
  const diff = day === 0 ? -6 : 1 - day; // ajusta para segunda
  const start = new Date(ref);
  start.setDate(ref.getDate() + diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toISO(start), endDate: toISO(end) };
}

/**
 * Retorna início e fim do mês.
 */
//Fnção que retorna o primeiro e último dia do mês (YYYY-MM-DD)
function getMonthRange(year, month) {
  const y = parseInt(year  || new Date().getFullYear());
  const m = parseInt(month || new Date().getMonth() + 1);
  const start = new Date(y, m - 1, 1);
  const end   = new Date(y, m, 0);   // dia 0 do mês seguinte = último dia do mês atual
  return { startDate: toISO(start), endDate: toISO(end) };
}

/**
 * Retorna início e fim do ano.
 */
//Fnção que retorna o primeiro e último dia do ano (YYYY-MM-DD)
function getYearRange(year) {
  const y = parseInt(year || new Date().getFullYear());
  return { startDate: `${y}-01-01`, endDate: `${y}-12-31` };
}

module.exports = { getWeekRange, getMonthRange, getYearRange };