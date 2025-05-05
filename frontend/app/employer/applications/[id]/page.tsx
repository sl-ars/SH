"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { employerApi } from "@/lib/api"
import type { Application } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"
import { FileText, CalendarDays, Briefcase, UserCircle, Mail, ExternalLink, CheckCircle, XCircle, Clock, Phone, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ApplicationDetailsPage() {
  const params = useParams()
  const applicationId = params.id as string
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewNotes, setInterviewNotes] = useState("")

  useEffect(() => {
    if (applicationId) {
      const fetchApplicationDetails = async () => {
        setLoading(true)
        try {
          const response = await employerApi.getApplication(applicationId)
          if (response.status === "success" && response.data) {
            setApplication(response.data)
          } else {
            toast.error(response.message || "Failed to fetch application details.")
            setApplication(null)
          }
        } catch (error) {
          console.error("Error fetching application details:", error)
          toast.error("An error occurred while fetching application details.")
          setApplication(null)
        } finally {
          setLoading(false)
        }
      }
      fetchApplicationDetails()
    }
  }, [applicationId])

  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    if (!application) return;
    try {
      await employerApi.updateApplicationStatus(application.id, status);
      setApplication(prev => prev ? { ...prev, status } : null);
      toast.success(`Application status updated to ${status}.`);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status.");
    }
  };

  const handleScheduleInterviewSubmit = async () => {
    if (!application || !interviewDate) {
      toast.error("Interview date is required.");
      return;
    }
    try {
      const response = await employerApi.scheduleInterview(application.id, { 
        interview_date: interviewDate, 
        notes: interviewNotes 
      });
      if (response.status === "success" && response.data) {
        setApplication(response.data);
        toast.success("Interview scheduled successfully!");
        setShowScheduleModal(false);
        setInterviewDate("");
        setInterviewNotes("");
      } else {
        toast.error(response.message || "Failed to schedule interview.");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("An error occurred while scheduling the interview.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <p>Loading application details...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <p>Application not found or failed to load.</p>
      </div>
    )
  }

  const jobDetails = typeof application.job === 'object' ? application.job : application.job_details;;
  
  const applicantUser = typeof application.applicant === 'object' ? application.applicant : null;

  const avatarFallbackChar = applicantUser?.name.charAt(0).toUpperCase();

  return (
    <ProtectedRoute roles={["employer"]}>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="border-b">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={applicantUser?.avatar } 
                  alt={applicantUser?.name || "Unnamed Applicant"} 
                />
                <AvatarFallback>{avatarFallbackChar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{applicantUser?.name || "Unnamed Applicant"}</CardTitle>
                <CardDescription className="flex items-center text-gray-600">
                  <Mail className="mr-2 h-4 w-4" /> {applicantUser?.email || "No email provided"}
                </CardDescription>
                {applicantUser?.phone && (
                  <CardDescription className="flex items-center text-gray-600 mt-1">
                    <Phone className="mr-2 h-4 w-4" /> {applicantUser?.phone}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Job Details</h3>
                <p><strong>Position:</strong> {application.job_title || jobDetails?.title}</p>
                <p><strong>Company:</strong> {application.job_company || jobDetails?.company_name}</p>
                {jobDetails?.id && (
                   <Link href={`/jobs/${jobDetails.id}`} passHref>
                     <Button variant="link" className="p-0 h-auto text-primary hover:underline">
                       View Job Posting <ExternalLink className="ml-1 h-4 w-4" />
                     </Button>
                   </Link>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" />Applicant Profile</h3>
                {(applicantUser?.id || (typeof application.applicant === 'string' && application.applicant)) && (
                  <Link href={`/profile/${applicantUser?.id || application.applicant}`} passHref target="_blank">
                    <Button variant="outline" size="sm" className="mt-2">
                      View Public Profile <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Cover Letter</h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{application.cover_letter || "No cover letter provided."}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Resume</h3>
              {application.resume ? (
               
                  <Link href={application.resume.url || ""} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      View Resume <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                
              ) : (
                <p className="text-gray-700">No resume provided.</p>
              )}
            </div>

            {application.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{application.notes}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Application Status</h3>
              <p className="capitalize">Current Status: <strong>{application.status}</strong></p>
              <p className="text-sm text-gray-500 flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Applied on: {new Date(application.created_at).toLocaleDateString()}</p>
              {application.interview_date && (
                <p className="text-sm text-gray-500">Interview Date: {new Date(application.interview_date).toLocaleString()}</p>
              )}
            </div>

            {(application.status === "pending" || application.status === "reviewing") && (
              <div className="flex space-x-4 pt-4 border-t">
                <Button onClick={() => setShowScheduleModal(true)} variant="default">
                  <CalendarDays className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
                <Button onClick={() => handleUpdateStatus("rejected")} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            )}

            {application.status === "interviewed" && (
              <div className="flex space-x-4 pt-4 border-t">
                <Button onClick={() => handleUpdateStatus("accepted")} variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button onClick={() => handleUpdateStatus("rejected")} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Set the date, time, and any notes for the interview.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interviewDate" className="text-right">
                  Date & Time
                </Label>
                <Input 
                  id="interviewDate" 
                  type="datetime-local" 
                  value={interviewDate} 
                  onChange={(e) => setInterviewDate(e.target.value)} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="interviewNotes" className="text-right">
                  Notes
                </Label>
                <Textarea 
                  id="interviewNotes" 
                  value={interviewNotes} 
                  onChange={(e) => setInterviewNotes(e.target.value)} 
                  placeholder="Optional notes for the interview (e.g., virtual meeting link, topics)" 
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleScheduleInterviewSubmit}>Confirm & Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </ProtectedRoute>
  )
} 