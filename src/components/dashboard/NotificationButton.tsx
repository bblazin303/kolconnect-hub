import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

export function NotificationButton() {
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead, 
    clearNotification 
  } = useNotifications()

  const handleNotificationClick = (notificationId: string, read: boolean) => {
    if (!read) {
      markAsRead(notificationId)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs z-10 min-w-4"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                >
                  <div className="flex items-start space-x-3">
                    {notification.sender?.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.sender.avatar} />
                        <AvatarFallback>
                          {notification.sender.name.charAt(1)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          {notification.sender && (
                            <p className="text-xs text-muted-foreground">
                              from {notification.sender.name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true
                            })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              clearNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Navigate to messages page
                  window.location.href = '/dashboard/messages'
                }}
              >
                View all messages
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}