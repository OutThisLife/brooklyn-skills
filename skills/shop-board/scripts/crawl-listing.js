// shop-board listing crawler — for stores that aren't Shopify. Walks a listing's pages and leaves
// window.__items = [{ t, h, img, price, type }] for board.js shortlist mode (window.__board.items = window.__items).
// Paste into javascript_tool on the store. Runs in the background; poll window.__crawl.
// Set first (WooCommerce defaults shown; inspect one card and adjust for anything else):
//   window.__crawlCfg = {
//     start: '/shop/',                         first listing page
//     page: n => `/shop/page/${n}/`,           URL of page n (n ≥ 2)
//     card: 'li.product, .product-small.product',
//     link: 'a[href]', title: '.woocommerce-loop-product__title, .product-title, h2',
//     price: '.price ins .amount, .price .amount', img: 'img',
//     maxPages: 200, parallel: 8,
//   }
(() => {
  const c = Object.assign({ start: '/shop/', page: n => `/shop/page/${n}/`, card: 'li.product, .product-small.product', link: 'a[href]',
    title: '.woocommerce-loop-product__title, .product-title, h2', price: '.price ins .amount, .price .amount', img: 'img', maxPages: 200, parallel: 8 }, window.__crawlCfg || {});
  const job = (window.__crawl = { phase: 'crawl', pages: 0, items: 0 });
  const strip = u => (u || '').replace(/[?#].*$/, '');
  const seen = new Set(), items = [];
  const parse = html => {
    const d = new DOMParser().parseFromString(html, 'text/html'); let added = 0;
    for (const el of d.querySelectorAll(c.card)) {
      const a = el.querySelector(c.link); const h = strip(a?.getAttribute('href'));
      const t = (el.querySelector(c.title)?.textContent || a?.textContent || '').replace(/\s+/g, ' ').trim();
      if (!h || !t || seen.has(h)) continue;
      seen.add(h); added++;
      const im = el.querySelector(c.img);
      const src = im?.dataset.src || im?.getAttribute('data-lazy-src') || im?.getAttribute('src') || '';
      items.push({ t, h, img: src.startsWith('//') ? 'https:' + src : src, price: (el.querySelector(c.price)?.textContent || '').replace(/[^0-9.]/g, ''), type: '' });
    }
    return added;
  };
  (async () => {
    parse(await (await fetch(c.start)).text()); job.pages = 1;
    // Past the last page some themes return 404, others a 200 with an empty grid; both end the crawl.
    for (let n = 2; n <= c.maxPages; n += c.parallel) {
      const texts = await Promise.all(Array.from({ length: c.parallel }, (_, k) => fetch(c.page(n + k)).then(r => (r.ok ? r.text() : '')).catch(() => '')));
      const added = texts.map(t => (t ? parse(t) : 0));
      job.pages += texts.filter(Boolean).length; job.items = items.length;
      if (added.some(a => a === 0)) break;
    }
    window.__items = items; job.items = items.length; job.phase = 'done';
  })().catch(e => { job.phase = 'error'; job.error = String(e); });
  return 'crawling…';
})();
