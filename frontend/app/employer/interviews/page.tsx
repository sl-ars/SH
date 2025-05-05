"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, User, Briefcase, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { toast } from "sonner"
import type { Application } from "@/lib/types"
import Link from "next/link"

export default function EmployerInterviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [scheduledApplications, setScheduledApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScheduledApplications = async () => {
    setLoading(true);
    try {
      const apps = await employerApi.getInterviews(); 
      setScheduledApplications(apps);
    } catch (error) {
      console.error("Error fetching scheduled applications (interviews):", error);
      toast.error("Failed to fetch scheduled interviews.");
      setScheduledApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchScheduledApplications();
  }, [user, router]);

  const handleApplicationStatusUpdate = async (applicationId: string, newStatus: "accepted" | "rejected") => {
    try {
      const response = await employerApi.updateApplicationStatus(applicationId, newStatus);
      if (response.status === "success") {
        toast.success(`Application status updated to ${newStatus}.`);
        fetchScheduledApplications();
      } else {
        toast.error(response.message || "Failed to update application status.");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status.");
    }
  };

  return (
    <ProtectedRoute roles={["employer"]}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Interview Schedule</h1>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading interviews...</div>
            ) : scheduledApplications.length === 0 ? (
              <div className="text-center py-4">No interviews currently scheduled.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Interview Date & Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-gray-500" />
                          {typeof app.applicant === 'object' ? app.applicant.name : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
                          {app.job_title || (typeof app.job === 'object' && app.job.title) || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          {app.interview_date 
                            ? new Date(app.interview_date).toLocaleString() 
                            : "Not Set"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/employer/applications/${app.id}`} passHref>
                          <Button variant="outline" size="sm">
                            View Application <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApplicationStatusUpdate(app.id, "accepted")}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" /> Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700" 
                          onClick={() => handleApplicationStatusUpdate(app.id, "rejected")}
                        >
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
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
  );
}
