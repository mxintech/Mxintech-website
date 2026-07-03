import '@testing-library/jest-dom/vitest';

/* jsdom lacks a few browser APIs the app uses. */

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

/* Reveal components become visible immediately in tests. */
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    this.callback([{ isIntersecting: true, target: element }], this);
  }

  unobserve() {}

  disconnect() {}
};

window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
