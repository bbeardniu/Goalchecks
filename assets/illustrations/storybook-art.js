(() => {
  'use strict';

  const scriptUrl = document.currentScript && document.currentScript.src;
  const assetBase = new URL('./', scriptUrl || document.baseURI);
  const imageCache = new Map();
  let renderId = 0;

  function addStyles() {
    if (document.getElementById('beard-storybook-styles')) return;
    const style = document.createElement('style');
    style.id = 'beard-storybook-styles';
    style.textContent = `
      .beard-storybook-art{display:block;position:relative;aspect-ratio:1;width:100%;overflow:hidden;background-color:#fffdf7;background-repeat:no-repeat;background-size:400% 400%;isolation:isolate;print-color-adjust:exact;-webkit-print-color-adjust:exact}
      .beard-storybook-art.is-transparent{background-color:transparent}
      .beard-storybook-art.is-unavailable{display:grid;place-items:center;padding:1rem;text-align:center;background-image:none!important;color:#5e7482;font:700 .9rem/1.4 "Avenir Next",Avenir,"Segoe UI",sans-serif}
    `;
    document.head.appendChild(style);
  }

  function lookup(key) {
    const manifest = window.BeardStorybookManifest || {};
    const [group, rawIndex] = String(key || '').split(':');
    const names = {picture:'pictureOrder',grade2:'completionGrade2',grade3:'completionGrade3'};
    if (group === 'tool') return manifest.tools && manifest.tools[rawIndex];
    const collection = manifest[names[group]];
    const index = Number(rawIndex) - 1;
    return collection && Number.isInteger(index) && index >= 0 ? collection[index] : undefined;
  }

  function assetUrl(entry) {
    if (!entry) return null;
    const file = entry.file || `storybook-${String(entry.sheet).padStart(2, '0')}.webp`;
    return new URL(file, assetBase).href;
  }

  function loadImage(url) {
    if (!imageCache.has(url)) {
      imageCache.set(url, new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = url;
      }));
    }
    return imageCache.get(url);
  }

  function unavailable(target, alt) {
    target.classList.add('is-unavailable');
    target.style.backgroundImage = 'none';
    target.textContent = 'Picture unavailable.';
    target.setAttribute('aria-label', alt ? `${alt} Picture unavailable.` : 'Picture unavailable.');
  }

  function render(target, key, alt, options = {}) {
    if (!target) return null;
    addStyles();
    const entry = lookup(key);
    const label = alt || (entry && entry.alt) || 'Storybook illustration';
    const token = String(++renderId);
    target.replaceChildren();
    target.classList.add('beard-storybook-art');
    target.classList.remove('is-unavailable');
    target.classList.toggle('is-transparent', Boolean(options.transparent || (entry && entry.transparent)));
    target.setAttribute('role', 'img');
    target.setAttribute('aria-label', label);
    target.dataset.storybookKey = String(key);
    target.dataset.storybookRender = token;
    const columns = entry && entry.columns === 1 ? 1 : 4;
    if (!entry || !Number.isInteger(entry.index) || entry.index < 0 || entry.index >= columns * columns) {
      unavailable(target, label);
      return null;
    }
    const column = entry.index % columns;
    const row = Math.floor(entry.index / columns);
    const url = assetUrl(entry);
    target.style.backgroundImage = `url("${url}")`;
    target.style.backgroundSize = `${columns * 100}% ${columns * 100}%`;
    target.style.backgroundPosition = columns === 1 ? '0% 0%' : `${column / (columns - 1) * 100}% ${row / (columns - 1) * 100}%`;
    loadImage(url).then(loaded => {
      if (!loaded && target.dataset.storybookRender === token) unavailable(target, label);
    });
    return entry;
  }

  window.BeardStorybook = Object.freeze({render, lookup, assetUrl});
})();
