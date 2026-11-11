---
name: shop-board
description: >-
  Turn any online shop into a calm, visual board in the browser: the whole
  catalog as a photo grid, filtered to your sizes, grouped by intent instead of
  product type, click to pick, then add the picks to the store's cart. Also a
  click-to-remove review view for a cart that's already full. Takes loose args
  like "/shop-board dollskill xs, xxs, cutie stuff only". Use for "make a board
  for <shop>", "go through <store> for me", "find me stuff on <store>",
  "review my cart", or any browse-a-whole-store / trim-a-cart ask.
---

# Shop board

A shop's own pages are built to sell one product at a time. The board puts
the whole catalog on one screen: photos, in stock in the right size, sorted
into groups that match what the person is shopping for. Click to pick, and
the picks go to the cart.

It runs in the person's own browser session through a browser-automation tool
that can execute JavaScript in a page (Claude in Chrome, Playwright and
similar). Scripts are pasted whole into the page. Nothing is installed, and
nothing is bought: the deliverable is a cart.

## Read the request

`references/vibes.md` maps loose words to settings: the store, sizes
(optional), vibe groups, "… only", promo codes. No sizes means every size. No
vibe words means the general groups (Everyday, Going out, Lounge & sleep,
Intimates, Statement, Active & swim, Outerwear, Shoes, Bags & accessories).

## Flow

1. **Open the store in a new tab** and work out the platform. If `window.Shopify`
   exists or `/products.json` returns JSON, it's Shopify. If `form.cart`,
   `woocommerce` classes or `/?wc-ajax=` exist, it's WooCommerce. Anything else
   is a custom site.
2. **Check the size labels before filtering.** Count the size option's values on
   the first page of products. Stores spell sizes out ("X-SMALL",
   "XX-SMALL", "X-SMALL/SMALL"). `board.js` handles the common aliases, but a
   store with its own scheme needs `sizes` written in its words.
3. **Look for house brands.** A store's own lines show up as collections, and
   their keywords won't catch them. Pass them as `brands`. They're crawled
   whole and get a switch at the top.
4. **Open the board.** Set `window.__board`, then paste `scripts/board.js`.
   - **Shopify:** it crawls `products.json`. That feed stops at page 100 (25k
     products), so `/collections/all` is crawled too and merged by id. Progress is
     saved per store and per size set, so a closed tab resumes and a finished
     crawl reopens instantly. **Add to cart** goes through `/cart/add.js` in the
     smallest wanted size. Shoes are flagged for the person to choose a size.
   - **Anything else:** run `scripts/crawl-listing.js` first. Its defaults are
     WooCommerce. For a custom site, inspect one product card and set the
     selectors. Then set `window.__board.items = window.__items`. The board opens
     as a **shortlist**: picks are saved, and the person adds to the bag from each
     product's View link. Say so when the listing shows no stock or sizes.
   - **WooCommerce add-to-cart:** `scripts/woo-add.js` with the picked URLs.
5. **Review a full cart.** `scripts/cart-review.js` on any store page. Click to
   mark for removal, **Undo** reverses a click, **Recent** shows what changed,
   and **Apply** removes the marked items.
6. **Report:** what's on the board (count, groups), what was added or removed,
   what got skipped and why. Say that nothing was checked out and which tab it's in.

Long jobs (crawls, multi-item adds) run in the background and write progress
to a `window.__…` object. Poll it with short waits. Page evaluation times out
at around 45s, so never `await` a whole crawl in one call.

## Hard-won rules

- **Nothing vanishes under the cursor.** A click toggles one thing. A card stays
  where it is until the tab or group changes. Bulk actions (Keep all / Remove
  all) come with Undo.
- **Marks are the source of truth.** Clear a mark only after the cart confirms
  the item is gone, so an interrupted Apply loses nothing.
- **WooCommerce adds are sequential**, about 800ms apart. Parallel or back-to-back
  POSTs race the session and silently drop about every other item. Always diff the
  cart afterward.
- **WooCommerce removes are batched through the cart form.** Every write re-totals
  the whole cart: one removal at a time takes seconds per item on a big cart, and
  one giant request 502s at the gateway. Zero out about 6 lines per request and
  halve the chunk on any non-200.
- **`wc-ajax=remove_from_cart` returns 200 even when it fails.** Only a response
  with `fragments` actually removed the item.
- **Read the cart with a cache-busting query** (`/cart/?r=<now>`). Chrome can serve
  a stale cart page, and a retry based on it doubles the item.
- **Variant labels may only exist as codes** (`lb-sn802-s301` for "Black").
  Match variants by the code that was picked, not by the label.
- **Guest carts expire** (WooCommerce keeps a guest session for days, not weeks).
  When someone settles on a cart, save it as `[name, size]` pairs so it can
  be rebuilt, and suggest they log in. They log in themselves; never enter
  credentials.
- **The overlay goes after `<body>`** (`documentElement.appendChild`). That keeps
  same-z-index cookie banners from sitting on top of it. Decline non-essential
  cookies if a banner blocks the view.
- **Close tabs you opened; never repurpose the person's own tabs.** Navigating a tab
  wipes `window` state, which is why crawls persist to localStorage.

## Look

Both views use shadcn's zinc tokens at a compact density and follow the system
light/dark setting. There's no theme switch and no sticky header. The views
live in a shadow root, so the store's CSS can't leak in.
