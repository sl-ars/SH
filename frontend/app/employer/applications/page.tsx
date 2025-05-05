"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, User, Calendar, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { toast } from "sonner"
import type { Application } from "@/lib/types"

export default function EmployerApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await employerApi.getApplications()
      setApplications(response || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await employerApi.updateApplicationStatus(applicationId, newStatus)
      fetchApplications()
      toast.success("Application status updated successfully")
    } catch (error) {
      console.error("Error updating application status:", error)
      toast.error("Failed to update application status")
    }
  }

  return (
    <ProtectedRoute roles="employer">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Manage Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-4">No applications found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {application.applicant?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          {application.job_title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{application.status}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/employer/applications/${application.id}`)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(application.id, "interviewed")}
                            >
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleStatusChange(application.id, "rejected")}
                            >
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
