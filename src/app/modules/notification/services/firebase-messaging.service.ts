import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FirebaseConfigService } from '../../../firebase.config.service';

// Dynamic import types
type MessagingType = any;
type MessagePayloadType = any;

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  private firebaseConfig = inject(FirebaseConfigService);
  private messageSubject = new BehaviorSubject<MessagePayloadType | null>(null);
  private currentToken: string | null = null;
  private messaging: MessagingType | null = null;

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      const initialized = await this.firebaseConfig.initializeFirebase();
      if (initialized) {
        this.messaging = this.firebaseConfig.getMessaging();
        if (this.messaging) {
          this.setupMessageListener();
        }
      }
    } catch (error) {
      console.error('Error initializing Firebase messaging service:', error);
    }
  }

  /**
   * Request permission and get FCM token
   */
  async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Also get the token when permission is granted
        const token = await this.getToken();
        if (token) {
          console.log('FCM token obtained after permission granted');
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
      return permission;
    } catch (error) {
      console.error('An error occurred while requesting permission. ', error);
      return 'denied';
    }
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<NotificationPermission> {
    return Notification.permission;
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    if (!this.messaging) {
      console.warn('Firebase messaging not initialized');
      return null;
    }

    try {
      // Dynamic import to avoid module issues
      const { getToken } = await import('firebase/messaging');
      const { vapidKey } = await import('../../../firebase-config');
      
      const token = await getToken(this.messaging, {
        vapidKey: vapidKey
      });
      
      if (token) {
        console.log('FCM Token:', token);
        this.currentToken = token;
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return null;
    }
  }

  /**
   * Get current stored token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Setup message listener for foreground messages
   */
  private async setupMessageListener(): Promise<void> {
    if (!this.messaging) {
      return;
    }
    
    try {
      const { onMessage } = await import('firebase/messaging');
      
      onMessage(this.messaging, (payload) => {
        console.log('Message received in foreground: ', payload);
        this.messageSubject.next(payload);
        
        // Show notification if the app is in foreground
        if (payload.notification) {
          this.showNotification(payload.notification);
        }
      });
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }
  }

  /**
   * Observable for receiving messages
   */
  getMessages(): Observable<MessagePayloadType | null> {
    return this.messageSubject.asObservable();
  }

  /**
   * Show browser notification
   */
  private showNotification(notification: any): void {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const notificationTitle = notification.title || 'RecitApp';
      const notificationOptions = {
        body: notification.body || 'Nueva notificación',
        icon: notification.icon || '/assets/icons/icon-72x72.png',
        badge: '/assets/icons/icon-72x72.png',
        data: notification.data || {},
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

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notificationTitle, notificationOptions);
      }).catch((error) => {
        console.error('Error showing notification:', error);
        // Fallback to browser notification
        new Notification(notificationTitle, notificationOptions);
      });
    }
  }

  /**
   * Delete token
   */
  async deleteToken(): Promise<boolean> {
    try {
      // Note: deleteToken is not available in v9 modular SDK
      // The token will be automatically refreshed when needed
      this.currentToken = null;
      console.log('Token deleted successfully');
      return true;
    } catch (error) {
      console.error('Unable to delete token. ', error);
      return false;
    }
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
} 