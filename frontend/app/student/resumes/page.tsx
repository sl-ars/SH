// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Switch } from "@/components/ui/switch"
// import { useToast } from "@/components/ui/use-toast"
// import { ResumeUpload } from "@/components/resume-upload"
// import { getUserResumes, deleteResume, setDefaultResume, renameResume } from "@/app/actions/resume-actions"
// import ProtectedRoute from "@/components/protected-route"
// import { ResumeCard } from "@/components/resume-card"
// import { ResumeAnalysis } from "@/components/resume-analysis"
// import { ResumeJobMatch } from "@/components/resume-job-match"
// import { Loader2, Plus, Upload, FileText, BarChart2, CheckCircle2 } from "lucide-react"
// import type { Resume } from "@/lib/types"
// import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// export default function ResumesPage() {
//   const { user } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()
//   const [resumes, setResumes] = useState<Resume[]>([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState("all-resumes")
//   const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
//   const [isUploading, setIsUploading] = useState(false)
//   const [showUploadForm, setShowUploadForm] = useState(false)
//   const [newResumeName, setNewResumeName] = useState("")
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
//   const [resumeToDelete, setResumeToDelete] = useState<string | null>(null)

//   useEffect(() => {
//     if (!user) router.push("/login")

//     const fetchResumes = async () => {
//       try {
//         setLoading(true)
//         const result = await getUserResumes()
//         if (result.success) {
//           setResumes(result.data || [])
//           // If there are resumes and none is selected, select the first one
//           if (result.data.length > 0 && !selectedResume) {
//             setSelectedResume(result.data[0])
//           }
//         } else {
//           toast({
//             title: "Error",
//             description: result.message || "Failed to fetch resumes",
//             variant: "destructive",
//           })
//         }
//       } catch (error) {
//         console.error("Error fetching resumes:", error)
//         toast({
//           title: "Error",
//           description: "An unexpected error occurred while fetching your resumes",
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (user) {
//       fetchResumes()
//     }
//   }, [user, router, toast, selectedResume])

//   const handleResumeUpload = async (url: string) => {
//     if (!url) return

//     setIsUploading(true)
//     try {
//       // Refresh resumes list
//       const result = await getUserResumes()
//       if (result.success) {
//         setResumes(result.data || [])

//         // Find the newly uploaded resume (should be the most recent one)
//         const newResume = result.data[0]
//         if (newResume) {
//           setSelectedResume(newResume)
//           setActiveTab("resume-details")
//         }

//         toast({
//           title: "Success",
//           description: "Resume uploaded successfully",
//         })

//         // Reset the upload form
//         setShowUploadForm(false)
//         setNewResumeName("")
//       }
//     } catch (error) {
//       console.error("Error after resume upload:", error)
//       toast({
//         title: "Error",
//         description: "Failed to refresh resume list after upload",
//         variant: "destructive",
//       })
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const handleDeleteClick = (resumeId: string) => {
//     setResumeToDelete(resumeId)
//     setDeleteDialogOpen(true)
//   }

//   const handleDeleteResume = async () => {
//     if (!resumeToDelete) return
    
//     try {
//       const result = await deleteResume(resumeToDelete)
//       if (result.success) {
//         // Update the local state
//         setResumes(resumes.filter((resume) => resume.id !== resumeToDelete))

//         // If the deleted resume was selected, clear the selection
//         if (selectedResume && selectedResume.id === resumeToDelete) {
//           setSelectedResume(null)
//           setActiveTab("all-resumes")
//         }

//         toast({
//           title: "Success",
//           description: "Resume deleted successfully",
//         })
//       } else {
//         throw new Error(result.message)
//       }
//     } catch (error) {
//       console.error("Error deleting resume:", error)
//       toast({
//         title: "Error",
//         description: "Failed to delete resume",
//         variant: "destructive",
//       })
//     } finally {
//       setDeleteDialogOpen(false)
//       setResumeToDelete(null)
//     }
//   }

//   const handleSetDefaultResume = async (resumeId: string) => {
//     try {
//       const result = await setDefaultResume(resumeId)
//       if (result.success) {
//         // Update the local state to reflect the new default resume
//         setResumes((prevResumes) =>
//           prevResumes.map((resume) => ({
//             ...resume,
//             isDefault: resume.id === resumeId,
//           })),
//         )

//         toast({
//           title: "Success",
//           description: "Default resume updated successfully",
//         })
//       } else {
//         throw new Error(result.message)
//       }
//     } catch (error) {
//       console.error("Error setting default resume:", error)
//       toast({
//         title: "Error",
//         description: "Failed to set default resume",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleRenameResume = async (resumeId: string, newName: string) => {
//     try {
//       const result = await renameResume(resumeId, newName)
//       if (result.success) {
//         // Update the local state
//         setResumes((prevResumes) =>
//           prevResumes.map((resume) => (resume.id === resumeId ? { ...resume, name: newName } : resume)),
//         )

//         // Update selected resume if it's the one being renamed
//         if (selectedResume && selectedResume.id === resumeId) {
//           setSelectedResume({ ...selectedResume, name: newName })
//         }

//         toast({
//           title: "Success",
//           description: "Resume renamed successfully",
//         })
//       } else {
//         throw new Error(result.message)
//       }
//     } catch (error) {
//       console.error("Error renaming resume:", error)
//       toast({
//         title: "Error",
//         description: "Failed to rename resume",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleSelectResume = (resume: Resume) => {
//     setSelectedResume(resume)
//     setActiveTab("resume-details")
//   }

//   if (!user) return null

//   return (
//     <ProtectedRoute roles="student">
//       <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
//         <div className="container mx-auto px-4 py-12">
//           <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
//             Resume Management
//           </h1>

//           <div className="grid gap-6 md:grid-cols-12">
//             {/* Sidebar */}
//             <div className="md:col-span-3 space-y-6">
//               <Card className="border-none shadow-lg overflow-hidden">
//                 <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-vibrant-blue">
//                     <FileText className="w-5 h-5 mr-2" />
//                     Resume Hub
//                   </CardTitle>
//                   <CardDescription>Manage all your resumes in one place</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <Button
//                     className="w-full"
//                     onClick={() => {
//                       setShowUploadForm(true)
//                       setActiveTab("all-resumes")
//                     }}
//                   >
//                     <Upload className="w-4 h-4 mr-2" />
//                     Upload New Resume
//                   </Button>

//                   <Separator />

//                   <div className="space-y-2">
//                     <Button
//                       variant={activeTab === "all-resumes" ? "secondary" : "ghost"}
//                       className="w-full justify-start"
//                       onClick={() => setActiveTab("all-resumes")}
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       All Resumes
//                       <Badge className="ml-auto">{resumes.length}</Badge>
//                     </Button>

//                     <Button
//                       variant={activeTab === "resume-analysis" ? "secondary" : "ghost"}
//                       className="w-full justify-start"
//                       onClick={() => {
//                         if (selectedResume) {
//                           setActiveTab("resume-analysis")
//                         } else {
//                           toast({
//                             title: "No Resume Selected",
//                             description: "Please select a resume to analyze",
//                             variant: "destructive",
//                           })
//                         }
//                       }}
//                     >
//                       <BarChart2 className="w-4 h-4 mr-2" />
//                       Resume Analysis
//                     </Button>

//                     <Button
//                       variant={activeTab === "job-match" ? "secondary" : "ghost"}
//                       className="w-full justify-start"
//                       onClick={() => {
//                         if (selectedResume) {
//                           setActiveTab("job-match")
//                         } else {
//                           toast({
//                             title: "No Resume Selected",
//                             description: "Please select a resume to match with jobs",
//                             variant: "destructive",
//                           })
//                         }
//                       }}
//                     >
//                       <CheckCircle2 className="w-4 h-4 mr-2" />
//                       Job Match
//                     </Button>
//                   </div>

//                   {selectedResume && (
//                     <>
//                       <Separator />
//                       <div className="p-3 bg-muted rounded-md">
//                         <h3 className="text-sm font-medium mb-2">Selected Resume</h3>
//                         <p className="text-sm truncate">{selectedResume.name}</p>
//                         {selectedResume.isDefault && (
//                           <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
//                             Default Resume
//                           </Badge>
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Resume Stats Card */}
//               <Card className="border-none shadow-lg overflow-hidden">
//                 <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-vibrant-orange">
//                     <BarChart2 className="w-5 h-5 mr-2" />
//                     Resume Stats
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-sm text-muted-foreground">Total Resumes</p>
//                       <p className="text-2xl font-bold">{resumes.length}</p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-muted-foreground">Applications Sent</p>
//                       <p className="text-2xl font-bold">
//                         {resumes.reduce((total, resume) => total + (resume.applicationCount || 0), 0)}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-muted-foreground">Last Updated</p>
//                       <p className="text-md">
//                         {resumes.length > 0
//                           ? new Date(
//                               Math.max(...resumes.map((r) => new Date(r.updatedAt || r.createdAt).getTime())),
//                             ).toLocaleDateString()
//                           : "No resumes yet"}
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Main Content */}
//             <div className="md:col-span-9 space-y-6">
//               <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                 <TabsList className="grid grid-cols-3 mb-4">
//                   <TabsTrigger value="all-resumes">All Resumes</TabsTrigger>
//                   <TabsTrigger value="resume-details" disabled={!selectedResume}>
//                     Resume Details
//                   </TabsTrigger>
//                   <TabsTrigger value="resume-analysis" disabled={!selectedResume}>
//                     Analysis
//                   </TabsTrigger>
//                 </TabsList>

//                 {/* All Resumes Tab */}
//                 <TabsContent value="all-resumes" className="space-y-6">
//                   {showUploadForm && (
//                     <Card className="border-none shadow-lg overflow-hidden mb-6">
//                       <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
//                       <CardHeader>
//                         <CardTitle className="flex items-center text-vibrant-green">
//                           <Upload className="w-5 h-5 mr-2" />
//                           Upload New Resume
//                         </CardTitle>
//                         <CardDescription>Add a new resume to your collection</CardDescription>
//                       </CardHeader>
//                       <CardContent className="space-y-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="resume-name">Resume Name</Label>
//                           <Input
//                             id="resume-name"
//                             placeholder="e.g., Software Engineer Resume, Frontend Developer CV"
//                             value={newResumeName}
//                             onChange={(e) => setNewResumeName(e.target.value)}
//                           />
//                         </div>

//                         <ResumeUpload
//                           onUploadComplete={handleResumeUpload}
//                           isUploading={isUploading}
//                           resumeName={newResumeName}
//                         />

//                         <div className="flex items-center space-x-2 mt-4">
//                           <Switch id="set-default" />
//                           <Label htmlFor="set-default">Set as default resume</Label>
//                         </div>

//                         <div className="flex justify-end space-x-2 mt-4">
//                           <Button variant="outline" onClick={() => setShowUploadForm(false)}>
//                             Cancel
//                           </Button>
//                           <Button disabled={isUploading}>
//                             {isUploading ? (
//                               <>
//                                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                 Uploading...
//                               </>
//                             ) : (
//                               <>
//                                 <Plus className="w-4 h-4 mr-2" />
//                                 Upload Resume
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {loading ? (
//                     <div className="flex justify-center items-center h-64">
//                       <Loader2 className="w-8 h-8 animate-spin text-vibrant-blue" />
//                     </div>
//                   ) : resumes.length > 0 ? (
//                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                       {resumes.map((resume) => (
//                         <ResumeCard
//                           key={resume.id}
//                           resume={resume}
//                           onSelect={() => handleSelectResume(resume)}
//                           onDelete={() => handleDeleteClick(resume.id)}
//                           onSetDefault={() => handleSetDefaultResume(resume.id)}
//                           onRename={(newName) => handleRenameResume(resume.id, newName)}
//                         />
//                       ))}
//                     </div>
//                   ) : (
//                     <Card className="border-dashed border-2 border-muted-foreground/20">
//                       <CardContent className="flex flex-col items-center justify-center py-12">
//                         <FileText className="w-12 h-12 text-muted-foreground mb-4" />
//                         <h3 className="text-lg font-medium mb-2">No Resumes Found</h3>
//                         <p className="text-muted-foreground text-center mb-6">
//                           Upload your first resume to get started with your job applications.
//                         </p>
//                         <Button onClick={() => setShowUploadForm(true)}>
//                           <Upload className="w-4 h-4 mr-2" />
//                           Upload Resume
//                         </Button>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </TabsContent>

//                 {/* Resume Details Tab */}
//                 <TabsContent value="resume-details" className="space-y-6">
//                   {selectedResume ? (
//                     <div className="space-y-6">
//                       <Card className="border-none shadow-lg overflow-hidden">
//                         <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
//                         <CardHeader>
//                           <div className="flex justify-between items-center">
//                             <CardTitle className="flex items-center text-vibrant-blue">
//                               <FileText className="w-5 h-5 mr-2" />
//                               {selectedResume.name}
//                             </CardTitle>
//                             {selectedResume.isDefault && (
//                               <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Default Resume</Badge>
//                             )}
//                           </div>
//                           <CardDescription>
//                             Uploaded on {new Date(selectedResume.createdAt).toLocaleDateString()}
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-6">
//                           {/* Resume Preview */}
//                           <div className="border rounded-md overflow-hidden h-[500px]">
//                             <iframe
//                               src={selectedResume.url}
//                               className="w-full h-full"
//                               title={`Preview of ${selectedResume.name}`}
//                             />
//                           </div>

//                           {/* Resume Actions */}
//                           <div className="flex flex-wrap gap-3 justify-end">
//                             <Button variant="outline" asChild>
//                               <a href={selectedResume.url} target="_blank" rel="noopener noreferrer">
//                                 Open in New Tab
//                               </a>
//                             </Button>

//                             <Button variant="outline" asChild>
//                               <a href={selectedResume.url} download={selectedResume.name}>
//                                 Download
//                               </a>
//                             </Button>

//                             {!selectedResume.isDefault && (
//                               <Button
//                                 variant="outline"
//                                 className="text-green-600 hover:text-green-700 hover:bg-green-50"
//                                 onClick={() => handleSetDefaultResume(selectedResume.id)}
//                               >
//                                 Set as Default
//                               </Button>
//                             )}

//                             <Button
//                               variant="destructive"
//                               onClick={() => handleDeleteClick(selectedResume.id)}
//                             >
//                               Delete Resume
//                             </Button>
//                           </div>
//                         </CardContent>
//                       </Card>

//                       {/* Resume Analysis Summary */}
//                       <Card className="border-none shadow-lg overflow-hidden">
//                         <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
//                         <CardHeader>
//                           <CardTitle className="flex items-center text-vibrant-orange">
//                             <BarChart2 className="w-5 h-5 mr-2" />
//                             Resume Analysis Summary
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           <ResumeAnalysis resumeId={selectedResume.id} summaryOnly />
//                         </CardContent>
//                       </Card>
//                     </div>
//                   ) : (
//                     <div className="flex justify-center items-center h-64">
//                       <p className="text-muted-foreground">Please select a resume to view details</p>
//                     </div>
//                   )}
//                 </TabsContent>

//                 {/* Resume Analysis Tab */}
//                 <TabsContent value="resume-analysis" className="space-y-6">
//                   {selectedResume ? (
//                     <ResumeAnalysis resumeId={selectedResume.id} />
//                   ) : (
//                     <div className="flex justify-center items-center h-64">
//                       <p className="text-muted-foreground">Please select a resume to analyze</p>
//                     </div>
//                   )}
//                 </TabsContent>

//                 {/* Job Match Tab */}
//                 <TabsContent value="job-match" className="space-y-6">
//                   {selectedResume ? (
//                     <ResumeJobMatch resumeId={selectedResume.id} />
//                   ) : (
//                     <div className="flex justify-center items-center h-64">
//                       <p className="text-muted-foreground">Please select a resume to match with jobs</p>
//                     </div>
//                   )}
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ConfirmDialog
//         open={deleteDialogOpen}
//         onOpenChange={setDeleteDialogOpen}
//         onConfirm={handleDeleteResume}
//         title="Delete Resume"
//         description="Are you sure you want to delete this resume? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="destructive"
//       />
//     </ProtectedRoute>
//   )
// }
