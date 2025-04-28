"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Notification } from "@/lib/types"
import { useAuth } from "./auth-context"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
}

// Create the context with default values to avoid undefined checks
const defaultContextValue: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  addNotification: () => {},
}

export const NotificationContext = createContext<NotificationContextType>(defaultContextValue)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only initialize notifications if we have a user
    if (user) {
      // In a real app, fetch notifications from API
      // For now, we'll use mock data
      setNotifications([
        {
          id: "1",
          userId: user.id,
          type: "application",
          title: "Application Reviewed",
          message: "Your application for Frontend Developer at TechCorp has been reviewed.",
          read: false,
          createdAt: new Date().toISOString(),
          link: "/student/applications",
        },
        // Add more mock notifications...
      ])
      setIsInitialized(true)
    } else {
      // Reset notifications if user logs out
      setNotifications([])
      setIsInitialized(false)
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
