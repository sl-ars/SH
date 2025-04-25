"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, User, Mail, MoreVertical, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "@/components/protected-route"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminUsers } from "@/lib/mock-data/admin"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

interface UserType {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  date_joined: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)

  const fetchUsers = async (page = currentPage) => {
    try {
      setLoading(true)
      let data
      if (isMockEnabled()) {
        // Use mock data
        data = { 
          data: mockAdminUsers, 
          status: "success", 
          message: "Users retrieved successfully",
          total: mockAdminUsers.length,
          page: page,
          limit: pageSize
        }
      } else {
        // Use real API
        data = await adminApi.getUsers({
          page: page,
          limit: pageSize,
          search: searchTerm
        })
      }
      setUsers(data.data)
      setTotalUsers(data.total || data.data.length)
      setCurrentPage(page)
      toast({
        title: "Success",
        description: "Users list refreshed successfully",
      })
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) router.push("/login")
    fetchUsers()
  }, [user, router])

  // Recalculate pagination when search changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsers(1) // Reset to first page on search
    }, 500)
    
    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleRefresh = () => {
    fetchUsers(currentPage)
  }

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      if (isMockEnabled()) {
        // Mock deletion
        setUsers(users.filter((user) => user.id !== userToDelete))
      } else {
        // Real API deletion
        await adminApi.deleteUser(userToDelete)
        setUsers(users.filter((user) => user.id !== userToDelete))
      }
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleEditUser = (id: string) => {
    router.push(`/admin/users/edit/${id}`)
  }

  const handleViewUser = (id: string) => {
    router.push(`/admin/users/${id}`)
  }

  // Helper to get full name - no longer needed but kept for compatibility
  const getFullName = (user: UserType) => {
    return user.name || '';
  };

  const filteredUsers = users.filter(
    (user) => {
      const fullName = getFullName(user).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.role && user.role.toLowerCase().includes(searchLower));
    }
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    const totalPages = Math.ceil(totalUsers / pageSize)
    if (newPage > totalPages) return
    fetchUsers(newPage)
  }

  return (
    <ProtectedRoute roles="admin">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRefresh} className="mr-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => router.push("/admin/register")}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users"
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading users...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {getFullName(user)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewUser(user.id)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user.id)}>Edit User</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(user.id)}>
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination controls */}
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {users.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-medium">
                        Page {currentPage} of {Math.max(1, Math.ceil(totalUsers / pageSize))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
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
      </div>
    </ProtectedRoute>
  )
}
