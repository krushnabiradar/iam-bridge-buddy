
export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  _id: string;
  user: string;
  email: {
    securityAlerts: boolean;
    accountUpdates: boolean;
    roleChanges: boolean;
  };
  inApp: {
    securityAlerts: boolean;
    accountUpdates: boolean;
    roleChanges: boolean;
  };
  updatedAt: string;
}

export interface NotificationCountResponse {
  message: string;
  count: number;
}

export interface NotificationsResponse {
  message: string;
  notifications: Notification[];
}

export interface NotificationPreferencesResponse {
  message: string;
  preferences: NotificationPreferences;
}
