
import React, { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Notification as NotificationType } from '@/types/notification.types';
import { Link } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';

const NotificationItem: React.FC<{
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  // Get appropriate badge type based on notification type
  const getBadgeVariant = () => {
    switch (notification.type) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <Card className={`mb-4 ${notification.read ? 'bg-background' : 'bg-muted/30 border-primary/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Badge variant={getBadgeVariant() as any} className="mr-2">
                  {notification.type}
                </Badge>
                {notification.emailSent && (
                  <Badge variant="outline" className="gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="text-xs">Email sent</span>
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <h3 className={`text-base ${notification.read ? 'font-medium' : 'font-semibold'}`}>
              {notification.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              {notification.message}
            </p>
            
            <div className="flex justify-between items-center">
              {notification.link ? (
                <Link
                  to={notification.link}
                  className="text-sm text-primary hover:underline"
                  onClick={handleMarkAsRead}
                >
                  View details
                </Link>
              ) : (
                <div />
              )}
              
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1"
                  onClick={handleMarkAsRead}
                >
                  <Check className="h-4 w-4" />
                  <span>Mark as read</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Notifications: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p>Loading notifications...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You have no unread notifications'}
          </p>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
          >
            Unread
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="secondary"
              size="sm"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground mt-1">
                {filter === 'all' 
                  ? "You don't have any notifications yet"
                  : "You don't have any unread notifications"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Link to="/notifications/preferences" className="text-primary hover:underline">
          Manage notification preferences
        </Link>
      </div>
    </div>
  );
};

export default Notifications;
