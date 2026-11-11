// shop-board cart review — audit a cart already in the store: click to mark for removal, Apply removes them.
// Paste into javascript_tool on any page of the store. WooCommerce (parses /cart/) or Shopify (/cart.js).
// Marks and a change log persist in localStorage, so a reload or closed tab loses nothing.
// Optional before injecting: window.__cartReview = { title, cats: [['Label', /regex/i], …] }  (last entry a catch-all)
(async () => {
  document.getElementById('cart-review')?.remove();
  const cfg = window.__cartReview || {};
  const money = n => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cats = cfg.cats || [ // first match wins, so the specific groups come before the broad ones
    ['Intimates', /lingerie|bralette|\bbra\b|panty|panties|thong|brief|garter|teddy|chemise|bloomer|underwear/i],
    ['Socks & tights', /sock|stocking|tights/i],
    ['Lounge & sleep', /lounge|sleep|pajama|robe|slipper/i],
    ['Shoes', /shoe|boot|heel|sneaker|platform|sandal|loafer/i],
    ['Outerwear', /jacket|coat|puffer|blazer|vest\b|parka/i],
    ['Dresses & sets', /dress|romper|jumpsuit|onesie|overall|\bset\b/i],
    ['Tops', /\btop\b|tee\b|t-shirt|tank|cami|shirt|blouse|sweater|cardigan|hoodie|crop|corset|bodysuit/i],
    ['Bottoms', /skirt|skort|shorts?\b|\bpants?\b|jean|legging|trouser/i],
    ['Bags & accessories', /bag|wallet|jewel|necklace|earring|hat|cap\b|belt|hair|scarf|glove/i],
    ['Other', /./],
  ];
  const catOf = s => cats.find(([, re]) => re.test(s))[0];

  // ---- adapters ----
  const shopify = !!window.Shopify || (await fetch('/cart.js').then(r => r.ok && r.headers.get('content-type')?.includes('json')).catch(() => false));
  let items, removeMany; // removeMany(list, onProgress(n)) → the items still in the cart
  if (shopify) {
    const cart = await (await fetch('/cart.js', { cache: 'no-store' })).json();
    items = cart.items.map(i => ({ key: i.key, name: i.product_title, size: i.variant_title || '', url: i.url, img: i.image, price: i.final_line_price / 100, cat: catOf(`${i.product_type} ${i.product_title}`) }));
    removeMany = async (list, progress) => { // /cart/update.js takes every line at once
      const r = await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: Object.fromEntries(list.map(i => [i.key, 0])) }) });
      progress(list.length);
      if (!r.ok) return list;
      const left = new Set((await r.json()).items.map(i => i.key));
      return list.filter(i => left.has(i.key));
    };
  } else {
    const readDoc = async () => new DOMParser().parseFromString(await (await fetch('/cart/?r=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' })).text(), 'text/html');
    const keyOf = rm => rm?.dataset.cart_item_key || new URL(rm.href, location.href).searchParams.get('remove_item');
    items = [...(await readDoc()).querySelectorAll('tr.cart_item')].map(tr => {
      const a = tr.querySelector('.product-name a');
      const full = (a?.textContent || tr.querySelector('.product-name')?.textContent || '').trim();
      const m = full.match(/ - ([^-]+)$/);
      const name = m ? full.slice(0, m.index) : full;
      const img = tr.querySelector('.product-thumbnail img');
      return { key: keyOf(tr.querySelector('a.remove')), name, size: m?.[1]?.trim() || '', url: a?.href, img: img?.dataset.src || img?.dataset.lazySrc || img?.getAttribute('src'),
        price: parseFloat((tr.querySelector('.product-subtotal .amount, .product-price .amount')?.textContent || '0').replace(/[^0-9.]/g, '')), cat: catOf(name) };
    });
    // The cart's own "Update cart" form zeroes several lines per request. Every WooCommerce write re-totals
    // the whole cart: one-at-a-time is slow on a big cart and one giant request 502s. Chunks of 6, halving on any non-200.
    const readCart = async () => { const d = await readDoc(); return { nonce: d.querySelector('[name=woocommerce-cart-nonce]')?.value, keys: new Set([...d.querySelectorAll('tr.cart_item a.remove')].map(keyOf)) }; };
    removeMany = async (list, progress) => {
      let { nonce, keys } = await readCart();
      let todo = list.filter(i => keys.has(i.key)), size = 6, strikes = 0;
      while (todo.length && strikes < 6) {
        const chunk = todo.slice(0, size), fd = new FormData();
        chunk.forEach(i => fd.append(`cart[${i.key}][qty]`, '0'));
        fd.append('woocommerce-cart-nonce', nonce); fd.append('_wp_http_referer', '/cart/'); fd.append('update_cart', 'Update cart');
        const r = await fetch('/cart/', { method: 'POST', body: fd, credentials: 'same-origin' }).catch(() => ({ status: 0 }));
        if (r.status === 200) { todo = todo.slice(chunk.length); progress(list.length - todo.length); strikes = 0; continue; }
        size = Math.max(1, size >> 1); strikes++;
        ({ nonce, keys } = await readCart()); todo = todo.filter(i => keys.has(i.key)); // a 502 may still have landed
      }
      ({ keys } = await readCart());
      return list.filter(i => keys.has(i.key));
    };
  }

  // ---- state + change log ----
  const LS = 'cartReview:' + location.host, LOG = LS + ':log';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
  let log = []; try { log = JSON.parse(localStorage.getItem(LOG) || '[]'); } catch {}
  const state = Object.fromEntries(items.map(i => [i.key, saved[i.key] ?? true]));
  const persist = () => { try { localStorage.setItem(LS, JSON.stringify(state)); localStorage.setItem(LOG, JSON.stringify(log.slice(0, 300))); } catch {} };
  persist();
  const byKey = Object.fromEntries(items.map(i => [i.key, i]));
  let active = 'All', view = 'all';
  const sticky = new Set(); // clicked since the last tab/category switch: stays on screen so nothing vanishes under the cursor
  const setMany = (list, keep, label) => {
    const changed = list.filter(i => state[i.key] !== keep);
    if (!changed.length) return;
    changed.forEach(i => { state[i.key] = keep; sticky.add(i.key); });
    log.unshift({ at: Date.now(), keep, keys: changed.map(i => i.key), label: label || changed[0].name });
    persist(); toast(log[0]);
  };

  // ---- ui (shadcn zinc, compact; follows system light/dark) ----
  const host = document.createElement('div'); host.id = 'cart-review';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647';
  document.documentElement.appendChild(host); // after <body>: same-z cookie banners don't sit on top
  const root = host.attachShadow({ mode: 'open' });
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  root.innerHTML = `<style>
:host{all:initial;color-scheme:light;
  --background:#fff;--foreground:#09090b;--muted:#f4f4f5;--muted-fg:#71717a;--border:#e4e4e7;--ring:#a1a1aa;
  --primary:#18181b;--primary-fg:#fafafa;--secondary:#f4f4f5;--overlay:rgba(255,255,255,.85);--danger:#dc2626}
@media (prefers-color-scheme:dark){:host{color-scheme:dark;
  --background:#09090b;--foreground:#fafafa;--muted:#27272a;--muted-fg:#a1a1aa;--border:#27272a;--ring:#52525b;
  --primary:#fafafa;--primary-fg:#18181b;--secondary:#27272a;--overlay:rgba(9,9,11,.8);--danger:#f87171}}
*{box-sizing:border-box;margin:0}
.wrap{position:fixed;inset:0;background:var(--background);color:var(--foreground);font:13px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.scroller{position:absolute;inset:0;overflow:auto;padding:22px 28px 100px}
.page{max-width:1320px;margin:0 auto}
.top{display:flex;align-items:center;gap:12px}
h1{font-size:18px;font-weight:600;letter-spacing:-.02em}
h1 small{font-size:12.5px;font-weight:400;color:var(--muted-fg);margin-left:8px;letter-spacing:0}
.x{margin-left:auto;height:26px;width:26px;display:grid;place-items:center;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--muted-fg);font-size:14px;cursor:pointer}
.x:hover{background:var(--muted);color:var(--foreground)}
.sub{color:var(--muted-fg);font-size:12.5px;margin-top:2px}
.tools{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap}
.seg{display:inline-flex;gap:2px;padding:3px;border-radius:7px;background:var(--muted)}
.seg button{border:0;background:none;padding:3px 10px;border-radius:5px;font-size:12px;font-weight:500;font-family:inherit;color:var(--muted-fg);cursor:pointer}
.seg button.on{background:var(--background);color:var(--foreground);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.link{border:0;background:none;color:var(--muted-fg);font-size:12px;font-family:inherit;cursor:pointer;padding:3px 6px;text-decoration:underline;text-underline-offset:3px}
.link:hover{color:var(--foreground)}
.chips{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--border)}
.chip{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:6px;border:1px solid var(--border);background:var(--background);color:var(--foreground);font-size:12px;font-weight:500;font-family:inherit;cursor:pointer}
.chip:hover{background:var(--muted)}
.chip b{font-weight:500;font-size:10.5px;line-height:1;padding:2px 5px;border-radius:999px;background:var(--secondary);color:var(--muted-fg);font-variant-numeric:tabular-nums}
.chip.on{background:var(--primary);color:var(--primary-fg);border-color:var(--primary)}.chip.on b{background:rgba(127,127,127,.25);color:inherit}
.grid{padding-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:max-content;gap:18px 12px}
.card{cursor:pointer;position:relative;display:flex;flex-direction:column;transition:opacity .2s;content-visibility:auto;contain-intrinsic-size:auto 300px}
.ph{position:relative;border-radius:8px;overflow:hidden;border:1px solid var(--border);background:var(--muted)}
.card:hover .ph{border-color:var(--ring)}
.card img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;display:block;transition:filter .2s}
.meta{padding:7px 1px 0}
.nm{font-size:12.5px;line-height:1.3;max-height:2.6em;overflow:hidden}
.row{display:flex;justify-content:space-between;gap:8px;margin-top:1px;font-size:12px;color:var(--muted-fg)}
.row b{color:var(--foreground);font-weight:500;font-variant-numeric:tabular-nums}
.when{font-size:11px;color:var(--muted-fg);margin-top:2px}
.mark{position:absolute;top:8px;right:8px;width:15px;height:15px;border-radius:4px;border:1px solid var(--primary);background:var(--primary);display:grid;place-items:center;font-size:10px;font-weight:600;color:var(--primary-fg)}
.open{position:absolute;top:8px;left:8px;height:22px;display:flex;align-items:center;padding:0 8px;border-radius:6px;border:1px solid var(--border);background:var(--overlay);color:var(--foreground);font-size:11px;font-weight:500;text-decoration:none;opacity:0;transition:opacity .15s}
.card:hover .open{opacity:1}
.card.off{opacity:.45}
.card.off img{filter:grayscale(1)}
.card.off .mark{background:var(--background);border-color:var(--danger);color:var(--danger)}
.card.off .nm{text-decoration:line-through}
footer{position:absolute;left:50%;transform:translateX(-50%);bottom:16px;width:min(620px,calc(100% - 32px));border-radius:10px;border:1px solid var(--border);background:var(--background);
  padding:5px 5px 5px 14px;display:flex;align-items:center;gap:14px;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)}
.stat{font-size:12px;color:var(--muted-fg);white-space:nowrap}.stat b{color:var(--foreground);font-weight:600;font-size:12.5px;margin-right:3px;font-variant-numeric:tabular-nums}
.toast{font-size:12px;color:var(--muted-fg);min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity .2s}
.toast.on{opacity:1}
.toast button{border:0;background:none;color:var(--foreground);font-weight:600;font-size:12px;font-family:inherit;cursor:pointer;margin-left:4px;text-decoration:underline;text-underline-offset:3px}
.apply{margin-left:auto;flex:none;height:28px;padding:0 12px;border-radius:6px;border:0;background:var(--primary);color:var(--primary-fg);font-size:12.5px;font-weight:500;font-family:inherit;cursor:pointer}
.apply:hover{opacity:.9}.apply:disabled{opacity:.5;cursor:default}
.empty{grid-column:1/-1;text-align:center;color:var(--muted-fg);padding:60px 0}
</style>
<div class="wrap"><div class="scroller"><div class="page">
 <div class="top"><h1>${esc(cfg.title || 'Your cart')}<small></small></h1><button class="x" title="Close">×</button></div>
 <div class="sub">Click to remove · click again to keep · View opens the product · nothing leaves the cart until Apply</div>
 <div class="tools"><div class="seg"><button data-v="all" class="on">All</button><button data-v="keep">Keeping</button><button data-v="off">Removing</button><button data-v="recent">Recent</button></div><button class="link" data-a="keep">Keep all here</button><button class="link" data-a="off">Remove all here</button></div>
 <div class="chips"></div>
 <div class="grid"></div>
</div></div>
<footer><div class="stat"><b class="k"></b>keeping</div><div class="stat"><b class="t"></b>total</div><div class="stat"><b class="r"></b>to remove</div><div class="toast"><span></span><button class="undo">Undo</button></div><button class="apply">Apply</button></footer></div>`;
  const $ = s => root.querySelector(s);
  const thumb = src => /cdn\.shopify\.com|\/cdn\/shop\//.test(src || '') ? src + (src.includes('?') ? '&' : '?') + 'width=400' : src; // CDN resizes on the fly
  $('h1 small').textContent = `${items.length} items`;
  let toastTimer;
  function toast(entry) {
    const n = entry.keys.length;
    $('.toast span').textContent = `${entry.keep ? 'Kept' : 'Removing'} ${n > 1 ? n + ' items' : entry.label}`;
    $('.toast').classList.add('on'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('.toast').classList.remove('on'), 7000);
  }
  const recentOrder = () => { const seen = new Map(); for (const e of log) for (const k of e.keys) if (!seen.has(k) && byKey[k]) seen.set(k, e.at); return seen; };
  const ago = t => { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? `${Math.round(s / 60)} min ago` : `${Math.round(s / 3600)} h ago`; };
  const inCat = i => active === 'All' || i.cat === active;
  const visible = () => view === 'recent'
    ? [...recentOrder().keys()].map(k => byKey[k]).filter(i => i && inCat(i))
    : items.filter(i => inCat(i) && (view === 'all' || sticky.has(i.key) || (view === 'keep') === state[i.key]));
  function render() {
    const names = ['All', ...cats.map(c => c[0]).filter(c => items.some(i => i.cat === c))];
    $('.chips').innerHTML = names.map(n => { const g = items.filter(i => n === 'All' || i.cat === n); return `<button class="chip ${n === active ? 'on' : ''}" data-c="${esc(n)}">${esc(n)}<b>${g.filter(i => state[i.key]).length}/${g.length}</b></button>`; }).join('');
    const top = $('.scroller').scrollTop, rec = view === 'recent' ? recentOrder() : null;
    const vis = visible();
    $('.grid').innerHTML = vis.length ? vis.map(i => `<div class="card ${state[i.key] ? '' : 'off'}" data-k="${esc(i.key)}"><div class="ph"><img loading="lazy" decoding="async" src="${esc(thumb(i.img))}"><a class="open" href="${esc(i.url)}" target="_blank" title="Open product">View</a><div class="mark">${state[i.key] ? '✓' : '×'}</div></div><div class="meta"><div class="nm">${esc(i.name)}</div><div class="row"><span>${esc(i.size)}</span><b>${money(i.price)}</b></div>${rec ? `<div class="when">${state[i.key] ? 'kept' : 'removing'} · ${ago(rec.get(i.key))}</div>` : ''}</div></div>`).join('') : `<div class="empty">${view === 'recent' ? 'No changes yet' : 'Nothing here'}</div>`;
    $('.scroller').scrollTop = top;
    const kept = items.filter(i => state[i.key]);
    $('.k').textContent = kept.length; $('.t').textContent = money(kept.reduce((s, i) => s + i.price, 0)); $('.r').textContent = items.length - kept.length;
    $('.apply').disabled = items.length === kept.length;
  }
  root.addEventListener('click', async e => {
    const t = e.target.closest('button,.card'); if (!t || e.target.closest('.open')) return;
    if (t.classList.contains('x')) return host.remove();
    if (t.classList.contains('undo')) {
      const last = log.shift(); if (!last) return;
      last.keys.forEach(k => { if (k in state) { state[k] = !last.keep; sticky.add(k); } });
      persist(); $('.toast').classList.remove('on'); return render();
    }
    if (t.dataset.c) { active = t.dataset.c; sticky.clear(); return render(); }
    if (t.dataset.v) { view = t.dataset.v; sticky.clear(); root.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b === t)); return render(); }
    if (t.dataset.a) { setMany(items.filter(inCat), t.dataset.a === 'keep', active === 'All' ? 'everything' : active); return render(); }
    if (t.dataset.k) { const i = byKey[t.dataset.k]; setMany([i], !state[i.key]); return render(); }
    if (t.classList.contains('apply')) {
      // Marks clear only for items confirmed gone, so an interrupted Apply loses nothing.
      const gone = items.filter(i => !state[i.key]);
      t.disabled = true; t.textContent = `Removing 0/${gone.length}…`;
      const failed = await removeMany(gone, n => { t.textContent = `Removing ${n}/${gone.length}…`; }).catch(() => gone);
      for (const i of gone) if (!failed.includes(i)) { items.splice(items.indexOf(i), 1); delete state[i.key]; delete byKey[i.key]; }
      persist(); render(); $('h1 small').textContent = `${items.length} items`;
      t.textContent = failed.length ? `${failed.length} didn't remove` : 'Done';
      window.__cartReviewFailed = failed.map(i => i.name);
      setTimeout(() => { t.textContent = 'Apply'; render(); }, 2200);
    }
  });
  render();
  window.__cartLoaded = `${items.length} items (${shopify ? 'shopify' : 'woocommerce'})`;
})();
