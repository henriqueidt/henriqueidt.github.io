const cacheName = 'v1'

self.addEventListener('install', event => {
  console.log('serice worker installed')
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
  console.log('service worker fetching')
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone()
        caches
          .open(cacheName)
          .then(cache => {
            cache.put(event.request, resClone)
          })
        return res
      })
      .catch(err => {
        caches.match(event.request)
          .then(res => res)
      })
  )
})