/* Global JavaScript for Zen Ring Theme */

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.onCartDrawerClick.bind(this));
  }

  onCartDrawerClick(event) {
    if (event.target.classList.contains('cart-close') || event.target.classList.contains('cart-overlay')) {
      this.close();
    }
  }

  open() {
    this.classList.add('open');
    document.body.classList.add('cart-drawer-open');
  }

  close() {
    this.classList.remove('open');
    document.body.classList.remove('cart-drawer-open');
  }
}

customElements.define('cart-drawer', CartDrawer);

// Cart functionality
class Cart {
  constructor() {
    this.items = this.getCartFromStorage();
    this.updateCartUI();
  }

  getCartFromStorage() {
    const cart = localStorage.getItem('zen-ring-cart');
    return cart ? JSON.parse(cart) : [];
  }

  saveCartToStorage() {
    localStorage.setItem('zen-ring-cart', JSON.stringify(this.items));
  }

  addItem(productId, variantId, quantity = 1, properties = {}) {
    const existingItem = this.items.find(item => item.variantId === variantId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        productId,
        variantId,
        quantity,
        properties,
        timestamp: Date.now()
      });
    }
    
    this.saveCartToStorage();
    this.updateCartUI();
    this.showCartNotification('Produit ajouté au panier !');
  }

  removeItem(variantId) {
    this.items = this.items.filter(item => item.variantId !== variantId);
    this.saveCartToStorage();
    this.updateCartUI();
  }

  updateQuantity(variantId, quantity) {
    const item = this.items.find(item => item.variantId === variantId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(variantId);
      } else {
        item.quantity = quantity;
        this.saveCartToStorage();
        this.updateCartUI();
      }
    }
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const count = this.getItemCount();
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
}

// Initialize cart
const cart = new Cart();

// Product form handling
document.addEventListener('DOMContentLoaded', function() {
  // Handle product form submissions
  const productForms = document.querySelectorAll('form[action*="/cart/add"]');
  productForms.forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = new FormData(form);
      const variantId = formData.get('id');
      const quantity = parseInt(formData.get('quantity') || 1);
      
      // Add to cart
      cart.addItem(null, variantId, quantity);
      
      // Open cart drawer
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
        cartDrawer.open();
      }
    });
  });

  // Handle cart icon clicks
  const cartIcons = document.querySelectorAll('.cart-icon');
  cartIcons.forEach(icon => {
    icon.addEventListener('click', function() {
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
        cartDrawer.open();
      }
    });
  });

  // Handle quantity changes
  const quantityButtons = document.querySelectorAll('[data-quantity-change]');
  quantityButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.parentNode.querySelector('input[name="quantity"]');
      const change = parseInt(this.dataset.quantityChange);
      const currentValue = parseInt(input.value);
      const newValue = Math.max(1, currentValue + change);
      input.value = newValue;
    });
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Lazy loading for images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // Newsletter form handling
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      // Add newsletter signup logic here
      alert('Merci pour votre inscription !');
    });
  });
});

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Expose global functions
window.ZenRing = {
  cart,
  debounce,
  throttle
};