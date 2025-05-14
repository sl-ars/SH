"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Book, Video, FileText, Users, Calendar, Download, ArrowLeft, Loader2, Lock, ExternalLink, Tag, Eye, Edit, Trash2, UploadCloud } from "lucide-react"
import Link from "next/link"
import { resourcesApi } from "@/lib/api/resources"
import type { Resource, ResourceFile } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const resourceIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  video: Video,
  mp4: Video,
  webinar: Users,
  ebook: Book,
  epub: Book,
  article: FileText,
  workshop: Users,
  guide: FileText,
  link: ExternalLink,
  default: FileText,
}

export default function ResourceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<ResourceFile | null>(null);
  const [showDeleteResourceModal, setShowDeleteResourceModal] = useState<boolean>(false);

  const fetchResourceDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await resourcesApi.getResource(id as string);
      if (response.status === "success" && response.data) {
        setResource(response.data);
      } else {
        setError(response.message || "Failed to load resource");
        setResource(null);
      }
    } catch (err) {
      console.error("Error fetching resource:", err);
      setError("An error occurred while fetching the resource");
      setResource(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchResourceDetails();
    }
  }, [id, fetchResourceDetails]);

  const handleFileDownload = async (file: ResourceFile) => {
    if (!resource) {
      toast({ title: "Ошибка", description: "Ресурс не загружен.", variant: "destructive" });
      return;
    }
    console.log("[handleFileDownload] Initiating download for file:", file);
    try {
        const response = await resourcesApi.downloadResourceFile(resource.id, file.id);
        console.log("[handleFileDownload] API response:", response);

        if (response.data?.file_url) {
            const downloadUrl = response.data.file_url;

            console.log("[handleFileDownload] Details:", { downloadUrl });

            console.log("[handleFileDownload] Attempting to open in new tab");
            window.open(downloadUrl, '_blank');
            toast({ title: "Открытие файла", description: file.title || "Файл открывается в новой вкладке." });

        } else {
            console.error("[handleFileDownload] Could not get download link (expected response.data.file_url). API Response message:", response.message);
            toast({ title: "Ошибка", description: response.message || "Не удалось получить ссылку для скачивания.", variant: "destructive" });
        }
    } catch (e) {
        console.error("[handleFileDownload] Error during download process:", e);
        toast({ title: "Ошибка", description: "Не удалось начать загрузку.", variant: "destructive" });
    }
  };

  const getFileIcon = (type?: string) => {
    if (!type) return resourceIcons.default;
    const fileType = type.split('/').pop()?.toLowerCase() || 'default';
    return resourceIcons[fileType] || resourceIcons.default;
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!resource) return;
      try {
        const response = await resourcesApi.deleteResourceFile(resource.id, fileId);
        if (response.status === "success" && response.data?.success) {
          toast({ title: "File Deleted", description: "The file has been successfully deleted." });
          fetchResourceDetails();
        } else {
          toast({ title: "Error Deleting File", description: response.message || "Could not delete the file.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "An unexpected error occurred while deleting the file.", variant: "destructive" });
        console.error("Error deleting file:", err);
      }
  };

  const handleDeleteResource = async () => {
    if (!resource) return;
      try {
        const response = await resourcesApi.deleteResource(resource.id);
        if (response.status === "success" && response.data?.success) {
          toast({ title: "Resource Deleted", description: "The resource has been successfully deleted." });
          router.push("/resources");
        } else {
          toast({ title: "Error Deleting Resource", description: response.message || "Could not delete the resource.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "An unexpected error occurred while deleting the resource.", variant: "destructive" });
        console.error("Error deleting resource:", err);
      }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setFileTitle(event.target.files[0].name.split('.').slice(0, -1).join('.') || event.target.files[0].name);
    }
  };

  const handleFileUpload = async () => {
    if (!resource || !selectedFile) {
      toast({ title: "Upload Error", description: "No file selected or resource not loaded.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (fileTitle) {
      formData.append("title", fileTitle);
    }

    setIsUploading(true);
    try {
      const response = await resourcesApi.uploadResourceFile(resource.id, formData);
      if (response.status === "success" && response.data) {
        toast({ title: "File Uploaded", description: `Successfully uploaded ${response.data.title || response.data.file}` });
        fetchResourceDetails();
        setShowUploadForm(false);
        setSelectedFile(null);
        setFileTitle("");
      } else {
        toast({ title: "Upload Failed", description: response.message || "Could not upload the file.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Upload Error", description: "An unexpected error occurred during upload.", variant: "destructive" });
      console.error("Error uploading file:", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (resource && user) {
    console.log("--- Debugging Permissions (Employer Check) START ---");
    console.log("User from useAuth():", JSON.stringify(user, null, 2));
    console.log("Resource object:", JSON.stringify(resource, null, 2));
    console.log("Is Authenticated:", isAuthenticated);
    console.log("Current User ID:", user.id, "(type:", typeof user.id, ")");
    if (resource.created_by) {
      console.log("Resource created_by ID:", resource.created_by.id, "(type:", typeof resource.created_by.id, ")");
      console.log("Comparison (String(user.id) === String(resource.created_by.id)):", String(user.id) === String(resource.created_by.id));
    } else {
      console.log("Resource created_by is missing or undefined");
    }
    console.log("Is Admin role:", user.role === 'admin');
    console.log("--- Debugging Permissions (Employer Check) END ---");
  }

  const canPerformEditActions = isAuthenticated && resource && user && (user.role === 'admin' || String(user.id) === String(resource.created_by?.id));
  console.log("Final canPerformEditActions value (Employer Check):", canPerformEditActions);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
           <Button 
            variant="outline" 
            size="sm" 
            className="mb-4 flex items-center text-muted-foreground hover:text-foreground" 
            onClick={() => router.push("/resources")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Resources
          </Button>
          <Card className="bg-destructive/10 text-destructive-foreground">
            <CardHeader>
              <CardTitle>Error Loading Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "The resource you are looking for could not be found or loaded."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const ResourceIconToRender = getFileIcon(resource.type_display || resource.type);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-muted-foreground hover:text-foreground" 
            onClick={() => router.push("/resources")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
          </Button>
          {canPerformEditActions && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push(`/resources/${resource.id}/edit`)}
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteResourceModal(true)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          )}
        </div>

        <Card className="overflow-hidden bg-card text-card-foreground shadow-lg rounded-lg mb-8">
          <CardHeader className="border-b p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <Badge 
                    variant="secondary" 
                    className="text-sm py-1 px-3 rounded-full flex items-center w-fit"
                >
                  <ResourceIconToRender className="w-4 h-4 mr-2 opacity-80" />
                  {resource.type_display || resource.type}
                </Badge>
              <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                Published: {new Date(resource.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight">{resource.title}</CardTitle>
              {resource.is_demo && (
                  <Badge
                    variant="outline"
                    className="text-xs h-fit border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700"
                  >
                    Demo
                  </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 opacity-70" /> 
                {resource.estimated_time_display || resource.estimated_time || "N/A"}
              </span>
              {resource.author_details && (
                <span className="flex items-center">
                  <span className="hidden sm:inline mx-1">•</span> By <Link href={`/user/${resource.author_details.id}`} className="hover:underline ml-1 text-primary">{resource.author_details.name || "Unknown Author"}</Link>
                </span>
              )}
              {resource.category_display && (
                <span className="flex items-center">
                   <span className="hidden sm:inline mx-1">•</span>
                   <Tag className="w-3 h-3 mr-1.5 opacity-70" />
                   {resource.category_display}
                </span>
              )}
              {resource.is_public && (
                 <span className="flex items-center text-green-600 dark:text-green-400">
                    <span className="hidden sm:inline mx-1">•</span>
                    <Eye className="w-4 h-4 mr-1.5 opacity-70" /> Public
                 </span>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {resource.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{resource.description}</p>
              </div>
            )}
            
            {resource.content && resource.type === 'link' && (
                 <div>
                    <h3 className="text-lg font-medium mb-2">Access Link</h3>
                    <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
                        <Link href={resource.content} target="_blank" rel="noopener noreferrer">
                            Open Link <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                 </div>
            )}

            {resource.content && resource.type !== 'link' && (
                <div>
                    <h3 className="text-lg font-medium mb-2">Content</h3>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                        {resource.content}
                    </div>
                </div>
            )}

            {Array.isArray(resource.tags) && resource.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {resource.type !== 'link' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Attached Files ({resource.files?.length || 0})</h2>
              {canPerformEditActions && (
                <Button variant="outline" size="sm" onClick={() => setShowUploadForm(!showUploadForm)} className="flex items-center">
                  <UploadCloud className="w-4 h-4 mr-2" /> {showUploadForm ? "Cancel Upload" : "Upload File"}
                </Button>
              )}
            </div>

            {showUploadForm && canPerformEditActions && (
              <Card className="bg-card text-card-foreground p-4 mb-6 shadow-md rounded-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Upload New File</CardTitle>
                    <CardDescription>Select a file and provide an optional title.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fileTitle" className="block text-sm font-medium mb-1">File Title (optional)</Label>
                    <Input
                      id="fileTitle"
                      type="text"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      placeholder="e.g., Presentation Slides"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileUpload" className="block text-sm font-medium mb-1">File</Label>
                    <Input
                      id="fileUpload"
                      type="file"
                      onChange={handleFileSelected}
                      
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleFileUpload} disabled={isUploading || !selectedFile} className="flex items-center">
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Upload
                  </Button>
                </CardFooter>
              </Card>
            )}

            {resource.files && resource.files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resource.files.map((file) => {
                  const FileIcon = getFileIcon(file.file_type);
                  return (
                    <Card key={file.id} className="bg-card text-card-foreground shadow rounded-lg overflow-hidden">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <FileIcon className="w-6 h-6 text-primary flex-shrink-0" />
                           <div className="flex-grow overflow-hidden">
                            <p className="text-sm font-medium truncate" title={file.title || file.file.split('/').pop()}>
                                {file.title || file.file.split('/').pop()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {file.file_type ? `${file.file_type} • ` : ''}
                              Uploaded: {new Date(file.created_at).toLocaleDateString()}
                            </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleFileDownload(file)} 
                            title="Download file"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {canPerformEditActions && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setShowDeleteFileModal(true);
                                  setFileToDelete(file);
                                }} 
                                title="Delete file"
                                className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No files attached to this resource yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteFileModal && fileToDelete && (
        <AlertDialog open={showDeleteFileModal} onOpenChange={() => setShowDeleteFileModal(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this file? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteFileModal(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleDeleteFile(fileToDelete.id);
                setShowDeleteFileModal(false);
              }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Resource Confirmation Dialog */}
      {showDeleteResourceModal && resource && (
        <AlertDialog open={showDeleteResourceModal} onOpenChange={setShowDeleteResourceModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete Resource</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the resource "{resource.title}"? 
                This will also delete all associated files and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  handleDeleteResource(); 
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Resource
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
