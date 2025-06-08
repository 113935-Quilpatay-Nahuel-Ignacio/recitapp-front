import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken, Messaging } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from '../../../firebase-config';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  private messaging: Messaging | null = null;
  private currentToken = new BehaviorSubject<string | null>(null);
  private messageSubject = new BehaviorSubject<any>(null);

  constructor(private notificationService: NotificationService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Inicializar Firebase si no está ya inicializado
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
      
      // Verificar si estamos en un entorno que soporta messaging
      if (this.isPushNotificationSupported()) {
        this.messaging = getMessaging();
        console.log('Firebase Messaging initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  async requestPermission(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('Firebase messaging not initialized.');
        return null;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return this.getToken();
      } else {
        console.log('Unable to get permission to notify.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('Firebase messaging not initialized.');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: vapidKey
      });
      
      if (token) {
        console.log('FCM registration token obtained:', token);
        this.currentToken.next(token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  listenForMessages(): Observable<any> {
    if (!this.messaging) {
      console.warn('Firebase messaging not initialized.');
      return this.messageSubject.asObservable();
    }

    onMessage(this.messaging, (payload: any) => {
      console.log('Message received in foreground:', payload);
      this.messageSubject.next(payload);
      
      // Show notification in foreground
      this.showNotification(payload.notification);
    });

    return this.messageSubject.asObservable();
  }

  private showNotification(notification: any) {
    if (Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: 'recitapp-notification',
        requireInteraction: true
      });

      notif.onclick = () => {
        // Handle notification click
        window.focus();
        notif.close();
      };
    }
  }

  getCurrentToken(): Observable<string | null> {
    return this.currentToken.asObservable();
  }

  async deleteTokenFromFirebase(): Promise<boolean> {
    try {
      if (!this.messaging) {
        return false;
      }

      await deleteToken(this.messaging);
      this.currentToken.next(null);
      console.log('Token deleted successfully');
      return true;
    } catch (error) {
      console.error('Unable to delete token:', error);
      return false;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        return null;
      }

      // Delete current token
      await this.deleteTokenFromFirebase();
      
      // Get new token
      return this.getToken();
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Register device token with backend
  async registerDeviceToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      
      if (token) {
        const deviceType = this.getDeviceType();
        const deviceName = this.getDeviceName();
        
        await this.notificationService.registerDeviceToken(token, deviceType, deviceName).toPromise();
        console.log('Device token registered successfully with backend');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error registering device token with backend:', error);
      return false;
    }
  }

  // Helper method to detect device type
  getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'IOS';
    } else if (/android/.test(userAgent)) {
      return 'ANDROID';
    } else {
      return 'WEB';
    }
  }

  // Helper method to get device name
  getDeviceName(): string {
    const userAgent = navigator.userAgent;
    
    // Extract browser and OS info
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    
    if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
    
    if (userAgent.indexOf('Windows') > -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') > -1) os = 'MacOS';
    else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
    else if (userAgent.indexOf('Android') > -1) os = 'Android';
    else if (userAgent.indexOf('iPhone') > -1) os = 'iOS';
    
    return `${browser} on ${os}`;
  }

  // Check if push notifications are supported
  isPushNotificationSupported(): boolean {
    // Verificar si estamos en el navegador (no en SSR)
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current notification permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Initialize push notifications automatically
  async initializePushNotifications(): Promise<boolean> {
    try {
      if (!this.isPushNotificationSupported()) {
        console.warn('Push notifications are not supported');
        return false;
      }

      // Request permission
      const token = await this.requestPermission();
      
      if (token) {
        // Register with backend
        await this.registerDeviceToken();
        
        // Listen for messages
        this.listenForMessages().subscribe(message => {
          console.log('New message received:', message);
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }
} 