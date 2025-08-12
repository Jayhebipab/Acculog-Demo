self.addEventListener("install", (event) => {
  console.log("📦 Service Worker installed");
  event.waitUntil(
    caches.open("acculog-cache").then((cache) => {
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
