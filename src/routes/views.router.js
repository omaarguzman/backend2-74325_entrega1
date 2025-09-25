const express = require('express');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.get('/products', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = {};
    if (query) {
      if (query.startsWith('category:')) filter.category = query.split(':')[1];
      else if (query.startsWith('status:')) filter.status = query.split(':')[1] === 'true';
      else {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
    }

    const sortOption = {};
    if (sort === 'asc') sortOption.price = 1;
    if (sort === 'desc') sortOption.price = -1;

    const result = await Product.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
      lean: true
    });

    res.render('products', {
      products: result.docs,
      pagination: {
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage
      },
      qs: { limit, sort, query },
      viewTitle: 'Productos'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).render('404', { message: 'Producto no encontrado' });
    res.render('productDetail', { product, viewTitle: product.title });
  } catch (err) {
    next(err);
  }
});

router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).render('404', { message: 'Carrito no encontrado' });

    const items = (cart.products || []).map(p => ({
      _id: p.product?._id,
      title: p.product?.title,
      price: p.product?.price,
      quantity: p.quantity,
      subtotal: (p.product?.price || 0) * p.quantity
    }));

    const total = items.reduce((acc, it) => acc + it.subtotal, 0);

    res.render('cart', {
      cartId: cart._id,
      items,
      total,
      viewTitle: `Carrito ${cart._id}`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;