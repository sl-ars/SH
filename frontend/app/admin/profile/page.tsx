"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { UserProfile } from "@/lib/types"
import { USER_ROLES } from "@/lib/constants/roles"
import { userApi } from "@/lib/api/user"
import { calculateProfileCompletion } from "@/lib/utils/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Settings, Users, Activity, BarChart3 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function AdminProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await userApi.getMyProfile()
        setProfileData(response.data)
        const { percentage, missingFields } = calculateProfileCompletion(response.data)
        setProfileCompletion(percentage)
        setMissingFields(missingFields)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [toast, router])

  const handleProfileUpdate = useCallback(
    async (data: Partial<UserProfile>) => {
      try {
        setSaving(true)
        await userApi.updateProfile(data)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } catch (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    },
    [toast]
  )

  if (!user) return null

  return (
    <ProtectedRoute roles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Admin Profile
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Overview */}
              <div className="md:col-span-1 space-y-6">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple"></div>
                  <CardContent className="-mt-16 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                        <Shield className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <h2 className="mt-4 text-2xl font-bold">{profileData?.name}</h2>
                      <p className="text-muted-foreground">Administrator</p>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {profileData?.email}
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Profile Completion</h3>
                      <Progress value={profileCompletion} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">{profileCompletion.toFixed(0)}% Complete</p>

                      {missingFields.length > 0 && (
                        <Alert className="mt-4 bg-amber-50">
                          <AlertDescription>
                            <p className="text-sm font-medium text-amber-800">Complete your profile by adding:</p>
                            <ul className="text-xs text-amber-700 mt-1 list-disc list-inside">
                              {missingFields.map((field, index) => (
                                <li key={index}>{field}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Stats */}
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-orange">
                      <Activity className="w-5 h-5 mr-2" />
                      System Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Users</span>
                      <span className="font-semibold">{profileData?.totalUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Campuses</span>
                      <span className="font-semibold">{profileData?.activeCampuses || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Jobs</span>
                      <span className="font-semibold">{profileData?.totalJobs || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Profile Content */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-green">
                      <Settings className="w-5 h-5 mr-2" />
                      Admin Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData?.name || ""}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData?.email || ""}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Admin Description</Label>
                      <Textarea
                        id="description"
                        value={profileData?.description || ""}
                        onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-vibrant-green to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-green transition-all duration-300"
                      onClick={() => profileData && handleProfileUpdate(profileData)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Update Profile"}
                    </Button>
                  </CardContent>
                </Card>

                {/* System Settings */}
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-purple">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="system-name">System Name</Label>
                      <Input
                        id="system-name"
                        value={profileData?.systemName || ""}
                        onChange={(e) => setProfileData({ ...profileData, systemName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="system-description">System Description</Label>
                      <Textarea
                        id="system-description"
                        value={profileData?.systemDescription || ""}
                        onChange={(e) => setProfileData({ ...profileData, systemDescription: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-vibrant-purple to-vibrant-blue hover:from-vibrant-blue hover:to-vibrant-purple transition-all duration-300"
                      onClick={() => profileData && handleProfileUpdate(profileData)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Update System Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 