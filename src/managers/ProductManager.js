const fs = require('fs');
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath || path.join(__dirname, '..', 'data', 'products.json');
    }

    async #readFile() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf-8');
            return JSON.parse(data || []);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await fs.mkdir(path.dirname(this.filePath), { recursive: true });
                await fs.promises.writeFile(this.filePath, '[]');
                return [];
            }
            throw err;
        }
    }

    async #writeFile(data) {
        await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async #nextId(items) {
        if (!items.length) return 1;
        const maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
        return maxId + 1;
    }

    async getAll() {
        return await this.#readFile();
    }

    async getById(id) {
        const items = await this.#readFile();
        return items.find(item => String(tem.id) === String(id)) || null;
    }

    async addProduct(data) {
        const required = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of required) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                const err = new Error(`El campo ${field} es obligatorio`);
                err.status = 400;
                throw err;
            }
        }

        const products = await this.#readFile();
        if (products.some(item => item.code === data.code)) {
            const err = new Error('El código de producto ya existe');
            err.status = 409;
            throw err;
        }

        const newProduct = {
            id: await this.#nextId(products),
            title: String(data.title),
            description: String(data.description),
            code: String(data.code),
            price: Number(data.price),
            status: data.status === undefined ? true : Boolean(data.status),
            stock: Number(data.stock),
            category: String(data.category),
            thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails.map(String) : []
        };

        products.push(newProduct);
        await this.#writeFile(products);
        return newProduct;
    }

    async updateProduct(id, updates) {
        const products = await this.#readFile();
        const idx = products.findIndex(item => String(item.id) === String(id));
        if (idx === -1) {
            const err = new Error('Producto no encontrado');
            err.status = 404;
            throw err;
        }

        const { id: _ignored, ...rest } = updates || {};

        if (rest.code && products.some(item => item.code === rest.code && String(item.id) !== String(id))) {
            const err = new Error('El código de producto ya existe');
            err.status = 409;
            throw err;
        }

        products[idx] = {
            ...products[idx],
            ...rest,
            price: rest.price !== undefined ? Number(rest.price) : products[idx].price,
            stock: rest.stock !== undefined ? Number(rest.stock) : products[idx].stock,
            status: rest.status !== undefined ? Boolean(rest.status) : products[idx].status,
            thumbnails: rest.thumbnails !== undefined ? (Array.isArray(rest.thumbnails) ? rest.thumbnails.map(String) : products[idx].thumbnails) : products[idx].thumbnails
        };

        await this.#writeFile(products);
        return products[idx];
    }

    async deleteProduct(id) {
        const products = await this.#readFile();
        const idx = products.findIndex(item => String(item.id) === String(id));
        if (idx === -1) {
            const err = new Error('Producto no encontrado');
            err.status = 404;
            throw err;
        }

        const [removed] = products.splice(idx, 1);
        await this.#writeFile(products);
        return removed;
    }
}

module.exports = ProductManager;