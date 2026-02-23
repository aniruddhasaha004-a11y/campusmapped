self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("kiit-route-app").then(cache => {
      return cache.addAll([
        "/",
        "/index.html"
      ]);
    })
  );
});