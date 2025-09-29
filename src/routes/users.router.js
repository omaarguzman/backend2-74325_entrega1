const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { authenticateJwt, authorizeRole } = require('../middlewares/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

router.get('/', authenticateJwt, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ status: 'success', users });
  } catch (err) { next(err); }
});

router.get('/:uid', authenticateJwt, async (req, res, next) => {
  try {
    const { uid } = req.params;
    if (req.user.role !== 'admin' && String(req.user._id) !== String(uid)) {
      return res.status(403).json({ status: 'error', message: 'Permiso denegado' });
    }
    const user = await User.findById(uid).select('-password').lean();
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', user });
  } catch (err) { next(err); }
});

router.post('/', authenticateJwt, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const { first_name, last_name, email, age = 0, password, role = 'user' } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ status: 'error', message: 'Email en uso' });

    const hashed = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await User.create({ first_name, last_name, email, age, password: hashed, role });
    const { password: _, ...u } = user.toObject();
    res.status(201).json({ status: 'success', user: u });
  } catch (err) { next(err); }
});

router.put('/:uid', authenticateJwt, async (req, res, next) => {
  try {
    const { uid } = req.params;
    if (req.user.role !== 'admin' && String(req.user._id) !== String(uid)) {
      return res.status(403).json({ status: 'error', message: 'Permiso denegado' });
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.password = bcrypt.hashSync(updates.password, SALT_ROUNDS);
    }
    if (updates.role && req.user.role !== 'admin') delete updates.role;

    const updated = await User.findByIdAndUpdate(uid, updates, { new: true }).select('-password').lean();
    if (!updated) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', user: updated });
  } catch (err) { next(err); }
});

router.delete('/:uid', authenticateJwt, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const { uid } = req.params;
    const deleted = await User.findByIdAndDelete(uid).select('-password').lean();
    if (!deleted) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', deleted });
  } catch (err) { next(err); }
});

module.exports = router;