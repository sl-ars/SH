"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Bell, Shield, Mail } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/components/ui/use-toast"

interface CampusSettings {
  campusName: string
  adminEmail: string
  maintenanceMode: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  eventReminders: boolean
  twoFactorAuth: boolean
  passwordExpiry: boolean
  smtpServer: string
  smtpPort: string
  smtpUsername: string
}

export default function CampusSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<CampusSettings>({
    campusName: "",
    adminEmail: "",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    twoFactorAuth: false,
    passwordExpiry: true,
    smtpServer: "",
    smtpPort: "",
    smtpUsername: "",
  })

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchSettings = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch settings from an API
        // For now, we'll simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // This would be replaced with actual API call
        // const response = await campusApi.getSettings()
        // setSettings(response)

        // For now, we'll use placeholder data
        setSettings({
          campusName: "University of Technology",
          adminEmail: "admin@universityoftech.edu",
          maintenanceMode: false,
          emailNotifications: true,
          smsNotifications: false,
          eventReminders: true,
          twoFactorAuth: false,
          passwordExpiry: true,
          smtpServer: "smtp.example.com",
          smtpPort: "587",
          smtpUsername: "noreply@universityoftech.edu",
        })
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user, router])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      // In a real app, you would save settings to an API
      // await campusApi.updateSettings(settings)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof CampusSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <ProtectedRoute roles="campus">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Campus Portal Settings</h1>
            <div className="text-center py-8">Loading settings...</div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Campus Portal Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-blue">
                  <Settings className="w-6 h-6 mr-2" /> General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campus-name">Campus Name</Label>
                  <Input
                    id="campus-name"
                    value={settings.campusName}
                    onChange={(e) => handleChange("campusName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleChange("adminEmail", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch
                    id="maintenance-mode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-green">
                  <Bell className="w-6 h-6 mr-2" /> Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    defaultChecked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="event-reminders">Event Reminders</Label>
                  <Switch
                    id="event-reminders"
                    defaultChecked={settings.eventReminders}
                    onCheckedChange={(checked) => handleChange("eventReminders", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-orange">
                  <Shield className="w-6 h-6 mr-2" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
                  <Switch
                    id="two-factor-auth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleChange("twoFactorAuth", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-expiry">Password Expiry (90 days)</Label>
                  <Switch
                    id="password-expiry"
                    defaultChecked={settings.passwordExpiry}
                    onCheckedChange={(checked) => handleChange("passwordExpiry", checked)}
                  />
                </div>
                <Button
                  className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white transition-colors duration-300"
                  onClick={handleSaveSettings}
                >
                  Update Security Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-vibrant-purple">
                  <Mail className="w-6 h-6 mr-2" /> Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input
                    id="smtp-server"
                    value={settings.smtpServer}
                    onChange={(e) => handleChange("smtpServer", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    value={settings.smtpPort}
                    onChange={(e) => handleChange("smtpPort", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input
                    id="smtp-username"
                    type="email"
                    value={settings.smtpUsername}
                    onChange={(e) => handleChange("smtpUsername", e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-vibrant-purple hover:bg-vibrant-purple/90 text-white transition-colors duration-300"
                  onClick={handleSaveSettings}
                >
                  Test Email Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save All Settings"}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
