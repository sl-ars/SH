"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import Header from "@/components/Header"
import { AuthProvider } from "@/contexts/auth-context"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <AuthProvider>
        <Header />
        <div className="flex items-center justify-center flex-grow">
          <Card className="max-w-md w-full border-none shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 w-full"></div>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                Page Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Go Back
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
                  <Link href="/">Home Page</Link>
                </Button>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Looking for something specific? Try these links:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <Link href="/jobs" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Browse Jobs
                  </Link>
                  <Link href="/companies" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Companies
                  </Link>
                  <Link href="/resources" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Resources
                  </Link>
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Login
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthProvider>
    </div>
  )
}
