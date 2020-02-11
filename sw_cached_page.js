const cacheName = 'v2'

const cacheAssets = [
  '/',
  'index.html',
  '/js/main.js',
  'styles.css',
  'assets/icons8-edit-192.png',
  'assets/icons8-edit-512.png',
  'assets/trash-can.svg'
];

self.addEventListener('install', event => {
  console.log('serice worker installed')
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        console.log('service worker caching files')
        cache.addAll(cacheAssets)
      })
      .then(() => {
        self.skipWaiting()
      })
  )
})

self.addEventListener('activate', event => {
  console.log('serice worker activated')
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== cacheName) {
              console.log('service worker clearing old cache')
              return caches.delete(cache)
            }
          })
        )
      })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
      return cachedResponse || fetch(event.request)
    })
  )
})