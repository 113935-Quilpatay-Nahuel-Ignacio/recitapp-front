import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private initialized = false;

  async initializeFirebase(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      // Import the config dynamically
      const { firebaseConfig } = await import('./firebase-config');
      
      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      
      // Initialize messaging if supported
      const messagingSupported = await isSupported();
      if (messagingSupported) {
        this.messaging = getMessaging(this.app);
      }
      
      this.initialized = true;
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      console.warn('Make sure to copy firebase-config.example.ts to firebase-config.ts and add your real credentials');
      return false;
    }
  }

  getApp(): FirebaseApp | null {
    return this.app;
  }

  getMessaging(): Messaging | null {
    return this.messaging;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
} 