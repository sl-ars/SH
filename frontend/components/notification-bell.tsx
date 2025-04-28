"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useState, useEffect } from "react"
import { NotificationContext } from "@/contexts/notification-context"
import { useContext } from "react"

export function NotificationBell() {
  // Always call hooks at the top level
  const notificationContext = useContext(NotificationContext)
  const [mounted, setMounted] = useState(false)

  // Use useEffect to track when the component has mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet or context is not available, render a simplified bell
  if (!mounted || !notificationContext) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-gradient-to-r hover:from-vibrant-blue hover:to-vibrant-purple hover:text-white transition-all duration-300"
      >
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  const { notifications, unreadCount, markAsRead, markAllAsRead } = notificationContext

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "application":
        return "bg-vibrant-blue"
      case "message":
        return "bg-vibrant-green"
      case "interview":
        return "bg-vibrant-orange"
      case "achievement":
        return "bg-vibrant-purple"
      default:
        return "bg-vibrant-pink"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gradient-to-r hover:from-vibrant-blue hover:to-vibrant-purple hover:text-white transition-all duration-300"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-vibrant-pink to-vibrant-purple text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple text-white rounded-t-lg">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-white hover:text-white hover:bg-white/20"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4 focus:bg-accent hover:bg-gradient-to-r hover:from-background hover:to-muted transition-all duration-300"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className="font-medium">{notification.title}</span>
                  <time className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                {notification.link && (
                  <Link
                    href={notification.link}
                    className="mt-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    View details
                  </Link>
                )}
                {!notification.read && (
                  <div
                    className={`absolute right-4 top-4 h-2 w-2 rounded-full ${getNotificationColor(notification.type)}`}
                  />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
