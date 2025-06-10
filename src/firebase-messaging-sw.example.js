// ===================================================================
// SERVICE WORKER DE FIREBASE MESSAGING - ARCHIVO DE EJEMPLO
// ===================================================================
//
// INSTRUCCIONES:
// 1. Copia este archivo como 'firebase-messaging-sw.js'
// 2. Reemplaza la configuración de ejemplo con tu configuración real de Firebase
// 3. El archivo real ya está en .gitignore para proteger tus credenciales
//

// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration - REEMPLAZA CON TU CONFIGURACIÓN REAL
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-ABC123DEF4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'RecitApp';
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación',
    icon: '/assets/icons/icon-72x72.png',
    badge: '/assets/icons/icon-72x72.png',
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Handle view action
    const data = event.notification.data;
    let url = '/';
    
    // Navigate based on notification data
    if (data.eventId) {
      url = `/events/${data.eventId}`;
    } else if (data.artistId) {
      url = `/artists/${data.artistId}`;
    } else if (data.venueId) {
      url = `/venues/${data.venueId}`;
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
  // 'dismiss' action just closes the notification (default behavior)
}); 