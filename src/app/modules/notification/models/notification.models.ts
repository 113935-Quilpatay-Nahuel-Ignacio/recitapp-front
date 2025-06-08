// Notification Models for RecitApp Frontend

export type NotificationChannel = 'EMAIL' | 'PUSH' | 'SMS';
export type NotificationType = 'NUEVO_EVENTO' | 'POCAS_ENTRADAS' | 'CANCELACION' | 'MODIFICACION' | 'RECOMENDACION' | 'RECORDATORIO';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
export type DeviceType = 'ANDROID' | 'IOS' | 'WEB';

export interface NotificationPreferences {
  channels: Record<NotificationChannel, boolean>;
  types: Record<NotificationType, boolean>;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: DeliveryStatus;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  eventId?: number;
}

export interface NotificationHistory {
  notifications: Notification[];
  totalCount: number;
  page: number;
  size: number;
}

export interface DeviceToken {
  id: number;
  userId: number;
  token: string;
  deviceType: DeviceType;
  deviceInfo?: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  channelStats: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
}

export interface SmsNotificationData {
  phoneNumber: string;
  message: string;
}

export interface NotificationRequest {
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
  eventId?: number;
  userIds?: number[];
}

export interface BulkNotificationRequest {
  type: NotificationType;
  eventId?: number;
  userIds: number[];
  customMessage?: string;
}

export interface NotificationTemplate {
  id: number;
  type: NotificationType;
  channel: NotificationChannel;
  name: string;
  subject?: string;
  template: string;
  isActive: boolean;
}

export interface UserNotificationSettings {
  userId: number;
  preferences: NotificationPreferences;
  deviceTokens: DeviceToken[];
  createdAt: Date;
  updatedAt: Date;
}

// Firebase specific interfaces
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FCMConfig {
  vapidKey: string;
  serviceWorkerPath: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Test notification interfaces
export interface TestNotificationRequest {
  channel: NotificationChannel;
  message?: string;
}

export interface TestEmailRequest {
  to?: string;
  subject?: string;
  message?: string;
}

export interface TestPushRequest {
  deviceToken?: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

export interface TestSmsRequest {
  phoneNumber?: string;
  message?: string;
}

// Event-related notification interfaces
export interface EventNotificationData {
  eventId: number;
  eventName: string;
  eventDate: Date;
  venueName: string;
  ticketPrice?: number;
  remainingTickets?: number;
  imageUrl?: string;
}

export interface TicketNotificationData {
  ticketId: number;
  eventId: number;
  eventName: string;
  eventDate: Date;
  venueName: string;
  seatInfo?: string;
  qrCode?: string;
  purchaseDate: Date;
}

// Notification scheduling interfaces
export interface ScheduledNotification {
  id: number;
  type: NotificationType;
  eventId?: number;
  scheduledFor: Date;
  isProcessed: boolean;
  createdAt: Date;
}

export interface NotificationScheduleRequest {
  type: NotificationType;
  eventId?: number;
  scheduledFor: Date;
  userIds?: number[];
}

// Error handling interfaces
export interface NotificationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface NotificationValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
} 