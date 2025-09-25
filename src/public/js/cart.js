(async function () {
  async function ensureCart() {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      const res = await fetch('/api/carts', { method: 'POST' });
      const data = await res.json();
      cartId = data._id || data.id;
      localStorage.setItem('cartId', cartId);
    }
    return cartId;
  }

  document.getElementById('goToCart')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const cid = await ensureCart();
    window.location.href = `/carts/${cid}`;
  });

  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const pid = e.target.getAttribute('data-pid');
      const cid = await ensureCart();
      await fetch(`/api/carts/${cid}/products/${pid}`, { method: 'POST' });
      e.target.textContent = 'Agregado ✓';
      setTimeout(() => (e.target.textContent = 'Agregar al carrito'), 1000);
    }
  });
})();