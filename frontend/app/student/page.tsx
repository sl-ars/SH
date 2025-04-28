"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the profile page
    router.push("/profile")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#007AFF] dark:text-[#0A84FF]" />
        <p className="mt-4 text-[#8E8E93] dark:text-[#AEAEB2]">Loading your dashboard...</p>
      </div>
    </div>
  )
}
