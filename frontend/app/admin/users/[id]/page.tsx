"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminUsers } from "@/lib/mock-data/admin"
import { ArrowLeft, Edit, Trash2, Mail, Calendar, User, Building, GraduationCap, ExternalLink, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import ProtectedRoute from "@/components/protected-route"

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  company?: string;
  university?: string;
  company_id?: string;
  university_id?: string;
  last_login?: string;
}

export default function UserDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        let userData
        
        if (isMockEnabled()) {
          // Use mock data
          const mockUser = mockAdminUsers.find((u) => u.id === id)
          if (!mockUser) throw new Error("User not found")
          userData = { data: mockUser, status: "success" }
        } else {
          // Use real API
          userData = await adminApi.getUser(id)
        }
        
        setUser(userData.data)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    try {
      if (isMockEnabled()) {
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      } else {
        // Real API
        await adminApi.deleteUser(id)
      }
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      
      router.push("/admin/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleEditUser = () => {
    router.push(`/admin/users/edit/${id}`)
  }

  return (
    <ProtectedRoute roles="admin">
      <div className="container mx-auto py-8">
        <Button variant="ghost" className="mb-4 flex items-center gap-1" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Button>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem loading the user details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
            </CardContent>
          </Card>
        ) : user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main user info card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-1" /> {user.email}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={user.is_active ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Role</h3>
                    <p className="text-lg font-medium capitalize flex items-center">
                      {user.role === "student" ? (
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
                      ) : user.role === "employer" ? (
                        <Building className="w-5 h-5 mr-2 text-green-500" />
                      ) : (
                        <User className="w-5 h-5 mr-2 text-purple-500" />
                      )}
                      {user.role}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Member Since</h3>
                    <p className="text-lg font-medium flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                      {new Date(user.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Additional user details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.last_login && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Last Login</h4>
                        <p>{new Date(user.last_login).toLocaleString()}</p>
                      </div>
                    )}
                    
                    {user.university && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">University</h4>
                        <p>{user.university}</p>
                      </div>
                    )}
                    
                    {user.role === "employer" && user.company && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                        <div className="flex items-center mt-1">
                          <Building className="w-4 h-4 mr-2 text-green-500" />
                          <p className="font-medium">{user.company}</p>
                          {user.company_id && (
                            <div className="flex ml-2 space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => router.push(`/companies/${user.company_id}`)}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => router.push(`/admin/companies/edit/${user.company_id}`)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {user.role === "employer" && !user.company && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                        <p className="text-yellow-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          No company assigned
                        </p>
                      </div>
                    )}
                    
                    {user.role !== "employer" && user.company && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                        <p>{user.company}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={handleEditUser}
                  className="flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </CardFooter>
            </Card>
            
            {/* Activity & Stats card */}
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Activity statistics for this user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.role === "student" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Applications</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Saved Jobs</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Resumes</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                )}
                
                {user.role === "employer" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Posted Jobs</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Active Jobs</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Total Applications</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                )}
                
                {/* For admin and other roles */}
                {(user.role !== "student" && user.role !== "employer") && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Actions Performed</h4>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Last Activity</h4>
                      <p>No recent activity</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Account Status</h4>
                  <div className="mt-2 flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>User Not Found</CardTitle>
              <CardDescription>The requested user could not be found</CardDescription>
            </CardHeader>
            <CardContent>
              <p>The user with ID {id} does not exist or you don't have permission to view it.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/admin/users")}>Return to User List</Button>
            </CardFooter>
          </Card>
        )}
        
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteUser}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  )
} 