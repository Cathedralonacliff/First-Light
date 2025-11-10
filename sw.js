"use strict";

var CACHE_NAME = "first-light-v1";
var ASSETS = ["/", "/index.html", "/sw.js"];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(networkResponse) {
        return networkResponse;
      }).catch(function() {
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
