"use client"

import { useState } from "react"
import { useDropzone, FileWithPath } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload, X } from "lucide-react"
import { userApi } from "@/lib/api/user"
import { useToast } from "@/components/ui/use-toast"
import {resumeApi} from "@/lib/api";

interface ResumeUploadProps {
  onUploadComplete?: (url: string) => void
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsUploading(true)

      try {
        const response = await resumeApi.uploadResume(file)
        if (response.status === "success") {
          toast({
            title: "Success",
            description: "Resume uploaded successfully",
          })
          onUploadComplete?.(response.data.url)
        } else {
          throw new Error(response.message)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to upload resume",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {isDragActive
                  ? "Drop your resume here"
                  : "Drag & drop your resume here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
