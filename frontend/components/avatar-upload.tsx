"use client"

import { useState } from "react"
// import { useToast } from "@/components/ui/use-toast" // Удаляем старый импорт
import { toast } from "sonner" // Добавляем импорт sonner
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Upload } from "lucide-react"
import { userApi } from "@/lib/api/user"
import { UserRole } from "@/lib/constants/roles"

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarChange: (newAvatar: string) => void
  role: UserRole
}

export function AvatarUpload({ currentAvatar, onAvatarChange, role }: AvatarUploadProps) {
  // const { toast } = useToast() // Удаляем использование хука
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true); // Добавим индикацию загрузки
    const file = e.target.files?.[0]
    if (!file) {
      setUploading(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type", {
        description: "Please upload an image file",
      })
      setUploading(false);
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 5MB",
      })
      setUploading(false);
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await userApi.uploadAvatar(formData)
      if (response.status === 'success' && response.data?.avatar) {
        onAvatarChange(response.data.avatar)
        toast.success("Avatar updated successfully")
      } else {
        toast.error(response.message || "Failed to update avatar")
      }
    } catch (error) {
      console.error("Avatar upload error:", error); // Добавим console.error для отладки
      toast.error("Failed to update avatar")
    } finally {
      setUploading(false); // Убираем индикацию загрузки
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32 border-4 border-background">
        <AvatarImage src={currentAvatar || "/placeholder.svg"} />
        <AvatarFallback>
          <User className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="relative"
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Change Avatar"}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </Button>
      </div>
    </div>
  )
} 