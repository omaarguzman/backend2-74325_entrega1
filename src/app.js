const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const dotenv = require('dotenv');

const connectDB = require('./db');
const productsApiRouter = require('./routes/products.router');
const cartsApiRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const hbs = exphbs.create({
  helpers: {
    eq: (a, b) => String(a) === String(b),
    not: (v) => !v,
    add: (a, b) => Number(a) + Number(b),
    minus: (a, b) => Number(a) - Number(b),
    money: (v) => (Number(v) || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
    json: (ctx) => JSON.stringify(ctx),
    pageLink: (base, page, qs) => {
      const params = new URLSearchParams(qs || {});
      params.set('page', page);
      return `${base}?${params.toString()}`;
    }
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsApiRouter);
app.use('/api/carts', cartsApiRouter);

app.use('/', viewsRouter);

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});