import { environment } from '../environments/environment';

// ===================================================================
// CONFIGURACIÓN DE FIREBASE PARA RECITAPP - ARCHIVO DE EJEMPLO
// ===================================================================
// 
// INSTRUCCIONES:
// 1. Copia este archivo como 'firebase-config.ts'
// 2. Reemplaza todos los valores de ejemplo con tu configuración real de Firebase
// 3. El archivo real ya está en .gitignore para proteger tus credenciales
//

// Firebase configuration for RecitApp
export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-ABC123DEF4"
};

// VAPID key for push notifications
export const vapidKey = "TU_CLAVE_VAPID_PUBLICA_AQUI";

// Note: Obtén estos valores de tu Firebase Console:
// 1. Project Settings > General > Your apps > Web app
// 2. Para VAPID key: Project Settings > Cloud Messaging > Web configuration 