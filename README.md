# IR Currency | ایران ارز

Live Iranian Toman rates for currencies, crypto, gold and coins in one glance, with charts and a converter. Plain HTML, CSS and JavaScript.

نرخ لحظه‌ای ارز، رمزارز، طلا و سکه به تومان، با نمودار و مبدل. فقط HTML / CSS / JavaScript.

## Setup / راه‌اندازی
1. **Proxy (required for live tgju data).** Browsers block direct calls to tgju.org (CORS), so deploy `worker.js`:
   `npm i -g wrangler && wrangler deploy` — then set `CONFIG.WORKER_URL` in `app.js` to the `*.workers.dev` URL.
2. **Verify tgju keys.** Open the site, then run `IRC.keys()` in the browser console. If a key name in the catalog at the top of `app.js` (e.g. `sekeb`, `price_dollar_rl`, `silver_999`) is not in that list, edit its `keys` array.
3. **GitHub Pages.** Repo → Settings → Pages → deploy from `main` / root. Replace every `kheradmanderfan` in `index.html`, `robots.txt` and `sitemap.xml`.

## Data sources
- tgju.org (via the proxy): coins, gold, USD, EUR, GBP, AED, TRY, CNY, USDT
- open.er-api.com: other fiat currencies (computed from the free-market USD rate)
- CoinGecko: crypto prices and history (USD × USD/Toman rate)
- Chart history: tgju (daily), CoinGecko, Frankfurter; the 1-day chart for non-crypto assets is built from snapshots stored in the browser as you use the app.

## Google search
Use a clear repo name and About text, add topics (`iran`, `currency`, `toman`, `gold-price`, `dollar-rate`), then add the site in Google Search Console and submit `sitemap.xml`.

## Search name & SEO
- Page title: `IR Currency | ایران ارز`. The site name, alternate names (`IR Currency by Erfan`, `ایران ارز توسط عرفان`) and author are declared in the JSON-LD in `index.html`.
- The site is published at the root of `https://kheradmanderfan.github.io/`, which is what Google needs to show a custom site name. The repo must be named `kheradmanderfan.github.io`.
- After deploying: Search Console → add property → URL Inspection → Request indexing, and submit `sitemap.xml`.
- Link to the site from your GitHub profile README, repo About field and any other pages you own; backlinks matter most for ranking a new name.
