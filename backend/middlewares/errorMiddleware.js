//Função middleware centralizada que formata e responde erros lançados na aplicação
//Recebe o erro e retorna JSON apropriado com status e mensagem.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

  // Violação de unique constraint (PostgreSQL)
  if (err.code === '23505')
    return res.status(409).json({ message: 'Registro duplicado.' });

  // Violação de chave estrangeira
  if (err.code === '23503')
    return res.status(400).json({ message: 'Referência inválida.' });

  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;