// IQ Market — известия (push) за уеб приложението чрез Firebase Cloud Messaging.
// Работи в отделен обхват (/firebase-cloud-messaging-push-scope), не пречи на sw.js.
// Известията с заглавие и текст (от send-fcm) Firebase показва сам, когато сайтът е затворен.

// Натискане на известие → отваря магазина (или фокусира вече отворения прозорец).
// Слага се ПРЕДИ скриптовете на Firebase, за да е първи.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.stopImmediatePropagation();
  event.waitUntil((async () => {
    const wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.includes('/store.html') && 'focus' in w) return w.focus();
    }
    return clients.openWindow('/store.html');
  })());
});

importScripts('/firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp(self.IQM_FIREBASE);
firebase.messaging();
