// Fishing Map service worker: app shell offline, map tiles only when already cached.
const VER = 'fm-v3.0';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js', 'https://unpkg.com/suncalc@1.9.0/suncalc.js'];
const TILE_CACHE = 'fm-tiles', DATA_CACHE = 'fm-data', MAX_TILES = 2500, MAX_DATA = 300;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('fm-v') && k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function trim(name, max) { const c = await caches.open(name); const ks = await c.keys(); for (let i = 0; i < ks.length - max; i++) await c.delete(ks[i]); }
const isTile = u => /World_Imagery\/MapServer\/tile|DEM_global_mosaic\/ImageServer\/exportImage/.test(u);
const isData = u => /services\.arcgis\.com\/6lCKYNJLvwTXqrmp|gis\.ecology\.wa\.gov|geodataservices\.wdfw\.wa\.gov|data\.wa\.gov\/resource|hydro\.nationalmap\.gov|api\.open-meteo\.com/.test(u);
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = r.url;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html', {ignoreSearch: true}).then(m => m || caches.match('./'))));
    return;
  }
  if (SHELL.some(s => u.endsWith(s.replace('./', '/'))) || u.startsWith('https://unpkg.com/')) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); return res; })));
    return;
  }
  if (isTile(u)) { // network first, keep a copy; offline uses cached tiles only
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(TILE_CACHE).then(c => c.put(r, cp)).then(() => trim(TILE_CACHE, MAX_TILES)); } return res; })
      .catch(() => caches.match(r).then(m => m || new Response('', {status: 504}))));
    return;
  }
  if (isData(u)) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(DATA_CACHE).then(c => c.put(r, cp)).then(() => trim(DATA_CACHE, MAX_DATA)); } return res; })
      .catch(() => caches.match(r).then(m => m || new Response('{"error":"offline"}', {status: 503, headers: {'Content-Type': 'application/json'}}))));
  }
});
