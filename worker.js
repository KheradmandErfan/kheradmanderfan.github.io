// Cloudflare Worker: CORS-enabled proxy for tgju.org data.
// Routes:  GET /rates            -> https://call5.tgju.org/ajax.json
//          GET /history?slug=X   -> https://api.tgju.org/v1/market/indicator/summary-table-data/X
// Deploy: wrangler deploy   (then paste the *.workers.dev URL into CONFIG.WORKER_URL in app.js)
const ALLOWED_ORIGINS = ['*']; // e.g. ['https://kheradmanderfan.github.io'] to restrict

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '*';
    const allow = ALLOWED_ORIGINS.includes('*') ? '*' : ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const cors = { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': '*', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    let target, ttl;
    if (url.pathname === '/rates') { target = 'https://call5.tgju.org/ajax.json'; ttl = 20; }
    else if (url.pathname === '/history') {
      const slug = url.searchParams.get('slug') || '';
      if (!/^[a-z0-9_\-]+$/i.test(slug)) return new Response('bad slug', { status: 400, headers: cors });
      target = `https://api.tgju.org/v1/market/indicator/summary-table-data/${slug}`; ttl = 1800;
    } else return new Response('IR Currency proxy: use /rates or /history?slug=', { status: 404, headers: cors });

    const cache = caches.default, key = new Request(target);
    let res = await cache.match(key);
    if (!res) {
      const up = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://www.tgju.org/' } });
      if (!up.ok) return new Response(JSON.stringify({ error: up.status }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
      res = new Response(up.body, up);
      res.headers.set('Cache-Control', `public, max-age=${ttl}`);
      ctx.waitUntil(cache.put(key, res.clone()));
    }
    const out = new Response(res.body, res);
    Object.entries(cors).forEach(([k, v]) => out.headers.set(k, v));
    out.headers.set('Content-Type', 'application/json; charset=utf-8');
    return out;
  }
};
