const { passport } = require('../passport');
const passportLib = require('passport');

function authenticateJwt(req, res, next) {
  passportLib.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ status: 'error', message: info?.message || 'No autorizado' });
    req.user = user;
    next();
  })(req, res, next);
}

function authorizeRole(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ status: 'error', message: 'No autorizado' });
    if (!roles.includes(user.role)) return res.status(403).json({ status: 'error', message: 'Permiso denegado' });
    next();
  };
}

module.exports = { authenticateJwt, authorizeRole };