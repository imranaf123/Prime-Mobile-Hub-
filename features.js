// Prime Mobile Hub (PMH) | Developed by Imran Af
// Features: Cart, Wishlist, Compare, Toast

// ── TOAST NOTIFICATIONS ─────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<polyline points="20 6 9 17 4 12"></polyline>'
        : type === 'error'
        ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'
      }
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── CART ────────────────────────────────────────────────
const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('pmh_cart')) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem('pmh_cart', JSON.stringify(items));
    updateAllBadges();
  },

  add(product, qty = 1) {
    const items = this.get();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.images[0],
        qty: qty
      });
    }

    this.save(items);
    this.renderSidebar();
    this.open();
    showToast(`${product.name} added to cart!`, 'success');
  },

  remove(id) {
    const items = this.get().filter(item => item.id !== id);
    this.save(items);
    this.renderSidebar();
  },

  updateQty(id, qty) {
    if (qty <= 0) {
      this.remove(id);
      return;
    }
    const items = this.get();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = qty;
      this.save(items);
      this.renderSidebar();
    }
  },

  clear() {
    this.save([]);
    this.renderSidebar();
  },

  getTotal() {
    return this.get().reduce((sum, item) => {
      const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + (discountedPrice * item.qty);
    }, 0);
  },

  getItemCount() {
    return this.get().reduce((sum, item) => sum + item.qty, 0);
  },

  renderSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) return;

    const items = this.get();
    const currency = window.PMH?.settings?.currencySymbol || 'Rs.';

    const formatPrice = (price) => {
      return `${currency} ${price.toLocaleString('en-PK')}`;
    };

    sidebar.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart (${this.getItemCount()} items)</h3>
        <button class="cart-close" onclick="Cart.close()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="cart-items">
        ${items.length === 0 ? `
          <div class="cart-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Your cart is empty</p>
          </div>
        ` : items.map(item => {
          const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
          return `
            <div class="cart-item">
              <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
              </div>
              <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(discountedPrice)}</div>
                <div class="cart-item-qty">
                  <button class="qty-btn" onclick="Cart.updateQty('${item.id}', ${item.qty - 1})">-</button>
                  <span>${item.qty}</span>
                  <button class="qty-btn" onclick="Cart.updateQty('${item.id}', ${item.qty + 1})">+</button>
                </div>
              </div>
              <button class="cart-item-remove" onclick="Cart.remove('${item.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `;
        }).join('')}
      </div>
      ${items.length > 0 ? `
        <div class="cart-footer">
          <div class="cart-subtotal">
            <span>Subtotal</span>
            <span>${formatPrice(this.getTotal())}</span>
          </div>
          <a href="${this.buildWhatsAppURL()}" target="_blank" class="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Checkout via WhatsApp
          </a>
          <button class="btn btn-secondary" onclick="Cart.close()">Continue Shopping</button>
        </div>
      ` : ''}
    `;
  },

  open() {
    this.renderSidebar();
    document.getElementById('cart-sidebar')?.classList.add('open');
    document.getElementById('cart-backdrop')?.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('cart-sidebar')?.classList.remove('open');
    document.getElementById('cart-backdrop')?.classList.remove('show');
    document.body.style.overflow = '';
  },

  buildWhatsAppURL() {
    const items = this.get();
    const settings = window.PMH?.settings || {};
    const currency = settings.currencySymbol || 'Rs.';
    
    let message = `Hi Prime Mobile Hub! 👋 I'd like to order:\n\n`;
    
    items.forEach(item => {
      const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
      const itemTotal = discountedPrice * item.qty;
      message += `• ${item.name} x${item.qty} = ${currency} ${itemTotal.toLocaleString('en-PK')}\n`;
    });
    
    message += `\nTotal: ${currency} ${this.getTotal().toLocaleString('en-PK')}\n\n`;
    message += `Please confirm availability. Thank you!`;
    
    return `https://wa.me/${settings.contact?.whatsapp?.replace(/\D/g, '') || '923001234567'}?text=${encodeURIComponent(message)}`;
  }
};

// ── WISHLIST ────────────────────────────────────────────
const Wishlist = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('pmh_wishlist')) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem('pmh_wishlist', JSON.stringify(items));
    updateAllBadges();
    this.updateHeartIcons();
  },

  toggle(id) {
    const items = this.get();
    const index = items.indexOf(id);

    if (index > -1) {
      items.splice(index, 1);
      this.save(items);
      showToast('Removed from wishlist', 'info');
    } else {
      items.push(id);
      this.save(items);
      showToast('Added to wishlist!', 'success');
    }
  },

  isInList(id) {
    return this.get().includes(id);
  },

  remove(id) {
    const items = this.get().filter(itemId => itemId !== id);
    this.save(items);
    this.renderPanel();
  },

  updateHeartIcons() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      const productId = btn.dataset.id;
      const isActive = this.isInList(productId);
      btn.classList.toggle('active', isActive);
    });
  },

  renderPanel() {
    const panel = document.getElementById('wishlist-panel');
    if (!panel) return;

    const items = this.get();
    const products = window.PMH?.products || [];
    const currency = window.PMH?.settings?.currencySymbol || 'Rs.';

    const wishlistProducts = items.map(id => products.find(p => p.id === id)).filter(Boolean);

    panel.innerHTML = `
      <div class="wishlist-header">
        <h3>Wishlist (${items.length})</h3>
        <button class="cart-close" onclick="Wishlist.close()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="wishlist-items">
        ${wishlistProducts.length === 0 ? `
          <div class="cart-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <p>Your wishlist is empty</p>
          </div>
        ` : wishlistProducts.map(product => {
          const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
          return `
            <div class="wishlist-item">
              <div class="wishlist-item-image">
                <img src="${product.images[0]}" alt="${product.name}">
              </div>
              <div class="wishlist-item-details">
                <div class="wishlist-item-name">${product.name}</div>
                <div class="wishlist-item-price">${currency} ${discountedPrice.toLocaleString('en-PK')}</div>
                <div class="wishlist-item-actions">
                  <button class="btn btn-primary" onclick="Cart.add(window.PMH.products.find(p => p.id === '${product.id}')); Wishlist.close();">
                    Add to Cart
                  </button>
                  <button class="btn btn-secondary" onclick="Wishlist.remove('${product.id}')">Remove</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  open() {
    this.renderPanel();
    document.getElementById('wishlist-panel')?.classList.add('open');
    document.getElementById('wishlist-backdrop')?.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('wishlist-panel')?.classList.remove('open');
    document.getElementById('wishlist-backdrop')?.classList.remove('show');
    document.body.style.overflow = '';
  }
};

// ── COMPARE ─────────────────────────────────────────────
const Compare = {
  get() {
    try {
      const items = JSON.parse(localStorage.getItem('pmh_compare')) || [];
      return items.slice(0, 2);
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem('pmh_compare', JSON.stringify(items.slice(0, 2)));
    this.updateButtonStates();
    if (items.length === 2) {
      this.showStrip();
    } else {
      this.hideStrip();
    }
  },

  toggle(id) {
    const items = this.get();
    const index = items.indexOf(id);

    if (index > -1) {
      items.splice(index, 1);
      this.save(items);
      showToast('Removed from compare', 'info');
    } else if (items.length < 2) {
      items.push(id);
      this.save(items);
      showToast('Added to compare!', 'success');
    } else {
      showToast('Remove one product first (max 2)', 'error');
    }
  },

  isInList(id) {
    return this.get().includes(id);
  },

  clear() {
    this.save([]);
    this.hideStrip();
  },

  updateButtonStates() {
    document.querySelectorAll('[data-compare-btn]').forEach(btn => {
      const productId = btn.dataset.id;
      const isActive = this.isInList(productId);
      btn.classList.toggle('active', isActive);
    });
  },

  showStrip() {
    const strip = document.getElementById('compare-strip');
    if (!strip) return;

    const items = this.get();
    const products = window.PMH?.products || [];

    const compareProducts = items.map(id => products.find(p => p.id === id)).filter(Boolean);

    strip.innerHTML = `
      <div class="compare-strip-inner">
        <div class="compare-items">
          ${compareProducts.map(product => `
            <div class="compare-item">
              <img src="${product.images[0]}" alt="${product.name}">
              <span>${product.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="compare-actions">
          <button class="btn btn-primary" onclick="Compare.showModal()">Compare Now</button>
          <button class="btn btn-secondary" onclick="Compare.clear()">Clear</button>
        </div>
      </div>
    `;

    strip.classList.add('show');
  },

  hideStrip() {
    document.getElementById('compare-strip')?.classList.remove('show');
  },

  showModal() {
    const modal = document.getElementById('compare-modal');
    if (!modal) return;

    const items = this.get();
    const products = window.PMH?.products || [];
    const currency = window.PMH?.settings?.currencySymbol || 'Rs.';

    const compareProducts = items.map(id => products.find(p => p.id === id)).filter(Boolean);

    if (compareProducts.length < 2) return;

    const [p1, p2] = compareProducts;
    const allSpecKeys = [...new Set([...Object.keys(p1.specs || {}), ...Object.keys(p2.specs || {})])];

    modal.innerHTML = `
      <div class="compare-modal-inner">
        <div class="compare-modal-header">
          <h3>Compare Products</h3>
          <button class="compare-modal-close" onclick="Compare.closeModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <table class="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>
                <div class="compare-product-header">
                  <img src="${p1.images[0]}" alt="${p1.name}">
                  <h4>${p1.name}</h4>
                </div>
              </th>
              <th>
                <div class="compare-product-header">
                  <img src="${p2.images[0]}" alt="${p2.name}">
                  <h4>${p2.name}</h4>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price</td>
              <td>
                ${p1.discount ? `<span style="text-decoration:line-through;color:var(--text-muted)">${currency} ${p1.price.toLocaleString('en-PK')}</span><br>` : ''}
                <strong style="color:var(--accent)">${currency} ${(p1.price * (1 - (p1.discount || 0) / 100)).toLocaleString('en-PK')}</strong>
              </td>
              <td>
                ${p2.discount ? `<span style="text-decoration:line-through;color:var(--text-muted)">${currency} ${p2.price.toLocaleString('en-PK')}</span><br>` : ''}
                <strong style="color:var(--accent)">${currency} ${(p2.price * (1 - (p2.discount || 0) / 100)).toLocaleString('en-PK')}</strong>
              </td>
            </tr>
            ${allSpecKeys.map(key => {
              const v1 = p1.specs?.[key] || '-';
              const v2 = p2.specs?.[key] || '-';
              const highlight = v1 !== v2 && v1 !== '-' && v2 !== '-';
              return `
                <tr>
                  <td>${key}</td>
                  <td ${highlight ? 'class="highlight"' : ''}>${v1}</td>
                  <td ${highlight ? 'class="highlight"' : ''}>${v2}</td>
                </tr>
              `;
            }).join('')}
            <tr>
              <td>Actions</td>
              <td>
                <button class="btn btn-primary" onclick="Cart.add(window.PMH.products.find(p => p.id === '${p1.id}')); Compare.closeModal();" style="padding:0.5rem 1rem;font-size:0.85rem;">
                  Add to Cart
                </button>
              </td>
              <td>
                <button class="btn btn-primary" onclick="Cart.add(window.PMH.products.find(p => p.id === '${p2.id}')); Compare.closeModal();" style="padding:0.5rem 1rem;font-size:0.85rem;">
                  Add to Cart
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('compare-modal')?.classList.remove('show');
    document.body.style.overflow = '';
  }
};

// ── BADGE UPDATES ───────────────────────────────────────
function updateAllBadges() {
  const cartCount = Cart.getItemCount();
  const wishlistCount = Wishlist.get().length;

  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = cartCount;
    badge.style.display = cartCount > 0 ? 'flex' : 'none';
  });

  document.querySelectorAll('.wishlist-badge').forEach(badge => {
    badge.textContent = wishlistCount;
    badge.style.display = wishlistCount > 0 ? 'flex' : 'none';
  });
}

// ── EVENT LISTENERS ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close sidebars on backdrop click
  document.getElementById('cart-backdrop')?.addEventListener('click', () => Cart.close());
  document.getElementById('wishlist-backdrop')?.addEventListener('click', () => Wishlist.close());

  // Close compare modal on backdrop click
  document.getElementById('compare-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'compare-modal') Compare.closeModal();
  });

  // ESC key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Cart.close();
      Wishlist.close();
      Compare.closeModal();
    }
  });

  // Initialize
  updateAllBadges();
  Compare.updateButtonStates();
  Wishlist.updateHeartIcons();
  if (Compare.get().length === 2) Compare.showStrip();
});
