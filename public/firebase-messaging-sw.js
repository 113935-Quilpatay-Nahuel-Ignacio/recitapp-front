// Firebase Messaging Service Worker
// Este archivo debe estar en la carpeta public/ para ser accesible desde la raíz

// Importar scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con firebase-config.ts)
// ✅ CONFIGURACIÓN REAL DESDE FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCzqGYrhYcYWsTG0SA6kzaXNxT6HxJbNHM",
  authDomain: "recitapp-niquilpatay.firebaseapp.com", 
  projectId: "recitapp-niquilpatay",
  storageBucket: "recitapp-niquilpatay.firebasestorage.app",
  messagingSenderId: "465296679606",
  appId: "1:465296679606:web:405f7d93bbcb4c2434fc17"
};

// Inicializar Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Manejar notificaciones en background (cuando la app no está activa)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Personalizar la notificación
  const notificationTitle = payload.notification.title || 'RecitApp';
  const notificationOptions = {
    body: payload.notification.body || 'Tienes una nueva notificación',
    icon: payload.notification.icon || '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    image: payload.notification.image,
    data: payload.data,
    tag: 'recitapp-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/assets/icons/open-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Cerrar',
        icon: '/assets/icons/close-icon.png'
      }
    ]
  };

  // Mostrar la notificación
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en las notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Abrir la aplicación o enfocar si ya está abierta
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function(clientList) {
      // Si hay una ventana abierta, enfocarla
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/notifications';
        return clients.openWindow(self.location.origin + urlToOpen);
      }
    })
  );
}); 