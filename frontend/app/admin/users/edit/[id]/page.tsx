"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminUsers, mockAdminCompanies } from "@/lib/mock-data/admin"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Интерфейс для компании
interface AdminCompany {
  id: string;
  name: string;
  industry: string;
}

export default function EditUserPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    is_active: true,
    company: "",
    company_id: "",
    university: ""
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        let data
        if (isMockEnabled()) {
          // Use mock data
          const mockUser = mockAdminUsers.find((u) => u.id === id)
          if (!mockUser) throw new Error("User not found")
          data = { data: mockUser, status: "success" }
        } else {
          // Use real API
          data = await adminApi.getUser(id as string)
        }
        console.log("Fetched user data:", data.data)
        
        setUser(data.data)
        
        // Если пользователь работодатель, загрузим список компаний
        if (data.data.role === "employer") {
          fetchCompanies();
        }
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

  // Загрузка списка компаний
  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      let companiesData;
      
      if (isMockEnabled()) {
        // Use mock data
        companiesData = {
          data: mockAdminCompanies,
          status: "success"
        };
      } else {
        // Fetch real companies from API
        companiesData = await adminApi.getCompanies({
          limit: 100 // Get up to 100 companies
        });
      }
      
      if (companiesData.status === "success" && Array.isArray(companiesData.data)) {
        setCompanies(companiesData.data.map((company: any) => ({
          id: company.id,
          name: company.name,
          industry: company.industry
        })));
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to load companies.",
        variant: "destructive",
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setUser((prev) => ({ ...prev, [name]: value }))
    
    // Если изменилась роль на employer, загружаем список компаний
    if (name === "role" && value === "employer") {
      fetchCompanies();
    }
  }
  
  const handleActiveChange = (value: string) => {
    setUser((prev) => ({ 
      ...prev, 
      is_active: value === 'active' // Преобразуем строковое значение в boolean
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (isMockEnabled()) {
        // Mock update
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        })
        router.push("/admin/users")
        return
      }
      
      // Create a new object with all the data we want to send
      const dataToUpdate = {
        ...user,
      }
      
      console.log("Sending data to backend:", dataToUpdate)
      
      // For debugging: Display what we're sending to the API
      console.log('DEBUG - Submitting user update with data:', JSON.stringify(dataToUpdate))
      
      // Отправляем обновления на сервер
      const response = await adminApi.updateUser(id as string, dataToUpdate)
      
      console.log('DEBUG - API Response:', JSON.stringify(response))
      
      if (response.status === "success") {
        toast({
          title: "User updated",
          description: "The user has been successfully updated.",
        })
        router.push("/admin/users")
      } else {
        setError(response.message || "Failed to update user. Please try again.")
        toast({
          title: "Error",
          description: response.message || "Failed to update user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating user:", err)
      setError("Failed to update user. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load the user details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4 flex items-center gap-1" onClick={() => router.push("/admin/users")}>
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
          <CardDescription>Update user information</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={user.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={user.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={user.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="campus">Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={user.is_active ? 'active' : 'inactive'} onValueChange={handleActiveChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Поле для выбора компании (только для employer) */}
              {user.role === "employer" && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company">Company</Label>
                  <Select 
                    value={user.company_id} 
                    onValueChange={(value) => {
                      const selectedCompany = companies.find(c => c.id === value);
                      handleSelectChange("company_id", value);
                      handleSelectChange("company", selectedCompany?.name || "");
                      console.log("Selected company:", value, selectedCompany?.name);
                    }}
                    disabled={loadingCompanies}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select a company"} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.industry})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {user.company && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current company: {user.company}
                    </p>
                  )}
                </div>
              )}
              
              {/* Поле для университета (только для student) */}
              {user.role === "student" && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="university">University</Label>
                  <Input 
                    id="university" 
                    name="university" 
                    value={user.university || ""} 
                    onChange={handleChange} 
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-1">
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
