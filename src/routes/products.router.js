const express = require('express');
const path = require('path');

module.exports = (io, productManager) => {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const products = await productManager.getAll();
      res.json(products);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:pid', async (req, res, next) => {
    try {
      const product = await productManager.getById(req.params.pid);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(product);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await productManager.addProduct(req.body);
      const updatedList = await productManager.getAll();
      io.emit('products', updatedList);

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:pid', async (req, res, next) => {
    try {
      const updated = await productManager.updateProduct(req.params.pid, req.body);
      const updatedList = await productManager.getAll();
      io.emit('products', updatedList);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:pid', async (req, res, next) => {
    try {
      const removed = await productManager.deleteProduct(req.params.pid);
      const updatedList = await productManager.getAll();
      io.emit('products', updatedList);

      res.json({ deleted: removed });
    } catch (err) {
      next(err);
    }
  });

  return router;
};