if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('../sw_cached_page.js')
      .then(reg => console.log('service worker registered'))
      .catch(err => console.log(error))
  })
}