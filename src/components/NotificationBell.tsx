
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification.types';
import { Link } from 'react-router-dom';

const NotificationItem: React.FC<{ 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  // Function to render different icons based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />;
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />;
      case 'warning':
        return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />;
    }
  };

  // Calculate relative time
  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const handleClick = (e: React.MouseEvent) => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  const content = (
    <div 
      className={`p-3 border-b last:border-b-0 transition-colors ${notification.read ? 'bg-background' : 'bg-muted/30'}`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex items-center pt-1">
          {getIcon()}
        </div>
        <div className="flex-1 ml-2">
          <div className="flex justify-between items-start">
            <h4 className={`text-sm font-medium ${notification.read ? '' : 'font-semibold'}`}>{notification.title}</h4>
            <span className="text-xs text-muted-foreground ml-2">{relativeTime}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} className="block hover:bg-muted/40">
        {content}
      </Link>
    );
  }

  return <div className="hover:bg-muted/40">{content}</div>;
};

const EmptyNotifications: React.FC = () => (
  <div className="p-4 text-center">
    <p className="text-muted-foreground text-sm">No notifications</p>
  </div>
);

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setOpen(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </ScrollArea>
        
        <div className="p-2 border-t text-center">
          <Link
            to="/notifications"
            className="text-sm text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
