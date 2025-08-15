const socket = io();

socket.on('products', (products) => {
    const list = document.getElementById('productList');
    list.innerHTML = '';
    products.forEach(p => {
        const li = document.createElement('li');
        li.dataset.id = p.id;
        li.innerHTML = `<strong>${p.title}</strong> - ${p.description} (${p.price})
                        <button class="delete-btn" data-id="${p.id}">Eliminar</button>`;
        list.appendChild(li);
    });
});

document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {};
    formData.forEach((value, key) => {
        productData[key] = value;
    });
    socket.emit('newProduct', productData);
    e.target.reset();
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        socket.emit('deleteProduct', id);
    }
});