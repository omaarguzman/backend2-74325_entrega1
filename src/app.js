const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const ProductManager = require('./managers/ProductManager');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const productManager = new ProductManager(path.join(__dirname, 'data', 'products.json'));

const connectDB = require('./db');
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter(io, productManager)); 
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter(productManager));

io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  const products = await productManager.getAll();
  socket.emit('products', products);

  socket.on('newProduct', async (productData) => {
    await productManager.addProduct(productData);
    const updatedList = await productManager.getAll();
    io.emit('products', updatedList);
  });

  socket.on('deleteProduct', async (id) => {
    await productManager.deleteProduct(id);
    const updatedList = await productManager.getAll();
    io.emit('products', updatedList);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});