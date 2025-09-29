const passport = require('passport');
const localStrategy = require('./local.strategy');
const jwtStrategy = require('./jwt.strategy');

function initializePassport() {
  passport.use('login', localStrategy);   
  passport.use('jwt', jwtStrategy);       
}

module.exports = { initializePassport, passport };