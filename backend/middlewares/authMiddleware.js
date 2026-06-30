const jwt = require('jsonwebtoken');

//Função que valida token JWT e preenche `req.user` com os dados do token
//Usada nas rotas que exigem autenticação obrigatória
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'Token não fornecido.' });

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

//Função que restringe acesso apenas a usuários com `role: 'admin'`
//Retorna 403 se o usuário não for administrador
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Acesso restrito ao administrador.' });
  next();
}

//Função que tenta decodificar o token JWT quando presente, mas não falha se ausente
//Útil para rotas públicas que se comportam diferente para usuários autenticados
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); }
    catch { /* ignora token inválido em rotas opcionais */ }
  }
  next();
}

module.exports = { authenticate, adminOnly, optionalAuth };