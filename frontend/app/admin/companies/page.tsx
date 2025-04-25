"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminCompanies } from "@/lib/mock-data/admin"
import { Plus, Edit, Trash2, ExternalLink, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CompanyType {
  id: string
  name: string
  industry: string
  location: string
  verified: boolean
}

export default function AdminCompaniesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCompanies, setTotalCompanies] = useState(0)

  const fetchCompanies = async (page = currentPage) => {
    try {
      setLoading(true)
      let data
      if (isMockEnabled()) {
        // Use mock data
        data = { 
          data: mockAdminCompanies, 
          status: "success", 
          message: "Companies retrieved successfully",
          total: mockAdminCompanies.length,
          page: page,
          limit: pageSize
        }
      } else {
        // Use real API with pagination
        data = await adminApi.getCompanies({
          page: page,
          limit: pageSize,
          search: searchTerm
        })
      }
      setCompanies(data.data)
      setTotalCompanies(data.total || data.data.length)
      setCurrentPage(page)
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error("Error fetching companies:", err)
      setError("Failed to load companies. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies(1) // Reset to first page when component mounts
  }, [router])

  // Recalculate pagination when search changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchCompanies(1) // Reset to first page on search
    }, 500)
    
    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    const totalPages = Math.ceil(totalCompanies / pageSize)
    if (newPage > totalPages) return
    fetchCompanies(newPage)
  }

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return
    
    try {
      if (isMockEnabled()) {
        // Mock deletion
        setCompanies(companies.filter((company) => company.id !== companyToDelete))
      } else {
        // Real API deletion
        await adminApi.deleteCompany(companyToDelete)
        setCompanies(companies.filter((company) => company.id !== companyToDelete))
      }
      
      toast({
        title: "Success",
        description: "Company deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting company:", err)
      setError("Failed to delete company. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
    }
  }

  const handleVerifyCompany = async (id: string, currentStatus: boolean) => {
    try {
      if (isMockEnabled()) {
        // Mock update
        setCompanies(
          companies.map((company) => (company.id === id ? { ...company, verified: !currentStatus } : company)),
        )
        return
      }

      // Real API update
      await adminApi.updateCompany(id, { verified: !currentStatus })
      setCompanies(companies.map((company) => (company.id === id ? { ...company, verified: !currentStatus } : company)))
    } catch (err) {
      console.error("Error updating company verification status:", err)
      setError("Failed to update verification status. Please try again later.")
    }
  }

  const handleEditCompany = (id: string) => {
    router.push(`/admin/companies/edit/${id}`)
  }

  const handleViewCompany = (id: string) => {
    router.push(`/companies/${id}`)
  }

  const handleRefresh = () => {
    fetchCompanies(currentPage)
    toast({
      title: "Refreshed",
      description: "Company list has been refreshed",
    })
  }

  const filteredCompanies = companies;

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Manage all companies registered on the platform</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={() => router.push("/admin/companies/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Company
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search companies by name, industry, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-32 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.location}</TableCell>
                      <TableCell>
                        {company.verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewCompany(company.id)}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCompany(company.id)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant={company.verified ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleVerifyCompany(company.id, company.verified)}
                          >
                            {company.verified ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(company.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No companies found. {searchTerm && "Try adjusting your search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination controls */}
          {!loading && filteredCompanies.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {companies.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCompanies)} of {totalCompanies} companies
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
                  Page {currentPage} of {Math.max(1, Math.ceil(totalCompanies / pageSize))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCompanies / pageSize)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        description="Are you sure you want to delete this company? This will also delete all associated jobs. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
