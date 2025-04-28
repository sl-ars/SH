"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Lock, Globe, User, Briefcase, Eye, EyeOff } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "sonner"
import { settingsApi, UserSettings } from "@/lib/api/settings"
import { z } from "zod"

// Custom hook for settings management
const useSettings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    two_factor_auth: false,
    dark_mode: false,
    language: "en"
  })
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setSettingsError(null)
      const userSettingsRes = await settingsApi.getUserSettings()
      
      if (userSettingsRes.status === "success" && userSettingsRes.data) {
        setUserSettings(userSettingsRes.data)
      }
    } catch (error) {
      if (error instanceof Error) {
        setSettingsError(error.message)
      } else {
        setSettingsError("Failed to fetch settings")
      }
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setLoading(true)
      setSettingsError(null)
      setSuccessMessage(null)
      const response = await settingsApi.updateUserSettings(newSettings)
      if (response.status === "success") {
        setUserSettings(prev => ({ ...prev, ...newSettings }))
        setSuccessMessage(response.message || "Settings updated successfully")
      }
    } catch (error) {
      if (error instanceof Error) {
        setSettingsError(error.message)
      } else {
        setSettingsError("Failed to update settings")
      }
      console.error("Error updating user settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      setLoading(true)
      setPasswordError(null)
      setSuccessMessage(null)
      const response = await settingsApi.changePassword(passwordData)
      if (response.status === "success") {
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: ""
        })
        setSuccessMessage(response.message || "Password updated successfully")
      }
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message)
      } else {
        setPasswordError("Failed to update password")
      }
      console.error("Error changing password:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return {
    userSettings,
    passwordData,
    setPasswordData,
    passwordError,
    settingsError,
    successMessage,
    loading,
    showPasswords,
    togglePasswordVisibility,
    fetchSettings,
    updateUserSettings,
    handlePasswordChange
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("notifications")
  const {
    userSettings,
    passwordData,
    setPasswordData,
    passwordError,
    settingsError,
    successMessage,
    loading,
    showPasswords,
    togglePasswordVisibility,
    fetchSettings,
    updateUserSettings,
    handlePasswordChange
  } = useSettings()

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
          Settings
        </h1>
        {settingsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {settingsError}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            {successMessage}
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 rounded-xl bg-muted p-1 dark:bg-muted/50">
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background dark:data-[state=active]:bg-background/80">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-background dark:data-[state=active]:bg-background/80">
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-background dark:data-[state=active]:bg-background/80">
              Preferences
            </TabsTrigger>
          </TabsList>
          <TabsContent value="notifications">
            <Card className="border-none shadow-lg overflow-hidden dark:bg-card/50">
              <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-yellow w-full dark:from-emerald-500 dark:to-amber-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-green dark:text-emerald-400">
                  <Bell className="w-5 h-5 mr-2" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-foreground">Email Notifications</Label>
                  <Switch 
                    id="email-notifications" 
                    checked={userSettings.email_notifications}
                    onCheckedChange={(checked) => updateUserSettings({ email_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="text-foreground">Push Notifications</Label>
                  <Switch 
                    id="push-notifications" 
                    checked={userSettings.push_notifications}
                    onCheckedChange={(checked) => updateUserSettings({ push_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications" className="text-foreground">SMS Notifications</Label>
                  <Switch 
                    id="sms-notifications" 
                    checked={userSettings.sms_notifications}
                    onCheckedChange={(checked) => updateUserSettings({ sms_notifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card className="border-none shadow-lg overflow-hidden dark:bg-card/50">
              <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full dark:from-orange-500 dark:to-pink-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-orange dark:text-orange-400">
                  <Lock className="w-5 h-5 mr-2" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type={showPasswords.current ? "text" : "password"} 
                    className="mt-1 pr-10 dark:bg-background/50" 
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                  <Input 
                    id="new-password" 
                    type={showPasswords.new ? "text" : "password"} 
                    className="mt-1 pr-10 dark:bg-background/50" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type={showPasswords.confirm ? "text" : "password"} 
                    className="mt-1 pr-10 dark:bg-background/50" 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <div className="text-red-500 text-sm mt-2 dark:text-red-400">
                    {passwordError}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor" className="text-foreground">Enable Two-Factor Authentication</Label>
                  <Switch 
                    id="two-factor" 
                    checked={userSettings.two_factor_auth}
                    onCheckedChange={(checked) => updateUserSettings({ two_factor_auth: checked })}
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-vibrant-orange to-vibrant-pink hover:from-vibrant-pink hover:to-vibrant-orange transition-all duration-300 dark:from-orange-500 dark:to-pink-500 dark:hover:from-pink-500 dark:hover:to-orange-500"
                  onClick={handlePasswordChange}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences">
            <Card className="border-none shadow-lg overflow-hidden dark:bg-card/50">
              <div className="h-2 bg-gradient-to-r from-vibrant-yellow to-vibrant-green w-full dark:from-amber-500 dark:to-emerald-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-yellow dark:text-amber-400">
                  <Globe className="w-5 h-5 mr-2" /> User Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="text-foreground">Dark Mode</Label>
                  <Switch 
                    id="dark-mode" 
                    checked={userSettings.dark_mode}
                    onCheckedChange={(checked) => updateUserSettings({ dark_mode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="language" className="text-foreground">Language</Label>
                  <select
                    id="language"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-vibrant-blue focus:border-vibrant-blue sm:text-sm rounded-md dark:bg-background/50 dark:border-gray-600 dark:text-foreground"
                    value={userSettings.language}
                    onChange={(e) => updateUserSettings({ language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
} 