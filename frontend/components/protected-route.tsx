"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { UserRole } from "@/lib/types"

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole | UserRole[]
}) {
  const { isAuthenticated, hasRole, user } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("access_token")

    if (!token) {
      router.push("/login")
      return
    }

    // If we have a token but user is not authenticated yet (still loading),
    // we'll wait for the auth context to finish loading
    if (!isAuthenticated) {
      const checkInterval = setInterval(() => {
        if (isAuthenticated || !localStorage.getItem("access_token")) {
          clearInterval(checkInterval)
          setIsChecking(false)
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }

    setIsChecking(false)

    // Check role permissions if roles are specified
    if (roles && !hasRole(roles)) {
      router.push("/unauthorized")
    }
  }, [isAuthenticated, hasRole, roles, router])

  // Don't show a loading state for too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isChecking) {
        setIsChecking(false)
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [isChecking])

  if (isChecking) {
    return null // Or a loading spinner
  }

  // If user is authenticated and either no roles are required or user has the required role(s)
  if (isAuthenticated && (!roles || hasRole(roles))) {
    return <>{children}</>
  }

  return null
}
