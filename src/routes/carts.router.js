const express = require('express');
const path = require('path');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const cartsFile = path.join(__dirname, '..', 'data', 'carts.json');
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

const cartManager = new CartManager(cartsFile);
const productManager = new ProductManager(productsFile);

// POST /api/carts/ -> crear carrito
router.post('/', async (req, res, next) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products || []);
  } catch (err) {
    next(err);
  }
});

router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    const product = await productManager.getById(pid);
    if (!product) return res.status(404).json({ error: 'Producto no existe' });

    const updatedCart = await cartManager.addProductToCart(cid, pid, 1);
    res.status(201).json(updatedCart);
  } catch (err) {
    next(err);
  }
});

module.exports = router;