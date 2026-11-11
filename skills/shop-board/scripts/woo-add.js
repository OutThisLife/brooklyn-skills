// shop-board WooCommerce add-to-cart — adds a list of products one at a time, in a size, then checks the cart.
// Paste into javascript_tool on the store. Runs in the background; poll JSON.stringify(window.__job).
// Set first: window.__add = { urls: [...productUrls], sizes: ['XS','S'], prefer: /black/i, delayMs: 800 }
// sizes are tried in order (omit for "first in stock"); a product with none of them in stock is skipped.
(() => {
  const { urls, sizes = [], prefer = null, delayMs = 800 } = window.__add;
  const sizeRe = /^(xxs|xs|s|m|l|xl|xxl|xxxl|xxxxl|\d+x?l|one size|free size|x-?small|small|medium|large)$/i;
  const job = (window.__job = { phase: 'resolving', done: 0, total: urls.length, skipped: [], failed: [] });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const rank = v => {
    let s = 0;
    for (const val of Object.values(v.attributes)) {
      const i = sizes.findIndex(z => norm(z) === norm(val));
      if (i >= 0) s += 1000 - i * 10;
      else if (sizes.length && sizeRe.test(val)) s -= 1000; // a size we don't want
      else if (prefer?.test(val)) s += 5;
    }
    return s;
  };
  const form = it => {
    const fd = new FormData(); fd.append('quantity', '1'); fd.append('add-to-cart', it.pid);
    if (it.vid) { fd.append('product_id', it.pid); fd.append('variation_id', it.vid); for (const [k, v] of Object.entries(it.attrs)) fd.append(k, v); }
    return fd;
  };
  const cartUrls = async () => [...new DOMParser().parseFromString(await (await fetch('/cart/?r=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' })).text(), 'text/html')
    .querySelectorAll('tr.cart_item .product-name a')].map(a => a.href.replace(/\?.*/, ''));
  (async () => {
    const items = [];
    for (let k = 0; k < urls.length; k += 15) {
      await Promise.all(urls.slice(k, k + 15).map(async url => {
        const d = new DOMParser().parseFromString(await (await fetch(url)).text(), 'text/html');
        const f = d.querySelector('form.variations_form');
        const name = d.querySelector('h1')?.textContent.trim() || url;
        if (f) {
          // data-product_variations is false when variations load by ajax; open that product by hand.
          const vars = JSON.parse(f.dataset.product_variations || 'false');
          if (!vars) return job.skipped.push(name + ' (variations load via ajax)');
          const best = vars.filter(v => v.is_in_stock).sort((a, b) => rank(b) - rank(a))[0];
          if (!best || rank(best) < 0) return job.skipped.push(name + ' (no wanted size in stock)');
          items.push({ url, name, pid: f.dataset.product_id, vid: best.variation_id, attrs: best.attributes });
        } else {
          const pid = d.querySelector('[name=add-to-cart]')?.value;
          if (!pid || d.querySelector('p.out-of-stock')) return job.skipped.push(name + ' (out of stock)');
          items.push({ url, name, pid });
        }
      }));
    }
    job.phase = 'adding'; job.total = items.length;
    // Sequential with a pause: back-to-back POSTs race the session and silently drop about every other item.
    for (const it of items) {
      await fetch(it.url, { method: 'POST', body: form(it), credentials: 'same-origin' }).catch(() => job.failed.push(it.name));
      job.done++; await sleep(delayMs);
    }
    // Verify against the real cart (cache-busted, or a stale page makes a retry double the item), retry misses once.
    let inCart = await cartUrls();
    for (const it of items.filter(it => !inCart.includes(it.url.replace(/\?.*/, '')))) { await fetch(it.url, { method: 'POST', body: form(it), credentials: 'same-origin' }).catch(() => {}); await sleep(delayMs * 2); }
    inCart = await cartUrls();
    job.failed.push(...items.filter(it => !inCart.includes(it.url.replace(/\?.*/, ''))).map(it => it.name));
    job.cartCount = inCart.length; job.phase = 'done';
  })().catch(e => { job.phase = 'error'; job.error = String(e); });
  return 'started';
})();
