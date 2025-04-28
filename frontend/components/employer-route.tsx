"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function EmployerRoute({ children }: { children: React.ReactNode }) {
  const { user, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!hasRole("employer")) {
      router.push("/unauthorized")
      return
    }
  }, [user, hasRole, router])

  if (!user || !hasRole("employer")) {
    return null
  }

  return <>{children}</>
}
