"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, ExternalLink, Loader2, AlertTriangle, XCircle } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { applicationsApi } from "@/lib/api/applications"
import { useToast } from "@/components/ui/use-toast"

export default function ApplicationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5 // Number of applications per page

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await applicationsApi.getApplications()
        setApplications(response.data?.results || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to fetch applications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading && user) {
      fetchApplications()
    }
  }, [user, isLoading, router, toast])

  const handleCancelApplication = async (applicationId: string) => {
    setCanceling(applicationId)
    try {
      const response = await applicationsApi.cancelApplication(applicationId)

      if (response.status === "success" && response.data) {
      // Update local state to mark as cancelled
        setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: "canceled" } : app)))
      } else {
        console.error("Failed to cancel application (API reported error):", response.message)
      }
    } catch (error) {
      console.error("Error in handleCancelApplication:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCanceling(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewing":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-300 text-gray-700" // Visual cue for cancelled applications
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Pagination
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedApplications = applications.slice(startIndex, endIndex)
  const totalPages = Math.ceil(applications.length / pageSize)

  return (
    <ProtectedRoute roles="student">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Applications</h1>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
                </div>
              ) : applications.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApplications.map((application) => (
                        <TableRow
                          key={application.id}
                          className={application.status === "cancelled" ? "opacity-50" : ""} // Visual cue for cancelled applications
                        >
                          <TableCell className="font-medium">{application.job_title || "Position"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              {application.job_company || "Company"}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/jobs/${application.job}`}>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                              {(application.status === "pending" || application.status === "reviewing") && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={canceling === application.id}
                                  onClick={() => handleCancelApplication(application.id)}
                                >
                                  {canceling === application.id ? (
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center p-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="mr-2"
                      >
                        Previous
                      </Button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="ml-2"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col justify-center items-center h-64">
                  <AlertTriangle className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                  <Link href="/jobs">
                    <Button className="mt-4">Browse Jobs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
