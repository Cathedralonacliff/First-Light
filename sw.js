"use strict";
var CACHE_NAME = "first-light-v1";
var ASSETS = ["/", "/index.html", "/sw.js"];

self.addEventListener("install", function(event) {
  console.log("%cFirst Light SW: Installing with kindness—caching essentials... 😊", "color:#00e7ff");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      console.log("%cFirst Light SW: Essentials cached successfully! Ready to skip waiting.", "color:#00e7ff");
      return self.skipWaiting();
    }).catch(function(err) {
      console.error("%cFirst Light SW: Oops, a little hiccup during install— " + err + ". We'll try again next time! 🌟", "color:#ff8585");
    })
  );
});

self.addEventListener("activate", function(event) {
  console.log("%cFirst Light SW: Activating with a gentle touch... Cleaning up old caches.", "color:#00e7ff");
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { 
              console.log("%cFirst Light SW: Peacefully removing old cache: " + key, "color:#00e7ff");
              return caches.delete(key); 
            })
      );
    }).then(function() {
      console.log("%cFirst Light SW: Cleanup done—claiming clients with care!", "color:#00e7ff");
      return self.clients.claim();
    }).catch(function(err) {
      console.error("%cFirst Light SW: Whoops, activation had a moment— " + err + ". Still here for you! 😊", "color:#ff8585");
    })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
    console.log("%cFirst Light SW: Skipping non-GET request gracefully.", "color:#00e7ff");
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        console.log("%cFirst Light SW: Serving from cache—quick and kind! 🌟", "color:#00e7ff");
        return cached;
      }
      return fetch(event.request).then(function(networkResponse) {
        // Clone and cache for future
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
          console.log("%cFirst Light SW: Cached new resource patiently for next time.", "color:#00e7ff");
        }).catch(function(err) {
          console.error("%cFirst Light SW: Minor caching skip— " + err + ". No worries!", "color:#ff8585");
        });
        return networkResponse;
      }).catch(function() {
        console.error("%cFirst Light SW: Network hiccup—falling back with forgiveness.", "color:#ff8585");
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
