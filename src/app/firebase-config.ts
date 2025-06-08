// Firebase configuration for RecitApp Frontend
// ✅ CONFIGURACIÓN REAL DESDE FIREBASE CONSOLE
export const firebaseConfig = {
  apiKey: "AIzaSyCzqGYrhYcYWsTG0SA6kzaXNxT6HxJbNHM",
  authDomain: "recitapp-niquilpatay.firebaseapp.com",
  projectId: "recitapp-niquilpatay",
  storageBucket: "recitapp-niquilpatay.firebasestorage.app",
  messagingSenderId: "465296679606",
  appId: "1:465296679606:web:405f7d93bbcb4c2434fc17",
  measurementId: "G-PE8KGJD89P"
};

// VAPID Key para Web Push Notifications
// ✅ CONFIGURACIÓN REAL DESDE FIREBASE CONSOLE
export const vapidKey = "BK7hiDOD5gocnmqmqiJ-nRXT2oo3JAGrfntmNohq5abTF1osFrmtCVY-nTGSXVwjiffWl3a7PzcN6MD2XptwOx0";

// Configuración de FCM
export const fcmConfig = {
  vapidKey: vapidKey,
  serviceWorkerPath: '/firebase-messaging-sw.js'
};

// 🔧 INSTRUCCIONES PARA OBTENER CONFIGURACIÓN REAL:
// 
// 1. Ir a https://console.firebase.google.com/
// 2. Seleccionar proyecto "recitapp-niquilpatay"
// 3. Project Settings > General > Your apps
// 4. Click "Add app" > Web (</>)
// 5. Nickname: "RecitApp Web"
// 6. Copiar la configuración aquí
// 7. Ir a Cloud Messaging > Web configuration
// 8. Click "Generate key pair"
// 9. Copiar VAPID key aquí 