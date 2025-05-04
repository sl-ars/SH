"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminSettings } from "@/lib/mock-data/admin"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Определяем тип AdminSettings локально
interface AdminSettings {
  siteName: string
  supportEmail: string
  maintenanceMode: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  twoFactorAuth: boolean
  passwordExpiry: boolean
  smtpServer: string
  smtpPort: string
  smtpUsername?: string
  smtpPassword?: string
  smtpSecure?: boolean
  [key: string]: any
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        if (isMockEnabled()) {
          // Use mock data
          setSettings(mockAdminSettings)
          setLoading(false)
          return
        }

        // Use real API
        console.log("Fetching settings from API...")
        const response = await adminApi.getSettings()
        console.log("Settings API response:", response)
        
        if (response && response.data) {
          console.log("Settings data:", response.data)
          setSettings(response.data)
        } else {
          console.error("Unexpected response structure:", response)
          setError("Received invalid settings data from server")
        }
        setLoading(false)
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError("Failed to load settings. Please try again later.")
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (isMockEnabled()) {
        // Mock saving
        setTimeout(() => {
          setSaving(false)
          setSuccess("Settings saved successfully!")
        }, 1000)
        return
      }

      // Real API saving
      await adminApi.updateSettings(settings)
      setSaving(false)
      setSuccess("Settings saved successfully!")
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings. Please try again later.")
      setSaving(false)
    }
  }

  const handleChange = (field: keyof AdminSettings, value: any) => {
    if (!settings) return

    setSettings({
      ...settings,
      [field]: value,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Loading settings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>No settings available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No settings data is currently available. Please check back later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure global settings for the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange("supportEmail", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <div className="text-sm text-gray-500">
                      When enabled, the site will display a maintenance message to all users.
                    </div>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <div className="text-sm text-gray-500">Send email notifications to users for important events.</div>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <div className="text-sm text-gray-500">Send push notifications to users for important events.</div>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleChange("pushNotifications", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <div className="text-sm text-gray-500">Require two-factor authentication for all admin users.</div>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleChange("twoFactorAuth", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordExpiry">Password Expiry</Label>
                    <div className="text-sm text-gray-500">Require users to change their password periodically.</div>
                  </div>
                  <Switch
                    id="passwordExpiry"
                    checked={settings.passwordExpiry}
                    onCheckedChange={(checked) => handleChange("passwordExpiry", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={settings.smtpServer}
                    onChange={(e) => handleChange("smtpServer", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => handleChange("smtpPort", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Test Email Configuration
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
