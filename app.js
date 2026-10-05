'use strict';
/* =====================================================================
   IR Currency / ایران ارز
   ===================================================================== */
const CONFIG = {
  // Deploy worker.js to Cloudflare Workers and paste its URL here.
  WORKER_URL: 'https://ir-currency-proxy.kheradmanderfan12.workers.dev',
  REFRESH_MS: 60000
};
const TGJU_DIRECT = 'https://call5.tgju.org/ajax.json';

/* ---------------- catalog ---------------- */
const GOLD = [
  { id: 'sekeb', en: 'Bahar Azadi Coin', fa: 'سکه تمام بهار آزادی', sym: 'SEKEB', keys: ['sekeb'], v: 'coin' },
  { id: 'sekee', en: 'Emami Coin', fa: 'سکه امامی', sym: 'EMAMI', keys: ['sekee'], v: 'coin' },
  { id: 'nim', en: 'Half Coin', fa: 'نیم‌سکه', sym: 'NIM', keys: ['nim'], v: 'coin' },
  { id: 'rob', en: 'Quarter Coin', fa: 'ربع‌سکه', sym: 'ROB', keys: ['rob'], v: 'coin' },
  { id: 'gerami', en: 'Gerami Coin', fa: 'سکه گرمی', sym: 'GERAMI', keys: ['gerami'], v: 'coin' },
  { id: 'geram18', en: 'Gold 18K', fa: 'طلای ۱۸ عیار', sym: 'GERAM18', keys: ['geram18'], v: 'bar' },
  { id: 'geram24', en: 'Gold 24K', fa: 'طلای ۲۴ عیار', sym: 'GERAM24', keys: ['geram24'], v: 'bar' },
  { id: 'ons', en: 'Gold Ounce', fa: 'اونس طلا', sym: 'XAU', keys: ['ons'], v: 'bar', usdq: true },
  { id: 'silver', en: 'Silver (gram)', fa: 'نقره (گرم)', sym: 'XAG', keys: ['silver_999'], v: 'silver' }
];
// [id, flag, English, Persian, tgju key (optional)]
const FIAT = [
  ['usd', 'us', 'US Dollar', 'دلار آمریکا', 'price_dollar_rl'], ['eur', 'eu', 'Euro', 'یورو', 'price_eur'],
  ['gbp', 'gb', 'British Pound', 'پوند انگلیس', 'price_gbp'], ['aed', 'ae', 'UAE Dirham', 'درهم امارات', 'price_aed'],
  ['try', 'tr', 'Turkish Lira', 'لیر ترکیه', 'price_try'], ['cny', 'cn', 'Chinese Yuan', 'یوان چین', 'price_cny'],
  ['iqd', 'iq', 'Iraqi Dinar', 'دینار عراق'], ['afn', 'af', 'Afghan Afghani', 'افغانی افغانستان'],
  ['jpy', 'jp', 'Japanese Yen', 'ین ژاپن'], ['cad', 'ca', 'Canadian Dollar', 'دلار کانادا'],
  ['aud', 'au', 'Australian Dollar', 'دلار استرالیا'], ['chf', 'ch', 'Swiss Franc', 'فرانک سوئیس'],
  ['sek', 'se', 'Swedish Krona', 'کرون سوئد'], ['nok', 'no', 'Norwegian Krone', 'کرون نروژ'],
  ['dkk', 'dk', 'Danish Krone', 'کرون دانمارک'], ['inr', 'in', 'Indian Rupee', 'روپیه هند'],
  ['pkr', 'pk', 'Pakistani Rupee', 'روپیه پاکستان'], ['rub', 'ru', 'Russian Ruble', 'روبل روسیه'],
  ['sar', 'sa', 'Saudi Riyal', 'ریال عربستان'], ['kwd', 'kw', 'Kuwaiti Dinar', 'دینار کویت'],
  ['qar', 'qa', 'Qatari Riyal', 'ریال قطر'], ['omr', 'om', 'Omani Rial', 'ریال عمان'],
  ['bhd', 'bh', 'Bahraini Dinar', 'دینار بحرین'], ['amd', 'am', 'Armenian Dram', 'درام ارمنستان'],
  ['azn', 'az', 'Azerbaijani Manat', 'منات آذربایجان'], ['gel', 'ge', 'Georgian Lari', 'لاری گرجستان'],
  ['kzt', 'kz', 'Kazakh Tenge', 'تنگه قزاقستان'], ['myr', 'my', 'Malaysian Ringgit', 'رینگیت مالزی'],
  ['sgd', 'sg', 'Singapore Dollar', 'دلار سنگاپور'], ['thb', 'th', 'Thai Baht', 'بات تایلند'],
  ['hkd', 'hk', 'Hong Kong Dollar', 'دلار هنگ‌کنگ'], ['krw', 'kr', 'South Korean Won', 'وون کره جنوبی'],
  ['nzd', 'nz', 'New Zealand Dollar', 'دلار نیوزیلند'], ['egp', 'eg', 'Egyptian Pound', 'پوند مصر']
];
// [id, symbol, English, Persian, CoinGecko id, color, glyph]
const CRYPTO = [
  ['btc', 'BTC', 'Bitcoin', 'بیت‌کوین', 'bitcoin', '#f7931a', '₿'], ['eth', 'ETH', 'Ethereum', 'اتریوم', 'ethereum', '#627eea', 'Ξ'],
  ['usdt', 'USDT', 'Tether', 'تتر', 'tether', '#26a17b', '₮'], ['usdc', 'USDC', 'USD Coin', 'یو‌اس‌دی‌کوین', 'usd-coin', '#2775ca', '$'],
  ['bnb', 'BNB', 'BNB', 'بایننس کوین', 'binancecoin', '#d9a514', 'B'], ['sol', 'SOL', 'Solana', 'سولانا', 'solana', '#7c4dff', 'S'],
  ['xrp', 'XRP', 'XRP', 'ریپل', 'ripple', '#23292f', 'X'], ['ada', 'ADA', 'Cardano', 'کاردانو', 'cardano', '#0033ad', 'A'],
  ['trx', 'TRX', 'TRON', 'ترون', 'tron', '#e50914', 'T'], ['ton', 'TON', 'Toncoin', 'تون‌کوین', 'the-open-network', '#0098ea', 'T'],
  ['avax', 'AVAX', 'Avalanche', 'آوالانچ', 'avalanche-2', '#e84142', 'A'], ['dot', 'DOT', 'Polkadot', 'پولکادات', 'polkadot', '#e6007a', 'D'],
  ['ltc', 'LTC', 'Litecoin', 'لایت‌کوین', 'litecoin', '#345d9d', 'Ł'], ['link', 'LINK', 'Chainlink', 'چین‌لینک', 'chainlink', '#2a5ada', 'L'],
  ['doge', 'DOGE', 'Dogecoin', 'دوج‌کوین', 'dogecoin', '#c2a633', 'Ð'], ['shib', 'SHIB', 'Shiba Inu', 'شیبا', 'shiba-inu', '#e8590c', 'S'],
  ['pepe', 'PEPE', 'Pepe', 'پپه', 'pepe', '#3f8f3f', 'P'], ['bonk', 'BONK', 'Bonk', 'بونک', 'bonk', '#f39c12', 'B'],
  ['floki', 'FLOKI', 'Floki', 'فلوکی', 'floki', '#d98c1f', 'F'], ['wif', 'WIF', 'dogwifhat', 'داگ‌ویف‌هت', 'dogwifcoin', '#a1704b', 'W'],
  ['not', 'NOT', 'Notcoin', 'نات‌کوین', 'notcoin', '#222', 'N']
];
// ArzDigital slugs (arzdigital.com/coins/<slug>/)
const AZ = { btc: 'bitcoin', eth: 'ethereum', usdt: 'tether', usdc: 'usd-coin', bnb: 'bnb', sol: 'solana', xrp: 'xrp', ada: 'cardano', trx: 'tron', ton: 'toncoin', avax: 'avalanche', dot: 'polkadot-new', ltc: 'litecoin', link: 'chainlink', doge: 'dogecoin', shib: 'shiba-inu', pepe: 'pepe', wif: 'dogwifhat', bonk: 'bonk', floki: 'floki-inu', not: 'notcoin' };
const ASSETS = [];
GOLD.forEach(g => ASSETS.push({ ...g, type: 'gold' }));
FIAT.forEach(([id, cc, en, fa, key]) => ASSETS.push({ id, type: 'fiat', cc, en, fa, sym: id.toUpperCase(), keys: key ? [key] : [] }));
CRYPTO.forEach(([id, sym, en, fa, gk, color, glyph]) => ASSETS.push({ id, type: 'crypto', sym, en, fa, gk, az: AZ[id], color, glyph, keys: id === 'usdt' ? ['crypto-tether-irr', 'tether'] : [] }));
const byId = Object.fromEntries(ASSETS.map(a => [a.id, a]));

/* ---------------- i18n ---------------- */
const T = {
  en: { title: 'IR Currency', now: 'moments ago', add: 'Add assets', conv: 'Converter', set: 'Settings', look: 'Appearance', light: 'Light', dark: 'Dark', layout: 'Layout', list: 'List', grid: 'Grid', lang: 'Language', search: 'Search', all: 'All', fiat: 'Currencies', crypto: 'Crypto', gold: 'Gold & coins', toman: 'Toman', amount: 'Amount', swap: 'Swap', hi: 'H', lo: 'L', r1D: '1D', r1W: '1W', r1M: '1M', r1Y: '1Y', hist: 'Not enough history yet. This chart fills in as you keep the app open.', loading: 'Loading…', err: 'Live rates are unavailable right now. Showing the last saved rates.', setup: 'Live rates need the proxy. Deploy worker.js and set WORKER_URL in app.js (see README).', empty: 'Nothing here yet. Tap + to add assets.', na: 'No price', close: 'Close', refresh: 'Refresh' },
  fa: { title: 'ایران ارز', now: 'لحظاتی پیش', add: 'افزودن دارایی', conv: 'مبدل', set: 'تنظیمات', look: 'ظاهر', light: 'روشن', dark: 'تاریک', layout: 'نمایش', list: 'لیست', grid: 'شبکه‌ای', lang: 'زبان', search: 'جستجو', all: 'همه', fiat: 'ارزها', crypto: 'رمزارزها', gold: 'طلا و سکه', toman: 'تومان', amount: 'مقدار', swap: 'جابه‌جایی', hi: 'بیشترین', lo: 'کمترین', r1D: 'روز', r1W: 'هفته', r1M: 'ماه', r1Y: 'سال', hist: 'سابقه کافی نیست. با باز نگه داشتن برنامه، این نمودار کامل می‌شود.', loading: 'در حال بارگذاری…', err: 'نرخ‌های زنده در دسترس نیست. آخرین نرخ ذخیره‌شده نمایش داده می‌شود.', setup: 'برای نرخ زنده به پراکسی نیاز است. فایل worker.js را دیپلوی و WORKER_URL را در app.js تنظیم کنید (راهنما در README).', empty: 'هنوز چیزی اضافه نشده. با + دارایی اضافه کنید.', na: 'بدون قیمت', close: 'بستن', refresh: 'بروزرسانی' }
};
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const t = k => T[state.lang][k];
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('irc.' + k)); return v == null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('irc.' + k, JSON.stringify(v)); } catch { /* quota */ } }
};
const state = {
  theme: store.get('theme', matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  view: store.get('view', 'grid'),
  lang: store.get('lang', (navigator.language || '').startsWith('fa') ? 'fa' : 'en'),
  ids: store.get('ids', DEFAULT_IDS).filter(id => byId[id]),
  prices: store.get('prices', {}),
  updated: store.get('updated', 0),
  snaps: store.get('snaps', {}),
  openId: null, loading: false, status: 'ok', tgjuKeys: []
};

/* ---------------- formatting ---------------- */
const loc = () => (state.lang === 'fa' ? 'fa-IR' : 'en-US');
const nf = o => new Intl.NumberFormat(loc(), o);
const fmt = v => {
  if (!isFinite(v)) return '—';
  const a = Math.abs(v);
  return nf(a >= 1000 ? { maximumFractionDigits: 0 } : a >= 1 ? { maximumFractionDigits: 2 } : { maximumSignificantDigits: 3 }).format(v);
};
const UNITS = { en: ['', 'K', 'M', 'B', 'T'], fa: ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'] };
function compact(v) {
  const a = Math.abs(v);
  if (!isFinite(v) || a < 1000) return { n: fmt(v), u: '' };
  const i = Math.min(4, Math.floor(Math.log10(a) / 3));
  return { n: nf({ maximumFractionDigits: 3 }).format(Number((v / 1000 ** i).toPrecision(5))), u: UNITS[state.lang][i] };
}
const toAscii = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬,\s]/g, '').replace('٫', '.');
function chgText(c) {
  if (!isFinite(c)) c = 0;
  const a = Math.abs(c);
  const s = a >= 1e6 ? (x => x.n + x.u)(compact(a)) : fmt(a);
  return `${c > 0 ? '↑' : c < 0 ? '↓' : '↑'} ${c < 0 ? '-' : ''}${s}`;
}
const chgCls = c => (c < 0 ? 'dn' : 'up');
function stampText(ts) {
  if (!ts) return '—';
  const o = state.lang === 'fa' ? { calendar: 'persian', numberingSystem: 'arab' } : {};
  const d = new Intl.DateTimeFormat(loc() + (state.lang === 'fa' ? '-u-ca-persian' : ''), { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(ts);
  return d.replace(',', '');
}
function agoText() {
  if (!state.updated) return '—';
  const s = (Date.now() - state.updated) / 1000;
  if (s < 30) return t('now');
  const r = new Intl.RelativeTimeFormat(loc(), { numeric: 'auto' });
  return s < 3600 ? r.format(-Math.round(s / 60), 'minute') : r.format(-Math.round(s / 3600), 'hour');
}

/* ---------------- network ---------------- */
async function getJSON(url, ms = 8000) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}
const base = () => CONFIG.WORKER_URL.replace(/\/$/, '');
const num = s => (s == null ? NaN : parseFloat(toAscii(s)));
const fetchTgju = async () => { const j = await getJSON(CONFIG.WORKER_URL ? base() + '/rates' : TGJU_DIRECT); return j.current || j; };
const fetchGecko = () => getJSON('https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&include_24hr_change=true&ids=' + CRYPTO.map(c => c[4]).join(','));
const fetchArz = () => (CONFIG.WORKER_URL ? getJSON(base() + '/crypto') : Promise.reject(new Error('no-worker')));
const fetchFx = () => getJSON('https://open.er-api.com/v6/latest/USD');

function buildPrices(tg, arz, fx, cg, prevAll) {
  const az = arz && arz.status === 'fulfilled' ? arz.value : {};
  const T0 = tg.status === 'fulfilled' ? tg.value : {};
  if (tg.status === 'fulfilled') state.tgjuKeys = Object.keys(T0);
  const rates = fx && fx.status === 'fulfilled' ? fx.value.rates || {} : {};
  const gk = cg && cg.status === 'fulfilled' ? cg.value : {};
  const pick = a => { for (const k of a.keys || []) { const r = T0[k]; if (r && num(r.p) > 0) return [k, r]; } return null; };

  const u = pick(byId.usd);
  const usd = u ? num(u[1].p) / 10 : prevAll.usd && prevAll.usd.p;
  if (!usd) throw new Error('no-usd');
  const next = {};
  for (const a of ASSETS) {
    const prev = prevAll[a.id];
    let rec = null;
    // crypto: ArzDigital first (Toman price, or USD x current dollar rate)
    const z = a.type === 'crypto' && az[a.az];
    if (z) {
      const p = z.toman > 0 ? z.toman : z.usd > 0 ? z.usd * usd : 0;
      if (p > 0) rec = { p, ch: z.ch24 != null && isFinite(z.ch24) ? p * z.ch24 / (100 + z.ch24) : null };
    }
    const hit = rec ? null : pick(a);   // everything else: tgju first
    if (hit) {
      const [k, r] = hit;
      const mul = a.usdq ? usd : 0.1;
      const d = num(r.d);
      const sign = r.dt === 'low' ? -1 : r.dt === 'high' ? 1 : Math.sign(d) || 1;
      rec = { p: num(r.p) * mul, ch: isFinite(d) ? Math.abs(d) * mul * sign : null, h: num(r.h) * mul, l: num(r.l) * mul, hist: k };
    } else if (!rec && a.type === 'fiat' && rates[a.sym] > 0) {   // fallback: world FX rate via the free-market dollar
      rec = { p: a.id === 'usd' ? usd : usd / rates[a.sym], ch: null };
    } else if (!rec && a.type === 'crypto' && gk[a.gk] && gk[a.gk].usd > 0) {   // fallback: CoinGecko USD x dollar
      const g = gk[a.gk], p = g.usd * usd, pct = g.usd_24h_change;
      rec = { p, ch: isFinite(pct) ? p * pct / (100 + pct) : null };
    }
    if (!rec) { if (prev) next[a.id] = prev; continue; }
    if (!isFinite(rec.h)) { delete rec.h; delete rec.l; }
    if (rec.ch == null) rec.ch = prev && prev.p ? rec.p - prev.p : 0;
    rec.p = +rec.p.toPrecision(8); rec.ch = +rec.ch.toPrecision(6);
    next[a.id] = rec;
  }
  return next;
}
async function loadRates() {
  const prevAll = state.prices;
  const pTg = fetchTgju(), pArz = fetchArz(), pFx = fetchFx();
  [pTg, pArz, pFx].forEach(p => p.catch(() => {}));
  // stage 1: the two main sources -> first paint as soon as they answer
  const [tg, arz] = await Promise.allSettled([pTg, pArz]);
  state.prices = buildPrices(tg, arz, null, null, prevAll);
  state.updated = Date.now();
  state.status = tg.status === 'fulfilled' ? 'ok' : 'partial';
  patchCards();
  // stage 2: fallbacks (world FX rates, CoinGecko only when ArzDigital misses a coin)
  const needCg = !(arz.status === 'fulfilled' && CRYPTO.every(c => arz.value[AZ[c[0]]]));
  const [fx, cg] = await Promise.allSettled([pFx, needCg ? fetchGecko() : Promise.reject(new Error('skip'))]);
  state.prices = buildPrices(tg, arz, fx, cg, prevAll);
  snapshot();
  store.set('prices', state.prices); store.set('updated', state.updated);
}
function snapshot() {
  const now = Date.now(), cut = now - 2 * 864e5;
  for (const [id, r] of Object.entries(state.prices)) {
    const s = (state.snaps[id] = (state.snaps[id] || []).filter(x => x[0] > cut));
    if (!s.length || now - s[s.length - 1][0] > 5 * 6e4) s.push([now, r.p]);
  }
  store.set('snaps', state.snaps);
}

/* ---------------- history ---------------- */
const RANGE_DAYS = { '1D': 1, '1W': 7, '1M': 30, '1Y': 365 };
const RANGE_TTL = { '1D': 3 * 60e3, '1W': 20 * 60e3, '1M': 3 * 36e5, '1Y': 6 * 36e5 };
const histCache = new Map();   // slug -> { t, p }
const HIST_TTL = 15 * 60e3;
function tgjuHistory(slug) {
  const hit = histCache.get(slug);
  if (hit && Date.now() - hit.t < HIST_TTL) return hit.p;
  const p = (async () => {
    const j = await getJSON(CONFIG.WORKER_URL ? `${base()}/history?slug=${encodeURIComponent(slug)}` : `https://api.tgju.org/v1/market/indicator/summary-table-data/${slug}`, 12000);
    const out = [];
    for (const r of j.data || j) {
      const arr = Array.isArray(r) ? r : Object.values(r);
      const close = num(arr[3]);
      const ds = arr.find(x => typeof x === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(x.trim()) && +x.slice(0, 4) > 1800);
      if (!(close > 0) || !ds) continue;
      out.push([Date.parse(ds.trim().replace(/\//g, '-') + 'T12:00:00Z'), close / 10]);
    }
    return out.sort((x, y) => x[0] - y[0]);
  })();
  const rec = { t: Date.now(), p };
  histCache.set(slug, rec);
  p.catch(() => { if (histCache.get(slug) === rec) histCache.delete(slug); });
  return p;
}
// chart series survive reloads, so charts open instantly and refresh quietly in the background
const chartCache = {
  get(id, r) { const e = store.get(`ch2.${id}.${r}`, null); return e && e.p ? { t: e.t, pts: e.p.map(x => [x[0] * 1000, x[1]]) } : null; },
  set(id, r, pts) {
    const key = `${id}.${r}`, idx = store.get('ch2.idx', []).filter(k => k !== key);
    idx.push(key);
    while (idx.length > 36) { try { localStorage.removeItem('irc.ch2.' + idx.shift()); } catch { /* ignore */ } }
    store.set('ch2.' + key, { t: Date.now(), p: pts.map(x => [Math.round(x[0] / 1000), +x[1].toPrecision(7)]) });
    store.set('ch2.idx', idx);
  }
};
// Make a history series consistent with the live price. Rejects series that belong to a different scale/instrument
// (this is what used to produce jumbled charts). exact=true also joins the end of the series to the live price.
function fit(pts, cur, exact) {
  if (!pts || pts.length < 2) return null;
  const last = pts[pts.length - 1][1];
  if (!(last > 0) || !(cur > 0)) return null;
  const r = cur / last;
  for (const k of [1, 10, 0.1]) {
    const q = r / k;
    if (q > 0.65 && q < 1.55) { const m = exact ? r : k; return m === 1 ? pts : pts.map(([ts, v]) => [ts, v * m]); }
  }
  return null;
}
async function usdSeriesToToman(pts, days) {
  let h = null;
  if (days > 1) { try { h = await tgjuHistory('price_dollar_rl'); } catch { /* use current */ } }
  const cur = (state.prices.usd || {}).p || 0; let i = 0;
  return pts.map(([ts, v]) => {
    let r = cur;
    if (h && h.length) { while (i + 1 < h.length && h[i + 1][0] <= ts) i++; r = h[i][1]; }
    return [ts, v * r];
  });
}
async function cryptoSeries(a, range, days) {
  let usdPts;
  try {
    const cfg = { '1D': ['histohour', 24], '1W': ['histohour', 168], '1M': ['histoday', 30], '1Y': ['histoday', 365] }[range];
    const j = await getJSON(`https://min-api.cryptocompare.com/data/v2/${cfg[0]}?fsym=${a.sym}&tsym=USD&limit=${cfg[1]}`);
    usdPts = ((j.Data && j.Data.Data) || []).filter(x => x.close > 0).map(x => [x.time * 1000, x.close]);
    if (usdPts.length < 2) throw new Error('empty');
  } catch {
    const j = await getJSON(`https://api.coingecko.com/api/v3/coins/${a.gk}/market_chart?vs_currency=usd&days=${days}`);
    usdPts = j.prices;
  }
  return usdSeriesToToman(usdPts, days);
}
async function fiatSeries(a, days, from) {
  const iso = d => new Date(d).toISOString().slice(0, 10);
  const j = await getJSON(`https://api.frankfurter.dev/v1/${iso(from)}..?base=USD&symbols=${a.sym}`);
  return usdSeriesToToman(Object.entries(j.rates).map(([d, r]) => [Date.parse(d + 'T12:00:00Z'), 1 / r[a.sym]]), days);
}
async function getSeries(a, range) {
  const days = RANGE_DAYS[range], now = Date.now(), from = now - days * 864e5;
  const pr = state.prices[a.id] || {}, cur = pr.p;
  let pts = null;
  try {
    if (a.type === 'crypto') pts = fit(await cryptoSeries(a, range, days), cur, true);
    else if (pr.hist && days > 1) {
      pts = (await tgjuHistory(pr.hist)).filter(p => p[0] >= from - 864e5);
      if (a.usdq) pts = await usdSeriesToToman(pts.map(p => [p[0], p[1] * 10]), days);
      pts = fit(pts, cur, false);
    } else if (a.type === 'fiat' && days > 1 && a.id !== 'usd') pts = fit(await fiatSeries(a, days, from), cur, true);
  } catch { pts = null; }
  if (!pts || pts.length < 2) { pts = (state.snaps[a.id] || []).filter(p => p[0] >= from); if (pts.length < 3) pts = []; }
  if (cur) pts = pts.filter(p => p[0] < now - 6e4).concat([[now, cur]]);
  const step = Math.ceil(pts.length / 140);
  return pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
}
let warmed = false;
async function warmUp() {   // pre-load the weekly chart of every visible asset so opening it is instant
  if (warmed) return; warmed = true;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(1500);
  for (const id of [...state.ids]) {
    if (document.hidden || !state.prices[id]) continue;
    const c = chartCache.get(id, '1W');
    if (c && Date.now() - c.t < RANGE_TTL['1W']) continue;
    try { const pts = await getSeries(byId[id], '1W'); if (pts.length > 1) chartCache.set(id, '1W', pts); } catch { /* ignore */ }
    await sleep(500);
  }
}

/* ---------------- chart ---------------- */
function smooth(p) {
  if (p.length < 3) return 'M' + p.map(q => q.join(' ')).join('L');
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
function seg(opts, val, onChange) {
  const s = el('div', 'seg');
  s.style.setProperty('--n', opts.length);
  const set = v => { s.style.setProperty('--i', Math.max(0, opts.findIndex(o => o[0] === v))); [...s.children].forEach(b => b.classList.toggle('on', b.dataset.v === v)); };
  opts.forEach(([v, label]) => { const b = el('button', '', label); b.dataset.v = v; b.type = 'button'; b.onclick = () => { set(v); onChange(v); }; s.append(b); });
  set(val);
  return s;
}
function tickLabel(range, ts) {
  const l = state.lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US';
  const f = o => new Intl.DateTimeFormat(l, o).format(ts);
  return range === '1D' ? f({ hour: '2-digit', hour12: false }) : range === '1W' ? f({ weekday: 'narrow' }) : range === '1M' ? f({ day: 'numeric' }) : f({ month: 'narrow' });
}
function mountChart(box, a) {
  let range = '1W';
  const root = el('div', 'chart');
  root.innerHTML = '<span class="c-hl"></span><div class="c-plot loading"><svg viewBox="0 0 1000 400" preserveAspectRatio="none"></svg><div class="c-cur"></div><div class="c-dot"></div><div class="c-tip"></div><div class="c-msg"></div></div><div class="c-x"></div>';
  const tabs = seg([['1D', t('r1D')], ['1W', t('r1W')], ['1M', t('r1M')], ['1Y', t('r1Y')]], range, r => { range = r; load(); });
  root.append(tabs); box.append(root);
  const plot = $('.c-plot', root), svg = $('svg', root), msg = $('.c-msg', root);
  let token = 0;
  const withLive = pts => { const c = (state.prices[a.id] || {}).p, now = Date.now(); return c ? pts.filter(p => p[0] < now - 6e4).concat([[now, c]]) : pts; };
  async function load() {
    const my = ++token, r = range;
    const cached = chartCache.get(a.id, r);
    if (cached) {
      draw(withLive(cached.pts), true);
      if (Date.now() - cached.t < RANGE_TTL[r]) return;
    } else { plot.classList.add('loading'); msg.textContent = ''; }
    const pts = await getSeries(a, r);
    if (my !== token || !root.isConnected) return;
    if (pts.length > 1) chartCache.set(a.id, r, pts);
    draw(pts, !cached);
  }
  function draw(pts, animate) {
    plot.classList.toggle('still', !animate);
    plot.classList.remove('loading');
    $('.c-x', root).innerHTML = '';
    if (pts.length < 2) { svg.innerHTML = ''; msg.textContent = t('hist'); $('.c-hl', root).textContent = ''; return; }
    msg.textContent = '';
    const ts = pts.map(p => p[0]), vs = pts.map(p => p[1]);
    const t0 = ts[0], t1 = ts[ts.length - 1];
    const lo = Math.min(...vs), hi = Math.max(...vs), span = hi - lo || hi * 0.01 || 1;
    const X = ts_ => ((ts_ - t0) / (t1 - t0 || 1)) * 1000;
    const Y = v => 360 - ((v - lo) / span) * 320;
    const xy = pts.map(p => [X(p[0]), Y(p[1])]);
    const d = smooth(xy);
    const up = vs[vs.length - 1] >= vs[0];
    plot.style.setProperty('--k', up ? 'var(--up)' : 'var(--down)');
    svg.innerHTML = `<defs><linearGradient id="ga${a.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--k)" stop-opacity=".38"/><stop offset="1" stop-color="var(--k)" stop-opacity="0"/></linearGradient></defs><path class="c-area" d="${d}L1000 400L0 400Z" fill="url(#ga${a.id})"/><path class="c-line" pathLength="1" d="${d}"/>`;
    $('.c-hl', root).textContent = `${t('hi')}: ${fmt(hi)}   ${t('lo')}: ${fmt(lo)}`;
    const n = { '1D': 6, '1W': 8, '1M': 6, '1Y': 12 }[range], x = $('.c-x', root);
    for (let i = 0; i < n; i++) x.append(el('span', '', tickLabel(range, t0 + (t1 - t0) * (i / (n - 1)))));
    const cur = $('.c-cur', root), dot = $('.c-dot', root), tip = $('.c-tip', root);
    const dtf = new Intl.DateTimeFormat(state.lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', range === '1D' ? { hour: '2-digit', minute: '2-digit', hour12: false } : { month: 'short', day: 'numeric', hour: range === '1W' ? '2-digit' : undefined, minute: range === '1W' ? '2-digit' : undefined, hour12: false });
    const move = e => {
      const r = plot.getBoundingClientRect();
      let f = (e.clientX - r.left) / r.width;
      f = Math.min(1, Math.max(0, f));
      const target = t0 + f * (t1 - t0);
      let k = 0; for (let i = 0; i < ts.length; i++) if (Math.abs(ts[i] - target) < Math.abs(ts[k] - target)) k = i;
      const px = (xy[k][0] / 1000) * 100, py = (xy[k][1] / 400) * 100;
      cur.style.left = dot.style.left = tip.style.left = px + '%'; dot.style.top = py + '%';
      tip.style.left = Math.min(88, Math.max(12, px)) + '%';
      tip.textContent = `${fmt(vs[k])} · ${dtf.format(ts[k])}`;
      plot.classList.add('scrub');
    };
    plot.onpointermove = move; plot.onpointerdown = move;
    plot.onpointerleave = plot.onpointerup = plot.onpointercancel = () => plot.classList.remove('scrub');
  }
  load();
}

/* ---------------- icons & cards ---------------- */
function icon(a) {
  if (a.type === 'fiat') return `<span class="ic"><img src="https://flagcdn.com/w80/${a.cc}.png" alt="" loading="lazy"></span>`;
  if (a.type === 'crypto') return `<span class="ic" style="--c:${a.color}">${a.glyph}</span>`;
  return `<span class="ic gold ${a.v === 'bar' ? 'bar' : ''} ${a.v === 'silver' ? 'silver' : ''}"></span>`;
}
const nameOf = a => a[state.lang];
function priceHTML(p, big) {
  if (!p) return '<div class="skel"></div>';
  if (state.view === 'grid' && !big) { const c = compact(p.p); return `${c.n}${c.u ? `<small>${c.u}</small>` : ''}`; }
  return fmt(p.p);
}
function bodyHTML(p) {
  return `<div class="chg ${p ? chgCls(p.ch) : ''}">${p ? chgText(p.ch) : ''}</div>
    <div class="px">${priceHTML(p)}</div>
    ${p && isFinite(p.h) ? `<div class="hl"><span>${t('hi')}: ${fmt(p.h)}</span><span>${t('lo')}: ${fmt(p.l)}</span></div>` : ''}`;
}
function patchCards() {   // update prices in place: no re-render, so open charts / popups are never disturbed
  const cards = [...document.querySelectorAll('#cards .card')];
  if (cards.length !== state.ids.length || cards.some((c, i) => c.dataset.id !== state.ids[i])) return render();
  cards.forEach(c => { $('.body', c).innerHTML = bodyHTML(state.prices[c.dataset.id]); });
  updateChrome();
}
function cardEl(a) {
  const p = state.prices[a.id];
  const c = el('article', 'card' + (state.view === 'list' && state.openId === a.id ? ' open' : ''));
  c.dataset.id = a.id; c.tabIndex = 0; c.setAttribute('role', 'button');
  c.innerHTML = `<div class="c-head">${icon(a)}<div class="nm"><b>${nameOf(a)}</b><span>${a.sym}</span></div></div>
    <div class="body">${bodyHTML(p)}</div>
    <div class="ext"><div></div></div>`;
  const open = () => (state.view === 'grid' ? openPop(c, a) : toggleExpand(c, a));
  c.onclick = e => { if (e.target.closest('.chart')) return; open(); };
  c.onkeydown = e => { if (e.key === 'Enter' && e.target === c) open(); };
  if (c.classList.contains('open')) mountChart($('.ext > div', c), a);
  return c;
}
function toggleExpand(c, a) {
  const was = c.classList.contains('open');
  document.querySelectorAll('.card.open').forEach(o => o.classList.remove('open'));
  state.openId = was ? null : a.id;
  if (!was) { const box = $('.ext > div', c); if (!box.firstChild) mountChart(box, a); c.classList.add('open'); setTimeout(() => c.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 250); }
}
function render() {
  const root = $('#cards');
  root.className = 'cards ' + state.view;
  root.innerHTML = '';
  if (!state.ids.length) root.append(el('div', 'empty', t('empty')));
  state.ids.forEach(id => root.append(cardEl(byId[id])));
  updateChrome();
}
function updateChrome() {
  $('#title').textContent = t('title');
  $('#stamp').textContent = stampText(state.updated);
  $('#ago').textContent = agoText();
  const note = $('#note');
  const msgKey = state.status === 'partial' ? (CONFIG.WORKER_URL ? 'err' : 'setup') : state.status === 'fail' ? (CONFIG.WORKER_URL ? 'err' : 'setup') : '';
  note.hidden = !msgKey; if (msgKey) note.textContent = t(msgKey);
  $('#btnAdd').setAttribute('aria-label', t('add')); $('#btnConv').setAttribute('aria-label', t('conv')); $('#btnMenu').setAttribute('aria-label', t('set')); $('#refresh').setAttribute('aria-label', t('refresh'));
}

/* ---------------- popup chart (grid) ---------------- */
function openPop(card, a) {
  const p = state.prices[a.id];
  const ov = el('div', 'ov pop-ov'), pop = el('section', 'pop');
  pop.innerHTML = `<div class="c-head">${icon(a)}<div class="nm"><b>${nameOf(a)}</b><span>${a.sym}</span></div></div>
    <div class="chg ${p ? chgCls(p.ch) : ''}">${p ? chgText(p.ch) : ''}</div><div class="px">${p ? fmt(p.p) : '—'}</div>`;
  const box = el('div'); pop.append(box); ov.append(pop); document.body.append(ov);
  mountChart(box, a);
  const kids = [...pop.children];
  // pop is scaled from/to the card's rectangle; transform-origin is the top-left corner (see CSS)
  const flip = (from, to) => `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`;
  const full = pop.getBoundingClientRect();
  card.style.visibility = 'hidden';
  ov.classList.add('in');
  // pop up: grows out of the card with a small spring overshoot
  pop.animate([
    { transform: flip(card.getBoundingClientRect(), full), opacity: .5, offset: 0 },
    { opacity: 1, offset: .3 },
    { transform: 'none', opacity: 1, offset: 1 }
  ], { duration: 560, easing: 'cubic-bezier(.34,1.3,.64,1)' });
  kids.forEach(k => k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: 160, easing: 'ease-out', fill: 'backwards' }));
  let closing = false;
  const close = () => {
    if (closing) return; closing = true;
    document.removeEventListener('keydown', esc);
    const live = document.querySelector(`.card[data-id="${a.id}"]`) || card;
    const to = live.getBoundingClientRect(), cur = pop.getBoundingClientRect();
    ov.classList.remove('in');
    // pop down: content fades first, then the sheet shrinks back into its card
    kids.forEach(k => k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' }));
    const an = pop.animate([
      { transform: 'none', opacity: 1, offset: 0 },
      { opacity: 1, offset: .6 },
      { transform: flip(to, cur), opacity: 0, offset: 1 }
    ], { duration: 420, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    setTimeout(() => { live.style.visibility = ''; card.style.visibility = ''; }, 250);   // card shows through as the sheet fades out
    an.onfinish = () => {
      ov.remove();
      live.animate([{ transform: 'scale(.95)' }, { transform: 'scale(1)' }], { duration: 440, easing: 'cubic-bezier(.34,1.5,.64,1)' });
    };
  };
  const esc = e => e.key === 'Escape' && close();
  document.addEventListener('keydown', esc);
  ov.onclick = e => { if (e.target === ov) close(); };
}

/* ---------------- sheets ---------------- */
function openSheet(title, build) {
  const ov = el('div', 'ov'), sh = el('section', 'sheet');
  const head = el('div', 'sh-head', `<h2>${title}</h2>`);
  const x = el('button', 'icon-btn', '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>');
  x.setAttribute('aria-label', t('close'));
  head.append(x); sh.append(head); ov.append(sh); document.body.append(ov);
  const close = () => { ov.classList.remove('in'); setTimeout(() => ov.remove(), 500); };
  x.onclick = close; ov.onclick = e => { if (e.target === ov) close(); };
  build(sh, close);
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('in')));
}
function openAdd() {
  openSheet(t('add'), sh => {
    const q = el('input', 'inp'); q.type = 'search'; q.placeholder = t('search');
    let cat = 'all';
    const chips = el('div', 'chips'), list = el('div');
    [['all', 'all'], ['fiat', 'fiat'], ['crypto', 'crypto'], ['gold', 'gold']].forEach(([k, l]) => {
      const b = el('button', 'chip' + (k === 'all' ? ' on' : ''), t(l)); b.onclick = () => { cat = k; [...chips.children].forEach(c => c.classList.toggle('on', c === b)); fill(); }; chips.append(b);
    });
    const fill = () => {
      const s = q.value.trim().toLowerCase(); list.innerHTML = '';
      ASSETS.filter(a => (cat === 'all' || a.type === cat) && (!s || (a.en + a.fa + a.sym).toLowerCase().includes(s))).forEach(a => {
        const on = state.ids.includes(a.id), p = state.prices[a.id];
        const r = el('div', 'row', `${icon(a)}<div class="nm"><b>${nameOf(a)}</b><span>${a.sym}${p ? ' · ' + fmt(p.p) : ''}</span></div>`);
        const b = el('button', 'tg' + (on ? ' on' : ''), on ? '✓' : '+');
        b.disabled = !p && state.updated > 0 && !on;
        b.onclick = () => {
          const i = state.ids.indexOf(a.id);
          if (i < 0) state.ids.push(a.id); else state.ids.splice(i, 1);
          store.set('ids', state.ids); b.classList.toggle('on', i < 0); b.textContent = i < 0 ? '✓' : '+';
          render();
        };
        r.append(b); list.append(r);
      });
    };
    q.oninput = fill; sh.append(q, chips, list); fill();
  });
}
function openConverter() {
  openSheet(t('conv'), sh => {
    const opts = [{ id: 'irt', name: t('toman'), p: 1 }].concat(ASSETS.filter(a => state.prices[a.id]).map(a => ({ id: a.id, name: `${nameOf(a)} (${a.sym})`, p: state.prices[a.id].p })));
    const mk = (sel) => { const s = el('select', 'inp sel'); opts.forEach(o => { const op = el('option', '', o.name); op.value = o.id; s.append(op); }); s.value = sel; return s; };
    const a1 = el('input', 'inp'); a1.inputMode = 'decimal'; a1.value = '1'; a1.placeholder = t('amount');
    const s1 = mk(opts.some(o => o.id === 'usd') ? 'usd' : 'irt'), s2 = mk('irt');
    const out = el('div', 'cv-out', '<b>—</b><span></span>');
    const swap = el('button', 'cv-swap', '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/></svg>');
    swap.setAttribute('aria-label', t('swap'));
    const P = id => opts.find(o => o.id === id).p;
    const calc = () => {
      const v = parseFloat(toAscii(a1.value)); const rate = P(s1.value) / P(s2.value);
      const r = v * rate, a = Math.abs(r);
      $('b', out).textContent = isFinite(r) ? nf(a >= 1000 ? { maximumFractionDigits: 0 } : a >= 1 ? { maximumFractionDigits: 2 } : { maximumSignificantDigits: 6 }).format(r) : '—';
      $('span', out).textContent = `1 ${s1.selectedOptions[0].text.split('(').pop().replace(')', '')} = ${nf({ maximumSignificantDigits: 6 }).format(rate)} ${s2.selectedOptions[0].text.split('(').pop().replace(')', '')}`;
    };
    swap.onclick = () => { const x = s1.value; s1.value = s2.value; s2.value = x; swap.style.transform = `rotate(${(swap._r = (swap._r || 0) + 180)}deg)`; calc(); };
    [a1, s1, s2].forEach(e => e.addEventListener('input', calc));
    const r1 = el('div', 'cv-row'); r1.append(a1, s1);
    s2.style.flex = '1';
    const cv = el('div', 'cv'); cv.append(r1, swap, s2, out); sh.append(cv); calc();
  });
}

/* ---------------- settings menu ---------------- */
function buildMenu() {
  const m = $('#menu'); m.innerHTML = '';
  const row = (label, s) => { const d = el('div'); d.append(el('label', '', label), s); m.append(d); };
  row(t('look'), seg([['light', t('light')], ['dark', t('dark')]], state.theme, v => { state.theme = v; store.set('theme', v); applyTheme(); }));
  row(t('layout'), seg([['list', t('list')], ['grid', t('grid')]], state.view, v => { state.view = v; state.openId = null; store.set('view', v); transition(render); }));
  row(t('lang'), seg([['en', 'English'], ['fa', 'فارسی']], state.lang, v => { state.lang = v; store.set('lang', v); applyLang(); transition(() => { render(); buildMenu(); }); }));
}
const transition = fn => (document.startViewTransition ? document.startViewTransition(fn) : fn());
function applyTheme() { document.documentElement.dataset.theme = state.theme; $('meta[name=theme-color]').content = state.theme === 'dark' ? '#000000' : '#f2f2f7'; }
function applyLang() { const h = document.documentElement; h.lang = state.lang; h.dir = state.lang === 'fa' ? 'rtl' : 'ltr'; document.title = 'IR Currency | ایران ارز'; }
function toggleMenu(force) {
  const m = $('#menu'), open = force != null ? force : !m.classList.contains('open');
  m.classList.toggle('open', open); m.setAttribute('aria-hidden', !open); $('#btnMenu').setAttribute('aria-expanded', open);
}

/* ---------------- refresh & boot ---------------- */
let busy = false;
async function refresh() {
  if (busy) return; busy = true;
  $('#refresh').classList.add('spin');
  try { await loadRates(); }
  catch { state.status = Object.keys(state.prices).length ? 'partial' : 'fail'; }
  busy = false; $('#refresh').classList.remove('spin');
  patchCards();
  if (state.updated) warmUp();
}
(function boot() {
  const ua = navigator.userAgent;
  if (/Chrom/.test(ua) && !/iPhone|iPad|Android.*Firefox/.test(ua)) document.documentElement.classList.add('refract');
  applyTheme(); applyLang(); buildMenu(); render();
  $('#refresh').onclick = refresh;
  $('#btnAdd').onclick = openAdd;
  $('#btnConv').onclick = openConverter;
  $('#btnMenu').onclick = e => { e.stopPropagation(); toggleMenu(); };
  document.addEventListener('click', e => { if (!e.target.closest('#menu')) toggleMenu(false); });
  setInterval(() => { $('#ago').textContent = agoText(); }, 20000);
  setInterval(() => { if (!document.hidden) refresh(); }, CONFIG.REFRESH_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - state.updated > CONFIG.REFRESH_MS) refresh(); });
  refresh();
  window.IRC = { state, ASSETS, keys: () => state.tgjuKeys }; // debugging: IRC.keys() lists tgju keys
})();