import { Wishlist } from '@theme/wishlist';

/**
 * A self-contained heart-toggle button. Place `<wishlist-button product-id="123">`
 * anywhere (product cards, PDP) — it renders its own icon and stays in sync with
 * every other instance for the same product via the `wishlist:change` event.
 */
export class WishlistButton extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Save to wishlist');

    if (!this.querySelector('svg')) {
      this.innerHTML = `
        <svg viewBox="0 0 24 24" class="wishlist-button__icon" aria-hidden="true">
          <path d="M12 21s-7.5-4.5-10-9.5C.5 7.5 2.5 4 6 4c2 0 3.5 1 4.5 2.5C11.5 5 13 4 15 4c3.5 0 5.5 3.5 4 7.5C16.5 16.5 12 21 12 21z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        </svg>
      `;
    }

    this.#syncState();
    this.addEventListener('click', this.#handleToggle);
    this.addEventListener('keydown', this.#handleKeydown);
    document.addEventListener('wishlist:change', this.#syncState);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleToggle);
    this.removeEventListener('keydown', this.#handleKeydown);
    document.removeEventListener('wishlist:change', this.#syncState);
  }

  #handleToggle = (/** @type {Event} */ event) => {
    event.preventDefault();
    event.stopPropagation();
    const productId = this.getAttribute('product-id');
    if (!productId) return;
    Wishlist.toggle(productId);
  };

  /** @param {KeyboardEvent} event */
  #handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      this.#handleToggle(event);
    }
  };

  #syncState = () => {
    const productId = this.getAttribute('product-id');
    const isSaved = productId ? Wishlist.has(productId) : false;
    this.classList.toggle('is-active', isSaved);
    this.setAttribute('aria-pressed', String(isSaved));
  };
}

if (!customElements.get('wishlist-button')) {
  customElements.define('wishlist-button', WishlistButton);
}
