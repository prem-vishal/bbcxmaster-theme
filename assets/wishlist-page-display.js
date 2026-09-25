import { Component } from '@theme/component';
import { sectionRenderer } from '@theme/section-renderer';
import { Wishlist } from '@theme/wishlist';

/**
 * Hydrates the wishlist page section with the shopper's actual saved products,
 * fetched via a real /search?q=id:X OR id:Y&type=product request (Section Rendering
 * API) — same real-data technique as recently-viewed-display.js. Re-hydrates live
 * if the shopper removes an item while viewing the page.
 */
export class WishlistPageDisplay extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.#hydrate();
    document.addEventListener('wishlist:change', this.#handleChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('wishlist:change', this.#handleChange);
  }

  #handleChange = () => {
    this.#hydrate();
  };

  async #hydrate() {
    const sectionId = this.getAttribute('section-id');
    if (!sectionId) return;

    const ids = Wishlist.getProducts();
    const searchUrl = window.Theme?.routes?.search_url;
    if (!searchUrl) return;

    const url = new URL(searchUrl, window.location.origin);
    if (ids.length > 0) {
      url.searchParams.set('q', ids.map((/** @type {string} */ id) => `id:${id}`).join(' OR '));
      url.searchParams.set('type', 'product');
    }

    try {
      const html = await sectionRenderer.getSectionHTML(sectionId, false, url);
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const newContent = parsed.getElementById('wishlist-page-section');
      const currentContent = this.querySelector('#wishlist-page-section');

      if (newContent && currentContent) {
        currentContent.replaceWith(newContent);
      }
    } catch (error) {
      // Leave the existing (empty-state) markup in place if the fetch fails.
    }
  }
}

if (!customElements.get('wishlist-page-display')) {
  customElements.define('wishlist-page-display', WishlistPageDisplay);
}
