const express = require('express');

module.exports = (productManager) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', { products });
  });

  router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realTimeProducts', { products });
  });

  return router;
};