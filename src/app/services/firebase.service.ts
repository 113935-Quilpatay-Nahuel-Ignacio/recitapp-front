import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private messaging: any;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const app = initializeApp(environment.firebase);
    this.messaging = getMessaging(app);
  }

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      const token = await getToken(this.messaging, { 
        vapidKey: environment.firebase.vapidKey 
      });
      
      console.log('Firebase token generated:', token);
      return token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  onMessage(callback: (payload: any) => void) {
    onMessage(this.messaging, callback);
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'Notification' in window;
  }
} 