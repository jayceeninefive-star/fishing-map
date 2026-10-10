// Fishing Map service worker: app shell offline, map tiles only when already cached.
// v5: version bump wipes older (v2-v4) shells; pages always fetch fresh HTML when online (bypassing the HTTP cache).
const VER = 'fm-v6.0', APP = 'v6.0';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js', 'https://unpkg.com/suncalc@1.9.0/suncalc.js'];
const SHELL_ABS = SHELL.map(u => new URL(u, self.registration.scope).href);
const TILE_CACHE = 'fm-tiles', DATA_CACHE = 'fm-data', MAX_TILES = 2500, MAX_DATA = 300;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => { const old = ks.filter(k => k.startsWith('fm-v') && k !== VER); const legacy = old.some(k => /^fm-v[1-4]\./.test(k));
      return Promise.all(old.map(k => caches.delete(k))).then(() => legacy); })
    .then(legacy => self.clients.claim().then(() => self.clients.matchAll({type: 'window'})).then(cs => cs.forEach(c => {
      // Upgrading from v4 or older: those pages have no update prompt, so reload them once onto the new version.
      if (legacy && c.navigate) c.navigate(c.url).catch(() => c.postMessage({type: 'version', ver: VER, app: APP}));
      else c.postMessage({type: 'version', ver: VER, app: APP});
    }))));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); if (e.data === 'version' && e.source) e.source.postMessage({type: 'version', ver: VER, app: APP}); });
// trimming is throttled: listing a 2500-entry cache on every tile was a real cost
const puts = {};
function keep(name, max, req, res) {
  caches.open(name).then(c => c.put(req, res)).then(() => { puts[name] = (puts[name] || 0) + 1; if (puts[name] % 50 === 0) return trim(name, max); }).catch(() => {});
}
async function trim(name, max) { const c = await caches.open(name); const ks = await c.keys(); for (let i = 0; i < ks.length - max; i++) await c.delete(ks[i]); }
const isTile = u => /World_Imagery\/MapServer\/tile|DEM_global_mosaic\/ImageServer\/exportImage/.test(u);
const isData = u => /encdirect.noaa.gov|services\.arcgis\.com\/6lCKYNJLvwTXqrmp|gis\.ecology\.wa\.gov|geodataservices\.wdfw\.wa\.gov|data\.wa\.gov\/resource|hydro\.nationalmap\.gov|api\.open-meteo\.com|tigerweb\.geo\.census\.gov|services1\.arcgis\.com\/fBc8EJBxQRMcHlei|services\.arcgis\.com\/QVENGdaPbd4LUkLV|services2\.arcgis\.com\/FiaPA4ga0iQKduv3|\/data\/emergency-rules\.json/.test(u);
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = r.url;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r.url, {cache: 'no-cache', credentials: 'same-origin'}).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put('./index.html', cp)); } return res; })
      .catch(() => caches.match('./index.html', {ignoreSearch: true}).then(m => m || caches.match('./'))));
    return;
  }
  if (SHELL_ABS.includes(u.split('?')[0])) {
    e.respondWith(caches.match(r, {ignoreSearch: true}).then(m => m || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; })));
    return;
  }
  if (isTile(u)) { // network first, keep a copy; offline uses cached tiles only
    e.respondWith(fetch(r).then(res => { if (res.ok) keep(TILE_CACHE, MAX_TILES, r, res.clone()); return res; })
      .catch(() => caches.match(r).then(m => m || new Response('', {status: 504}))));
    return;
  }
  if (isData(u)) {
    e.respondWith(fetch(r).then(res => { if (res.ok) keep(DATA_CACHE, MAX_DATA, r, res.clone()); return res; })
      .catch(err => { if (r.signal && r.signal.aborted) throw err; return caches.match(r).then(m => m || new Response('{"error":{"message":"offline"}}', {status: 503, headers: {'Content-Type': 'application/json'}})); }));
  }
});
