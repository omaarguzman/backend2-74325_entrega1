const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const { generateToken } = require('../utils/jwt');
const { passport } = require('../passport');
const { authenticateJwt } = require('../middlewares/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res, next) => {
  try {
    const { first_name, last_name, email, age = 0, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Falta información requerida' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ status: 'error', message: 'Email ya registrado' });

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    const cart = await Cart.create({ products: [] });

    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      age,
      password: hashedPassword,
      cart: cart._id,
      role: 'user'
    });

    const { password: _, ...userWithoutPwd } = user.toObject();
    res.status(201).json({ status: 'success', user: userWithoutPwd });
  } catch (err) {
    next(err);
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    try {
      if (err) return next(err);
      if (!user) return res.status(401).json({ status: 'error', message: info?.message || 'Credenciales inválidas' });

      const token = generateToken(user);

      const { password, ...userData } = user.toObject ? user.toObject() : user;
      return res.json({ status: 'success', token, user: userData });
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
});

router.get('/current', authenticateJwt, (req, res) => {
  // authenticateJwt ya puso req.user con la info (sin password)
  res.json({ status: 'success', user: req.user });
});

module.exports = router;