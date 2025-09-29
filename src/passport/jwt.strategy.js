const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const dotenv = require('dotenv');
const User = require('../models/user.model');

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
};

const jwtStrategy = new JwtStrategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub).select('-password').lean();
    if (!user) return done(null, false, { message: 'Token inválido - usuario no existe' });
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});

module.exports = jwtStrategy;