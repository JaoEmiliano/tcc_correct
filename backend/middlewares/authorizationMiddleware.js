/**
 * Middleware: Valida se o usuário é admin OU é o proprietário do recurso
 * Uso: ownerOrAdmin('userId_param_name')
 * Ex: router.patch('/:id', ownerOrAdmin('id'), controller.update);
 */
function ownerOrAdmin(paramName = 'id') {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      // Admin tem acesso total
      return next();
    }

    // Cliente só acessa seu próprio recurso
    if (req.user.id === req.params[paramName]) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Acesso negado. Você só pode acessar seus próprios dados.' 
    });
  };
}

/**
 * Middleware: Valida se o usuário é admin
 */
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito ao administrador.' });
  }
  next();
}

/**
 * Middleware: Valida se está autenticado (DEPRECATED - usar do authMiddleware.js)
 * Este middleware assume que req.user já foi preenchido por outro middleware
 */
function authenticate(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  next();
}

/**
 * Middleware: Cliente só pode criar agendamentos para si mesmo
 */
function clientCanOnlyCreateOwn(req, res, next) {
  if (req.user.role === 'admin') {
    // Admin pode criar para qualquer pessoa
    return next();
  }

  // Cliente: validar que não está tentando criar para outro cliente
  if (req.body.client_id && req.body.client_id !== req.user.id) {
    return res.status(403).json({ 
      message: 'Você só pode criar agendamentos para você mesmo.' 
    });
  }

  // Se não especificou client_id, usa o do usuário autenticado
  req.body.client_id = req.user.id;
  next();
}

/**
 * Middleware: Valida acesso a agendamento específico
 * Apenas admin ou o cliente dono do agendamento
 */
function appointmentOwnerOrAdmin(req, res, next) {
  // Admin tem acesso total
  if (req.user.role === 'admin') {
    return next();
  }

  // Cliente: será validado no controller após buscar appointment
  // Este middleware apenas autoriza o acesso à rota
  next();
}

module.exports = { 
  ownerOrAdmin, 
  adminOnly, 
  authenticate, 
  clientCanOnlyCreateOwn,
  appointmentOwnerOrAdmin
};
