
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Notification, NotificationPreferences } from '@/types/notification.types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  isPreferencesLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (data: { 
    email?: Partial<NotificationPreferences['email']>, 
    inApp?: Partial<NotificationPreferences['inApp']> 
  }) => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [pollingInterval, setPollingInterval] = useState<number | false>(false);

  // Fetch notifications
  const { 
    data: notificationsData, 
    isLoading, 
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getAll(),
    enabled: isAuthenticated,
    refetchInterval: pollingInterval,
  });

  // Fetch unread count
  const { 
    data: unreadCountData,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.notifications.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: pollingInterval,
  });

  // Fetch notification preferences
  const { 
    data: preferencesData,
    isLoading: isPreferencesLoading
  } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => api.notifications.getPreferences(),
    enabled: isAuthenticated,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark notification as read');
    }
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark all notifications as read');
    }
  });

  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: { 
      email?: Partial<NotificationPreferences['email']>, 
      inApp?: Partial<NotificationPreferences['inApp']> 
    }) => api.notifications.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      toast.success('Notification preferences updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification preferences');
    }
  });

  // When user is authenticated, start polling for notifications
  useEffect(() => {
    if (isAuthenticated) {
      setPollingInterval(30000); // Poll every 30 seconds
    } else {
      setPollingInterval(false); // Disable polling when not authenticated
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
  }, [markAsReadMutation]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  // Update notification preferences
  const updatePreferences = useCallback(async (data: { 
    email?: Partial<NotificationPreferences['email']>, 
    inApp?: Partial<NotificationPreferences['inApp']> 
  }) => {
    await updatePreferencesMutation.mutateAsync(data);
  }, [updatePreferencesMutation]);

  // Refetch notifications
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchNotifications(),
      refetchUnreadCount()
    ]);
  }, [refetchNotifications, refetchUnreadCount]);

  const value = {
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadCountData?.count || 0,
    preferences: preferencesData?.preferences || null,
    isLoading,
    isPreferencesLoading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    refetchNotifications: refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
