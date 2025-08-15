const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, '..', 'data', 'carts.json');
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, '[]');
        return [];
      }
      throw err;
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async #nextId(items) {
    if (!items.length) return 1;
    const maxId = items.reduce((max, it) => Math.max(max, Number(it.id) || 0), 0);
    return maxId + 1;
  }

  async createCart() {
    const carts = await this.#readFile();
    const newCart = {
      id: await this.#nextId(carts),
      products: []
    };
    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#readFile();
    return carts.find(c => String(c.id) === String(id)) || null;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const carts = await this.#readFile();
    const idx = carts.findIndex(c => String(c.id) === String(cartId));
    if (idx === -1) {
      const e = new Error('Carrito no encontrado');
      e.status = 404;
      throw e;
    }

    const products = carts[idx].products || [];
    const pIndex = products.findIndex(p => String(p.product) === String(productId));
    if (pIndex === -1) {
      products.push({ product: String(productId), quantity: Number(quantity) || 1 });
    } else {
      products[pIndex].quantity += Number(quantity) || 1;
    }

    carts[idx].products = products;
    await this.#writeFile(carts);
    return carts[idx];
  }
}

module.exports = CartManager;