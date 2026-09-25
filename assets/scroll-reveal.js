/**
 * Progressive scroll-reveal for elements marked with [data-reveal] or [data-reveal-group].
 * Respects prefers-reduced-motion; falls back to fully-visible content if IntersectionObserver
 * or the media query for reduced motion is unavailable.
 */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function revealGroup(root) {
  Array.from(root.children).forEach((child, index) => {
    child.style.setProperty('--reveal-index', String(index));
  });
}

function observe() {
  if (REDUCED_MOTION.matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach((el) => {
      el.classList.add('is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  document.querySelectorAll('[data-reveal-group]').forEach(revealGroup);
  document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach((el) => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observe);
} else {
  observe();
}
