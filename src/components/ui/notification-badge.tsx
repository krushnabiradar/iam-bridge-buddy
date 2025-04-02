
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const notificationBadgeVariants = cva(
  "absolute rounded-full flex items-center justify-center font-medium",
  {
    variants: {
      size: {
        sm: "h-4 w-4 text-[10px]",
        default: "h-5 w-5 text-xs",
        lg: "h-6 w-6 text-sm",
      },
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      position: {
        "top-right": "-top-1 -right-1",
        "top-left": "-top-1 -left-1",
        "bottom-right": "-bottom-1 -right-1",
        "bottom-left": "-bottom-1 -left-1",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
      position: "top-right",
    },
  }
);

export interface NotificationBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof notificationBadgeVariants> {
  count: number;
  maxCount?: number;
}

const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ className, count, maxCount = 9, variant, size, position, ...props }, ref) => {
    if (count <= 0) return null;
    
    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
    
    return (
      <span
        ref={ref}
        className={cn(notificationBadgeVariants({ variant, size, position }), className)}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);

NotificationBadge.displayName = "NotificationBadge";

export { NotificationBadge, notificationBadgeVariants };
