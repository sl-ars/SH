"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { logError } from "@/lib/utils/error-handling"
import Header from "@/components/Header"
import { AuthProvider } from "@/contexts/auth-context"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logError(error, "AppError")
  }, [error])

  // Check if reset is a function
  const handleReset = () => {
    if (typeof reset === "function") {
      reset()
    } else {
      // Fallback behavior if reset is not a function
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <AuthProvider>
        <Header />
        <div className="flex items-center justify-center flex-grow">
          <Card className="max-w-md w-full border-none shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 w-full"></div>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthProvider>
    </div>
  )
}
