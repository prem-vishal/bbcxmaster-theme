import { Component } from '@theme/component';
import { sectionRenderer } from '@theme/section-renderer';
import { RecentlyViewed } from '@theme/recently-viewed-products';

/**
 * Hydrates a `recently-viewed` section on the page with the shopper's actual
 * recently viewed products, fetched via a real `/search?q=id:X OR id:Y&type=product`
 * request rendered through the Section Rendering API (see sections/recently-viewed.liquid).
 * Excludes the current page's own product, if any.
 */
export class RecentlyViewedDisplay extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.#hydrate();
  }

  async #hydrate() {
    const sectionId = this.getAttribute('section-id');
    if (!sectionId) return;

    const excludeId = this.getAttribute('exclude-product-id');
    let ids = RecentlyViewed.getProducts().filter((/** @type {string} */ id) => id !== excludeId);
    if (ids.length === 0) return;

    const searchUrl = window.Theme?.routes?.search_url;
    if (!searchUrl) return;

    const url = new URL(searchUrl, window.location.origin);
    url.searchParams.set('q', ids.map((/** @type {string} */ id) => `id:${id}`).join(' OR '));
    url.searchParams.set('type', 'product');

    try {
      const html = await sectionRenderer.getSectionHTML(sectionId, false, url);
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const newContent = parsed.getElementById('recently-viewed-section');
      const currentContent = this.querySelector('#recently-viewed-section');

      if (newContent && currentContent) {
        currentContent.replaceWith(newContent);
      }
    } catch (error) {
      // Leave the section hidden (its default empty state) if the fetch fails.
    }
  }
}

if (!customElements.get('recently-viewed-display')) {
  customElements.define('recently-viewed-display', RecentlyViewedDisplay);
}
