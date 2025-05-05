"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function EmployerRegisterPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "student", // Default to student for employers
    password: "",
  })
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare the data for the API
      const userData = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        password: formData.password,
        companyId: user?.companyId, // Associate with the employer's company
      }

      // Use the employerApi to create the student
      await employerApi.createStudent(userData)

      toast({
        title: "Student account created successfully",
        description: "The student can now log in using the provided credentials.",
      })

      // Reset form
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        role: "student",
        password: "",
      })
    } catch (error) {
      console.error("Error creating student account:", error)
      toast({
        title: "Error",
        description: "Failed to create student account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute roles="employer">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold">
              <UserPlus className="mr-2 h-6 w-6 text-vibrant-green" />
              Register Student Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    placeholder="First name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    placeholder="Last name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter temporary password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-vibrant-green to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-green transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Register Student Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
