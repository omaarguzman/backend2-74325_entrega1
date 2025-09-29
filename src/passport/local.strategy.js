
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const localStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password', session: false },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return done(null, false, { message: 'Usuario no encontrado' });

      const match = bcrypt.compareSync(password, user.password);
      if (!match) return done(null, false, { message: 'Contraseña incorrecta' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

module.exports = localStrategy;