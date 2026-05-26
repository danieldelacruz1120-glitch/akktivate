const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado — falta el token' });
  }
  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET || 'akktivate_secreto_xK9mP2qL8nR4wZ7vT1jY5bH6cF3sD0eA';
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o caducado' });
  }
};
