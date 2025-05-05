"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Lock } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { isMockEnabled } from "@/lib/utils/config"

interface EmployerSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<EmployerSettings>({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchSettings = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch settings from an API
        const response = await employerApi.getSettings()

        setSettings({
          emailNotifications: response.emailNotifications || true,
          pushNotifications: response.pushNotifications || false,
          smsNotifications: response.smsNotifications || false,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } catch (error) {
        console.error("Error fetching settings:", error)

        // If API call fails or mock is enabled, use default values
        if (isMockEnabled()) {
          setSettings({
            emailNotifications: true,
            pushNotifications: false,
            smsNotifications: false,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user, router])

  const handleChange = (field: keyof EmployerSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await employerApi.updateSettings({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsNotifications: settings.smsNotifications,
      })

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)

      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await employerApi.changePassword({
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword,
      })

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })

      // Reset password fields
      setSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      console.error("Error changing password:", error)

      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute roles="employer">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          <div className="text-center py-8">Loading settings...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute roles="employer">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" /> Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-applications">New Applications</Label>
                <Switch
                  id="new-applications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="interview-reminders">Interview Reminders</Label>
                <Switch
                  id="interview-reminders"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                />
              </div>
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? "Saving..." : "Save Email Preferences"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" /> Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleChange("pushNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Switch
                  id="sms-notifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleChange("smsNotifications", checked)}
                />
              </div>
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={settings.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Changing Password..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
