import { Component } from '@theme/component';
import { StandardEvents } from '@shopify/events';
import { formatMoney } from '@theme/money-formatting';

/**
 * Renders "you may also like" suggestions in the cart drawer, based on Shopify's
 * real product recommendations API for the first line item in the cart.
 * Purely a discovery aid (links to the PDP) — does not reimplement add-to-cart.
 */
export class CartUpsell extends Component {
  static get observedAttributes() {
    return ['product-id'];
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(StandardEvents.cartLinesUpdate, this.#handleCartUpdate);
    this.#fetchRecommendations();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(StandardEvents.cartLinesUpdate, this.#handleCartUpdate);
  }

  #handleCartUpdate = () => {
    this.#fetchRecommendations();
  };

  async #fetchRecommendations() {
    const productId = this.getAttribute('product-id');
    if (!productId) {
      this.hidden = true;
      return;
    }

    try {
      const response = await fetch(
        `${window.Shopify?.routes?.root ?? '/'}recommendations/products.json?product_id=${productId}&intent=complementary&limit=4`
      );
      if (!response.ok) throw new Error('Recommendations request failed');

      const { products } = await response.json();
      this.#render(Array.isArray(products) ? products.slice(0, 3) : []);
    } catch (error) {
      this.hidden = true;
    }
  }

  /** @param {number | undefined} cents */
  #formatPrice(cents) {
    if (typeof cents !== 'number') return '';
    const format = this.getAttribute('money-format') || '${{amount}}';
    const currency = this.getAttribute('currency') || 'USD';
    return formatMoney(cents, format, currency);
  }

  /** @param {Array<any>} products */
  #render(products) {
    if (!products.length) {
      this.hidden = true;
      this.innerHTML = '';
      return;
    }

    this.hidden = false;
    this.innerHTML = `
      <p class="cart-upsell__heading">You may also like</p>
      <ul class="cart-upsell__list">
        ${products
          .map(
            (product) => `
              <li class="cart-upsell__item">
                <a href="${escapeHtml(product.url)}" class="cart-upsell__link">
                  ${
                    product.featured_image
                      ? `<img
                          src="${escapeHtml(product.featured_image.url)}"
                          alt="${escapeHtml(product.featured_image.alt || product.title)}"
                          width="64"
                          height="64"
                          loading="lazy"
                          class="cart-upsell__image"
                        >`
                      : ''
                  }
                  <span class="cart-upsell__info">
                    <span class="cart-upsell__title">${escapeHtml(product.title)}</span>
                    <span class="cart-upsell__price">${this.#formatPrice(product.price)}</span>
                  </span>
                </a>
              </li>
            `
          )
          .join('')}
      </ul>
    `;
  }
}

/** @param {string} value */
function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

if (!customElements.get('cart-upsell')) {
  customElements.define('cart-upsell', CartUpsell);
}
