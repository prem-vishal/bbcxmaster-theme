/**
 * Client-side wishlist storage (localStorage-backed, no account/backend required).
 * Dispatches a `wishlist:change` event on `document` whenever the saved list changes,
 * so any `<wishlist-button>` on the page can stay in sync.
 */
export class Wishlist {
  static #STORAGE_KEY = 'wishlistProductIds';

  /** @returns {string[]} */
  static getProducts() {
    try {
      return JSON.parse(localStorage.getItem(this.#STORAGE_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  /** @param {string} productId */
  static has(productId) {
    return this.getProducts().includes(String(productId));
  }

  /** @param {string} productId */
  static add(productId) {
    const products = this.getProducts();
    if (!products.includes(String(productId))) {
      products.unshift(String(productId));
      this.#persist(products);
    }
  }

  /** @param {string} productId */
  static remove(productId) {
    this.#persist(this.getProducts().filter((/** @type {string} */ id) => id !== String(productId)));
  }

  /** @param {string} productId */
  static toggle(productId) {
    if (this.has(productId)) {
      this.remove(productId);
      return false;
    }
    this.add(productId);
    return true;
  }

  /** @param {string[]} products */
  static #persist(products) {
    localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(products));
    document.dispatchEvent(new CustomEvent('wishlist:change', { detail: { products } }));
  }
}
