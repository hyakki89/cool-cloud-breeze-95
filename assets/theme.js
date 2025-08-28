/**
 * Theme JavaScript - Zen Ring
 * Fonctionnalités interactives du thème Shopify
 */

class ZenRingTheme {
  constructor() {
    this.init();
  }

  init() {
    this.initCart();
    this.initQuantityButtons();
    this.initVariantSelectors();
    this.initProductImages();
    this.initCountdownTimer();
    this.initFloatingClouds();
  }

  // Gestion du panier drawer
  initCart() {
    const cartTriggers = document.querySelectorAll('[data-cart-trigger]');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartClose = document.querySelector('.cart-close');

    if (!cartDrawer) return;

    // Ouvrir le panier
    cartTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCart();
      });
    });

    // Fermer le panier
    if (cartClose) {
      cartClose.addEventListener('click', () => this.closeCart());
    }

    if (cartOverlay) {
      cartOverlay.addEventListener('click', () => this.closeCart());
    }

    // Écouter les soumissions de formulaire produit
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.product-form')) {
        e.preventDefault();
        this.addToCart(e.target);
      }
    });
  }

  openCart() {
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Ajouter au panier via AJAX
  async addToCart(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // État de chargement
    submitButton.innerHTML = 'Ajout en cours...';
    submitButton.disabled = true;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        const item = await response.json();
        await this.updateCartDrawer();
        this.openCart();
        this.showNotification('Produit ajouté au panier ✨', 'success');
      } else {
        throw new Error('Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      this.showNotification('Erreur lors de l\'ajout au panier', 'error');
    } finally {
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  }

  // Mettre à jour le contenu du panier drawer
  async updateCartDrawer() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');
      
      if (cartItems) {
        cartItems.innerHTML = this.renderCartItems(cart.items);
      }
      
      if (cartTotal) {
        cartTotal.textContent = this.formatMoney(cart.total_price);
      }

      // Mettre à jour le compteur du panier
      const cartCount = document.querySelector('[data-cart-count]');
      if (cartCount) {
        cartCount.textContent = cart.item_count;
      }
    } catch (error) {
      console.error('Erreur mise à jour panier:', error);
    }
  }

  // Rendu des items du panier
  renderCartItems(items) {
    if (!items || items.length === 0) {
      return '<div class="text-center p-8"><p class="text-gray-600">Votre panier est vide</p></div>';
    }

    return items.map(item => `
      <div class="cart-item flex items-center gap-4 p-4 border-b border-gray-100">
        <img src="${item.featured_image?.url || ''}" alt="${item.product_title}" class="w-16 h-16 object-cover rounded-lg">
        <div class="flex-1">
          <h4 class="font-medium text-gray-800">${item.product_title}</h4>
          ${item.variant_title ? `<p class="text-sm text-gray-600">${item.variant_title}</p>` : ''}
          <div class="flex items-center gap-2 mt-2">
            <button class="quantity-btn" data-line="${item.key}" data-change="-1">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" data-line="${item.key}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold">${this.formatMoney(item.final_line_price)}</p>
          <button class="text-red-500 text-sm hover:underline" data-remove="${item.key}">Supprimer</button>
        </div>
      </div>
    `).join('');
  }

  // Boutons de quantité
  initQuantityButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.quantity-btn')) {
        const line = e.target.dataset.line;
        const change = parseInt(e.target.dataset.change);
        this.updateCartQuantity(line, change);
      }

      if (e.target.matches('[data-remove]')) {
        const line = e.target.dataset.remove;
        this.removeCartItem(line);
      }
    });

    // Boutons quantité sur les pages produit
    document.addEventListener('click', (e) => {
      if (e.target.matches('.quantity-button')) {
        e.preventDefault();
        const change = parseInt(e.target.dataset.change);
        const quantityInput = e.target.parentNode.querySelector('.quantity-input');
        const currentValue = parseInt(quantityInput.value);
        const newValue = Math.max(1, currentValue + change);
        quantityInput.value = newValue;
      }
    });
  }

  // Mettre à jour la quantité d'un item du panier
  async updateCartQuantity(line, change) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          line: line,
          quantity: change
        })
      });

      if (response.ok) {
        await this.updateCartDrawer();
      }
    } catch (error) {
      console.error('Erreur mise à jour quantité:', error);
    }
  }

  // Supprimer un item du panier
  async removeCartItem(line) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          line: line,
          quantity: 0
        })
      });

      if (response.ok) {
        await this.updateCartDrawer();
        this.showNotification('Produit retiré du panier', 'success');
      }
    } catch (error) {
      console.error('Erreur suppression item:', error);
    }
  }

  // Gestion des sélecteurs de variantes
  initVariantSelectors() {
    const variantSelectors = document.querySelectorAll('[data-variant-selector]');
    
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        this.updateVariant(e.target.closest('.product-form'));
      });
    });
  }

  updateVariant(form) {
    if (!form) return;

    const formData = new FormData(form);
    const selectedOptions = {};
    
    // Collecter les options sélectionnées
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('options[')) {
        const optionName = key.match(/\[(.*?)\]/)[1];
        selectedOptions[optionName] = value;
      }
    }

    // Trouver la variante correspondante
    const productData = JSON.parse(form.dataset.product || '{}');
    if (!productData.variants) return;

    const selectedVariant = productData.variants.find(variant => {
      return Object.keys(selectedOptions).every(optionName => {
        const optionIndex = productData.options.indexOf(optionName) + 1;
        return variant[`option${optionIndex}`] === selectedOptions[optionName];
      });
    });

    if (selectedVariant) {
      // Mettre à jour le prix
      this.updatePrice(form, selectedVariant);
      
      // Mettre à jour l'image si nécessaire
      this.updateProductImage(selectedVariant);
      
      // Mettre à jour la disponibilité
      this.updateAvailability(form, selectedVariant);
      
      // Mettre à jour l'input de variante
      const variantInput = form.querySelector('[name="id"]');
      if (variantInput) {
        variantInput.value = selectedVariant.id;
      }
    }
  }

  updatePrice(form, variant) {
    const priceElements = form.querySelectorAll('[data-price]');
    const compareAtPriceElements = form.querySelectorAll('[data-compare-price]');
    
    priceElements.forEach(el => {
      el.textContent = this.formatMoney(variant.price);
    });

    compareAtPriceElements.forEach(el => {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        el.textContent = this.formatMoney(variant.compare_at_price);
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  }

  updateAvailability(form, variant) {
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (variant.available) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.addToCartText || 'Ajouter au panier';
    } else {
      submitButton.disabled = true;
      submitButton.textContent = 'Rupture de stock';
    }
  }

  // Gestion des images produit
  initProductImages() {
    // Changement d'image principale via les miniatures
    document.addEventListener('click', (e) => {
      if (e.target.matches('.product-thumbnail')) {
        const newSrc = e.target.dataset.fullSize || e.target.src;
        const mainImage = document.querySelector('.product-main-image');
        if (mainImage) {
          mainImage.src = newSrc;
        }
        
        // Mettre à jour l'état actif des miniatures
        document.querySelectorAll('.product-thumbnail').forEach(thumb => {
          thumb.classList.remove('active');
        });
        e.target.classList.add('active');
      }
    });
  }

  updateProductImage(variant) {
    if (variant.featured_media && variant.featured_media.preview_image) {
      const mainImage = document.querySelector('.product-main-image');
      if (mainImage) {
        mainImage.src = variant.featured_media.preview_image.url;
      }
    }
  }

  // Compte à rebours animé
  initCountdownTimer() {
    const countdownElement = document.querySelector('[data-countdown]');
    if (!countdownElement) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = now + (24 * 60 * 60 * 1000); // 24h depuis maintenant
      const timeLeft = targetTime - now;

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Effet de nuages flottants dynamiques
  initFloatingClouds() {
    const sections = document.querySelectorAll('.floating-clouds');
    
    sections.forEach(section => {
      // Ajouter des nuages supplémentaires
      for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'floating-cloud';
        cloud.style.cssText = `
          position: absolute;
          width: ${100 + Math.random() * 100}px;
          height: ${50 + Math.random() * 50}px;
          background: rgba(255, 255, 255, ${0.1 + Math.random() * 0.2});
          border-radius: 50%;
          filter: blur(20px);
          pointer-events: none;
          top: ${Math.random() * 80}%;
          left: ${Math.random() * 80}%;
          animation: float ${4 + Math.random() * 4}s ease-in-out infinite;
          animation-delay: ${Math.random() * 2}s;
        `;
        section.appendChild(cloud);
      }
    });
  }

  // Notifications toast
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animer l'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Formater les prix
  formatMoney(price) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price / 100);
  }
}

// Initialiser le thème quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  new ZenRingTheme();
});

// Fonctions utilitaires globales
window.changeMainImage = function(src) {
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.src = src;
  }
};

window.changeQuantity = function(change) {
  const quantityInput = document.getElementById('quantity');
  if (quantityInput) {
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(1, currentValue + change);
    quantityInput.value = newValue;
  }
};