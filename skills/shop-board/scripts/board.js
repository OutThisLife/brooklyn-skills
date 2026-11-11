// shop-board — turn a shop's catalog into a calm, tap-to-pick board grouped by intent.
// Paste into javascript_tool on any page of the store. Follows the system light/dark setting.
//   window.__board = {
//     title, promo,                         header + footer note
//     sizes: ['XS','S'],                    Shopify: keep only what's in stock in these, smallest first (aliases like X-SMALL handled). Omit for every size
//     only: RegExp, onlyLabel: 'cute'       keep only items whose title/type/tags match ("… only" in the request)
//     brands: [['Label','collection-handle']], Shopify house brands to crawl whole + offer as a switch
//     facets: [[label, strong RegExp, weak RegExp, threshold], …]   override the default groups
//     items: [{t,h,img,price,type,tags}]    any non-Shopify site: you crawl, the board shows (shortlist mode)
//     recrawl: true                         ignore the saved crawl
//   }
(() => {
  const cfg = Object.assign({ sizes: [], brands: [], title: location.hostname.replace(/^www\./, ''), promo: '' }, window.__board || {});
  const job = (window.__boardJob = { phase: 'crawl', scanned: 0, kept: 0 });
  const norm = s => String(s).toLowerCase().replace(/[\s\-_.]/g, '');
  const alias = { xxs: ['xxs', 'xxsmall', '2xs'], xs: ['xs', 'xsmall'], s: ['s', 'small'], m: ['m', 'medium'], l: ['l', 'large'], xl: ['xl', 'xlarge'], onesize: ['onesize', 'os', 'o/s'] };
  const want = cfg.sizes.map(norm).flatMap(z => alias[z] || [z]);
  const sizeRank = v => { if (!want.length) return 0; const n = norm(v); const i = want.indexOf(n); return i >= 0 ? i : n.split('/').some(p => want.includes(p)) ? want.length : -1; };
  const isShoe = t => /shoe|boot|heel|sneaker|platform|sandal|loafer|mule|clog/i.test(t);

  // Default groups are intent, not product type. [label, strong (2 pts), weak (1 pt), threshold]
  const facets = cfg.facets || [
    ['Everyday', /tee\b|t-shirt|tank|basic|jeans|denim|cardigan|everyday|essential|casual|overall|shirt\b|polo|chino/i, /cotton|knit|crew|relaxed|classic|straight|button/i, 2],
    ['Going out', /bodycon|cut ?out|backless|club|party|sequin|rhinestone|corset|mini dress|slip dress|satin dress|halter|going out|night out/i, /mini\b|crop|mesh|sheer|lace up|glitter|metallic|satin|velvet/i, 2],
    ['Lounge & sleep', /lounge|sweatpant|sweatshirt|hoodie|pajama|\bpj|sleep|robe|slipper|fleece|cozy|comfy|jogger/i, /sweat|soft|waffle|thermal|knit|fuzzy|plush/i, 2],
    ['Intimates', /lingerie|bralette|\bbra\b|panty|panties|thong|brief|garter|bodysuit|teddy|chemise|bustier/i, /lace|mesh|sheer|satin|silk/i, 2],
    ['Statement', /print|graphic|novelty|costume|cosplay|sequin|faux fur|feather|vinyl|pvc|latex|patent|neon|rhinestone/i, /bold|bright|glitter|metallic|embellish|embroider/i, 2],
    ['Active & swim', /bikini|swim|one-piece|legging|sports bra|active|yoga|tennis|track/i, /athletic|performance|stretch/i, 2],
    ['Outerwear', /jacket|coat|puffer|blazer|trench|vest\b|parka|shacket/i, /outer|layer|quilted|shearling/i, 2],
  ];
  const typeGroups = [['Shoes', t => isShoe(t)], ['Bags & accessories', t => /bag|wallet|jewel|necklace|earring|ring\b|rings|bracelet|hair|headband|hat|cap\b|beanie|sock|tight|belt|accessor|sunglass|scarf|glove|pin\b|patch|keychain|pocket square/i.test(t)]];
  const score = (text, s, w) => (text.match(new RegExp(s, 'gi')) || []).length * 2 + (text.match(new RegExp(w, 'gi')) || []).length;

  // the crawl is size-filtered, so it's cached per host + sizes; picks are per host
  const HOST = 'shopBoard:' + location.host, LS = HOST + (want.length ? ':' + want.join(',') : ':all');
  let st = {}; try { st = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
  st.items ||= {}; st.prog ||= {};
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) { job.lsErr = String(e); } };

  // Shopify crawl: house brands whole, then the full feed. products.json stops at page 100 (25k),
  // so /collections/all (different order) is crawled too and merged by id. Progress persists across tab closes.
  const crawl = async () => {
    const srcs = [...cfg.brands.map(([name, h]) => [`/collections/${h}/products.json?limit=250&page=`, name]),
      ['/products.json?limit=250&page=', null], ['/collections/all/products.json?limit=250&page=', null]];
    for (const [base, brand] of srcs) {
      for (let p = (st.prog[base] || 0) + 1; p <= 100; p++) {
        let j; try { j = await (await fetch(base + p)).json(); } catch { break; }
        if (!j.products?.length) { st.prog[base] = 999; break; }
        for (const x of j.products) {
          job.scanned++;
          const prev = st.items[x.id]; if (prev) { if (brand) prev.brand ||= brand; continue; }
          const si = (x.options || []).findIndex(o => /size/i.test(o.name));
          const ok = x.variants.filter(v => v.available && (si < 0 || isShoe(x.product_type) || sizeRank(v['option' + (si + 1)]) >= 0));
          if (!ok.length) continue;
          st.items[x.id] = { t: x.title, h: x.handle, type: x.product_type, img: (x.images?.[0]?.src || '').replace(/^\/\//, 'https://'), price: ok[0].price, brand: brand || '', vendor: x.vendor, tags: (x.tags || []).join(' ').slice(0, 300) };
        }
        st.prog[base] = p; job.kept = Object.keys(st.items).length; save();
      }
    }
    job.phase = 'board'; show();
  };

  function show() {
    document.getElementById('shop-board')?.remove();
    const order = [...facets.map(f => f[0]), ...typeGroups.map(g => g[0]), 'Everything else'];
    const items = Object.entries(st.items).filter(([, i]) => !cfg.only || cfg.only.test(`${i.t} ${i.type} ${i.tags || ''}`)).map(([id, i]) => {
      const text = `${i.t} ${i.type} ${i.tags || ''}`, tags = {};
      for (const [n, s, w, th] of facets) { const sc = score(text, s, w); if (sc >= th) tags[n] = sc; }
      for (const [n, f] of typeGroups) if (f(`${i.type} ${i.t}`)) tags[n] = 1;
      if (!Object.keys(tags).length) tags['Everything else'] = 1;
      return { id, ...i, tags };
    });
    const PK = HOST + ':picks'; let picks = {}; try { picks = JSON.parse(localStorage.getItem(PK) || '{}'); } catch {}
    const savePicks = () => { try { localStorage.setItem(PK, JSON.stringify(picks)); } catch {} };
    const brands = [...new Set(items.map(i => i.brand).filter(Boolean))];
    const host = document.createElement('div'); host.id = 'shop-board';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647';
    document.documentElement.appendChild(host); // after <body>: same-z cookie banners don't sit on top
    const root = host.attachShadow({ mode: 'open' });
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    root.innerHTML = `<style>
/* shadcn/ui zinc tokens */
:host{all:initial;color-scheme:light;
  --background:#fff;--foreground:#09090b;--muted:#f4f4f5;--muted-fg:#71717a;--border:#e4e4e7;--ring:#a1a1aa;
  --primary:#18181b;--primary-fg:#fafafa;--secondary:#f4f4f5;--card:#fff;--radius:10px;--overlay:rgba(255,255,255,.85)}
@media (prefers-color-scheme:dark){:host{color-scheme:dark;
  --background:#09090b;--foreground:#fafafa;--muted:#27272a;--muted-fg:#a1a1aa;--border:#27272a;--ring:#52525b;
  --primary:#fafafa;--primary-fg:#18181b;--secondary:#27272a;--card:#0c0c0e;--overlay:rgba(9,9,11,.8)}}
*{box-sizing:border-box;margin:0}
.wrap{position:fixed;inset:0;background:var(--background);color:var(--foreground);font:14px/1.45 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
.scroller{position:absolute;inset:0;overflow:auto;padding:32px 32px 120px}
.window{max-width:1320px;margin:0 auto}
.titlebar{display:flex;align-items:center;gap:12px}
h1{font-size:24px;font-weight:600;letter-spacing:-.025em;line-height:1.2}
h1 small{font-size:14px;font-weight:400;color:var(--muted-fg);margin-left:10px;letter-spacing:0}
.lights{margin-left:auto}
.x{height:32px;width:32px;display:grid;place-items:center;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--muted-fg);font-size:16px;line-height:1;cursor:pointer;
  box-shadow:0 1px 2px rgba(0,0,0,.05)}
.x:hover{background:var(--muted);color:var(--foreground)}
.toolbar{margin-top:4px}
.sub{color:var(--muted-fg);font-size:14px}
.seg{display:inline-flex;align-items:center;gap:2px;margin-top:18px;padding:4px;border-radius:9px;background:var(--muted)}
.seg button{border:0;background:none;padding:6px 12px;border-radius:6px;font-size:13px;font-weight:500;font-family:inherit;color:var(--muted-fg);cursor:pointer;transition:all .15s}
.seg button:hover{color:var(--foreground)}
.seg button.on{background:var(--background);color:var(--foreground);box-shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06)}
.chips{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--border)}
.chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--background);color:var(--foreground);
  font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.05);transition:background .15s,border-color .15s}
.chip:hover{background:var(--muted)}
.chip:focus-visible,.seg button:focus-visible,.go:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
.chip b{font-weight:500;font-size:11px;line-height:1;padding:3px 6px;border-radius:999px;background:var(--secondary);color:var(--muted-fg);font-variant-numeric:tabular-nums}
.chip.on{background:var(--primary);color:var(--primary-fg);border-color:var(--primary)}
.chip.on b{background:rgba(127,127,127,.25);color:inherit}
.chip.dim{color:var(--muted-fg)}
.chip.dim.on{color:var(--primary-fg)}
.grid{padding:24px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));grid-auto-rows:max-content;gap:24px 16px;align-content:start}
.card{cursor:pointer;position:relative;display:flex;flex-direction:column}
.ph{position:relative;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);background:var(--muted);transition:border-color .15s,box-shadow .15s}
.card:hover .ph{border-color:var(--ring)}
.card img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;display:block}
.meta{padding:10px 2px 0}
.nm{font-size:14px;font-weight:500;line-height:1.35;max-height:2.7em;overflow:hidden}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:2px;font-size:13px;color:var(--muted-fg)}
.row b{color:var(--foreground);font-weight:600;font-variant-numeric:tabular-nums}
.vb{font-size:12px;margin-top:4px;color:var(--muted-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{position:absolute;top:10px}
.tick{right:10px;width:18px;height:18px;border-radius:5px;border:1px solid var(--primary);background:var(--background);display:grid;place-items:center;font-size:12px;font-weight:600;line-height:1;color:transparent;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.open{left:10px;height:26px;display:flex;align-items:center;padding:0 10px;border-radius:7px;border:1px solid var(--border);background:var(--overlay);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  color:var(--foreground);font-size:12px;font-weight:500;text-decoration:none;opacity:0;transition:opacity .15s}
.card:hover .open{opacity:1}
.card.want .ph{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.card.want .tick{background:var(--primary);color:var(--primary-fg)}
.card.added .tick{background:var(--muted-fg);border-color:var(--muted-fg);color:var(--primary-fg)}
footer{position:absolute;left:50%;transform:translateX(-50%);bottom:20px;width:min(680px,calc(100% - 32px));border-radius:12px;border:1px solid var(--border);
  background:var(--overlay);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);padding:8px 8px 8px 18px;display:flex;align-items:center;gap:18px;z-index:2;
  box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)}
.stat{font-size:13px;color:var(--muted-fg)}.stat b{color:var(--foreground);font-weight:600;margin-right:4px;font-variant-numeric:tabular-nums}
.note{font-size:13px;color:var(--muted-fg)}
.go{margin-left:auto;height:36px;padding:0 16px;border-radius:8px;border:0;background:var(--primary);color:var(--primary-fg);font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.go:hover{opacity:.9}.go:disabled{opacity:.5;cursor:default}
.empty{grid-column:1/-1;text-align:center;color:var(--muted-fg);padding:64px 0}
/* compact density */
.wrap{font-size:13px}
.scroller{padding:22px 28px 100px}
h1{font-size:18px;letter-spacing:-.02em}
h1 small{font-size:12.5px;margin-left:8px}
.sub{font-size:12.5px;margin-top:2px}
.x{height:26px;width:26px;border-radius:6px;font-size:14px}
.seg{margin-top:12px;padding:3px;border-radius:7px}
.seg button{padding:3px 10px;font-size:12px;border-radius:5px}
.chips{gap:5px;margin-top:10px;padding-bottom:14px}
.chip{height:26px;padding:0 9px;gap:5px;border-radius:6px;font-size:12px;box-shadow:none}
.chip b{font-size:10.5px;padding:2px 5px}
.grid{padding-top:16px;gap:18px 12px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.ph{border-radius:8px}
.meta{padding:7px 1px 0}
.nm{font-size:12.5px;font-weight:400;line-height:1.3}
.row{font-size:12px;margin-top:1px}
.row b{font-weight:500}
.vb{font-size:11px;margin-top:2px}
.tick{width:15px;height:15px;border-radius:4px;font-size:10px}
.pill{top:8px}.tick{right:8px}.open{left:8px;height:22px;padding:0 8px;font-size:11px;border-radius:6px}
footer{bottom:16px;width:min(560px,calc(100% - 32px));border-radius:10px;padding:5px 5px 5px 14px;gap:14px}
.stat,.note{font-size:12px;white-space:nowrap}.stat b{font-size:12.5px}
.go{height:28px;padding:0 12px;font-size:12.5px;border-radius:6px}
</style>
<div class="wrap">
 <div class="scroller">
 <div class="window">
 <header>
  <div class="titlebar"><h1>${esc(cfg.title)}<small></small></h1><div class="lights"><button class="x" title="Close">×</button></div></div>
  <div class="toolbar">
   <div class="sub">${[shortlist ? 'Sizes on each product page' : cfg.sizes.length ? `In stock in ${esc(cfg.sizes.join(', '))}` : 'In stock', cfg.only ? `${esc(cfg.onlyLabel || 'filtered')} only` : '', 'click a card to pick it'].filter(Boolean).join(' · ')}</div>
   ${brands.length ? `<div class="seg">${['All', ...brands, 'Other'].map((b, k) => `<button data-b="${k === brands.length + 1 ? 'other' : esc(b)}" class="${k ? '' : 'on'}">${esc(b)}</button>`).join('')}</div>` : ''}
   <div class="chips"></div>
  </div>
 </header>
 <div class="grid"></div>
 </div>
 </div>
 <footer><div class="stat"><b class="w">0</b>picked</div><div class="stat"><b class="t">$0</b>${cfg.promo ? 'before code' : 'total'}</div>${cfg.promo ? `<div class="note">${esc(cfg.promo)}</div>` : ''}${shortlist ? '<div class="note" style="margin-left:auto;padding-right:10px">Shortlist · buy from each product page</div>' : '<button class="go" disabled>Add to cart</button>'}</footer>
</div>`;
    const $ = s => root.querySelector(s);
    $('h1 small').textContent = `${items.length.toLocaleString()} items`;
    let active = 'All', brand = 'All';
    const inBrand = i => brand === 'All' || (brand === 'other' ? !i.brand : i.brand === brand);
    const href = i => /^\/|^https?:/.test(i.h) ? i.h : `/products/${i.h}`;
    const render = () => {
      const base = items.filter(inBrand);
      const names = ['All', 'Picked', ...order.filter(n => base.some(i => i.tags[n]))];
      $('.chips').innerHTML = names.map(n => `<button class="chip ${n === active ? 'on' : ''} ${/Shoes|Bags|Everything|Picked/.test(n) ? 'dim' : ''}" data-c="${esc(n)}">${esc(n)}<b>${n === 'All' ? base.length : n === 'Picked' ? items.filter(i => picks[i.id]).length : base.filter(i => i.tags[n]).length}</b></button>`).join('');
      const top = $('.scroller').scrollTop;
      const vis = active === 'All' ? base : active === 'Picked' ? items.filter(i => picks[i.id]) : base.filter(i => i.tags[active]).sort((a, b) => (b.tags[active] - a.tags[active]) || ((a.idx ?? 0) - (b.idx ?? 0)));
      $('.grid').innerHTML = vis.map(i => `<div class="card ${picks[i.id] === 'added' ? 'added' : picks[i.id] ? 'want' : ''}" data-id="${esc(i.id)}"><div class="ph"><img loading="lazy" src="${esc(i.img)}"><a class="pill open" href="${esc(href(i))}" target="_blank" title="Open product">View</a><div class="pill tick">✓</div></div><div class="meta"><div class="nm">${esc(i.t)}</div><div class="row"><span>${esc(i.brand || i.vendor || '')}</span><b>$${esc(i.price)}</b></div><div class="vb">${Object.keys(i.tags).filter(t => t !== active && !/Shoes|Bags|Everything/.test(t)).join(' · ')}</div></div></div>`).join('') || '<div class="empty">Nothing here</div>';
      $('.scroller').scrollTop = top;
      const w = items.filter(i => picks[i.id] === 1);
      $('.w').textContent = w.length; $('.t').textContent = '$' + w.reduce((s, i) => s + (+i.price || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
      if ($('.go')) $('.go').disabled = !w.length;
    };
    root.addEventListener('click', async e => {
      const t = e.target.closest('button,.card'); if (!t || e.target.closest('.open')) return;
      if (t.classList.contains('x')) return host.remove();
      if (t.dataset.b) { brand = t.dataset.b; root.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b === t)); $('.scroller').scrollTop = Math.min($('.scroller').scrollTop, $('.grid').offsetTop + 10); return render(); }
      if (t.dataset.c) { active = t.dataset.c; $('.scroller').scrollTop = Math.min($('.scroller').scrollTop, $('.grid').offsetTop + 10); return render(); }
      if (t.dataset.id) { if (picks[t.dataset.id] === 'added') return; if (picks[t.dataset.id]) delete picks[t.dataset.id]; else picks[t.dataset.id] = 1; savePicks(); return render(); }
      if (t.classList.contains('go')) {
        const list = items.filter(i => picks[i.id] === 1), lines = [], skipped = [];
        t.disabled = true;
        for (const [n, i] of list.entries()) {
          t.textContent = `Checking ${n + 1}/${list.length}…`;
          const p = await (await fetch(`/products/${i.h}.js`)).json().catch(() => null);
          if (!p) { skipped.push(i.t); continue; }
          if (isShoe(p.type)) { skipped.push(`${i.t} (pick a shoe size)`); continue; }
          const si = p.options.findIndex(o => /size/i.test(o.name ?? o));
          const ok = p.variants.filter(v => v.available && (si < 0 || sizeRank(v.options[si]) >= 0)).sort((a, b) => si < 0 ? 0 : sizeRank(a.options[si]) - sizeRank(b.options[si]));
          if (!ok.length) { skipped.push(i.t); continue; }
          lines.push({ id: ok[0].id, quantity: 1, item: i });
        }
        t.textContent = 'Adding…';
        if (lines.length) await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: lines.map(({ id, quantity }) => ({ id, quantity })) }) });
        const cart = await (await fetch('/cart.js', { cache: 'no-store' })).json();
        const inCart = new Set(cart.items.map(x => x.variant_id));
        lines.forEach(l => { if (inCart.has(l.id)) picks[l.item.id] = 'added'; });
        savePicks(); render();
        t.textContent = `Added ${lines.filter(l => inCart.has(l.id)).length}` + (skipped.length ? ` · ${skipped.length} need you` : '');
        window.__boardResult = { skipped, cartCount: cart.item_count };
        setTimeout(() => { t.textContent = 'Add to cart'; render(); }, 6000);
      }
    });
    render();
  }

  const shortlist = Array.isArray(cfg.items);
  if (shortlist) {
    st.items = Object.fromEntries(cfg.items.map((x, idx) => [x.h, { t: x.t, h: x.h, type: x.type || '', img: x.img, price: x.price, brand: x.brand || '', vendor: x.vendor || '', tags: x.tags || '', idx }]));
    job.phase = 'board'; job.kept = cfg.items.length; show(); return 'opened (shortlist)';
  }
  const finished = Object.values(st.prog).length && Object.values(st.prog).every(v => v === 999 || v >= 100);
  if (finished && !cfg.recrawl) { job.phase = 'board'; job.kept = Object.keys(st.items).length; show(); return 'opened from cache'; }
  if (cfg.recrawl) { st.items = {}; st.prog = {}; }
  crawl().catch(e => { job.phase = 'error'; job.error = String(e); });
  return 'crawling…';
})();
