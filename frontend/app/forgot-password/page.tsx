"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { KeyRound, Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    try {
      setIsLoading(true)
      // In a real application, you would call your API here
      // await resetPassword(email)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to send reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md w-full border-none shadow-lg overflow-hidden dark:bg-gray-800">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-50 dark:bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mb-4">
            <KeyRound className="h-10 w-10 text-blue-500" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
            {!isSubmitted
              ? "Enter your email and we'll send you a link to reset your password"
              : "Check your inbox for the reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                If you don't see it, please check your spam folder
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
          <Button variant="link" asChild className="text-blue-600 hover:text-blue-800">
            <Link href="/login" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
