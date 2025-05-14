"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { resourcesApi } from "@/lib/api/resources"
import type { Resource } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

const RESOURCE_TYPE_CHOICES = [
  { value: "Guide", label: "Guide" },
  { value: "Video Course", label: "Video Course" },
  { value: "Webinar", label: "Webinar" },
  { value: "E-book", label: "E-book" },
  { value: "Article", label: "Article" },
  { value: "Workshop", label: "Workshop" },
];

interface ResourceFormData extends Omit<Partial<Resource>, 'tags' | 'is_demo'> {
  tags?: string;
  is_demo?: boolean;
}

export default function ResourceEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const resourceId = id as string

  const [formData, setFormData] = useState<ResourceFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResourceDetails = useCallback(async () => {
    if (!resourceId) return
    try {
      setLoading(true)
      setError(null)
      const response = await resourcesApi.getResource(resourceId)
      if (response.status === "success" && response.data) {
        setFormData({
          ...response.data,
          tags: Array.isArray(response.data.tags) ? response.data.tags.join(", ") : "",
          is_demo: !!response.data.is_demo
        });
      } else {
        setError(response.message || "Failed to load resource for editing")
        setFormData(null)
      }
    } catch (err) {
      console.error("Error fetching resource for editing:", err)
      setError("An error occurred while fetching the resource")
      setFormData(null)
    } finally {
      setLoading(false)
    }
  }, [resourceId])

  useEffect(() => {
    fetchResourceDetails()
  }, [fetchResourceDetails])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleCheckboxChange = (name: keyof ResourceFormData, checked: boolean) => {
    if (name === 'is_demo') {
        setFormData(prev => prev ? { ...prev, is_demo: checked } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: checked } : null);
    }
  };

  const handleSelectChange = (name: keyof ResourceFormData, value: string) => {
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !resourceId) return

    setSaving(true)
    setError(null)
    
  
    const processedData: Partial<Resource> = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        is_demo: !!formData.is_demo
    };
    if ('id' in processedData) {
      delete processedData.id;
    }

    try {
      console.log("Attempting to save resource with ID:", resourceId, "Data:", processedData);
      const response = await resourcesApi.updateResource(resourceId, processedData);

      if (response.status === "success" && response.data) {
        toast({
          title: "Resource Updated",
          description: "The resource has been successfully saved.",
        });
        router.push(`/resources/${resourceId}`);
      } else {
        const errorMessage = response.message || "Failed to save resource. Please try again.";
        setError(errorMessage);
        toast({
          title: "Save Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error saving resource:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while saving.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4 flex items-center text-muted-foreground hover:text-foreground" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Card className="bg-destructive/10 text-destructive-foreground">
            <CardHeader>
              <CardTitle>Error Loading Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "Failed to load resource data for editing."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2 flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => router.push(`/resources/${resourceId}`)}
              title="Cancel and return to resource details"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resource
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Resource</h1>
            <p className="text-muted-foreground mt-1">Update the details of your resource below.</p>
          </div>
        </div>

        <Card className="bg-card text-card-foreground shadow-lg rounded-lg">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label htmlFor="title" className="block text-sm font-medium mb-1">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium mb-1">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="block text-sm font-medium mb-1">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content || ""}
                  onChange={handleInputChange}
                  rows={6}
                  
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="block text-sm font-medium mb-1">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="block text-sm font-medium mb-1">Resource Type</Label>
                  <Select
                    name="type"
                    value={formData.type || ""}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPE_CHOICES.map(choice => (
                        <SelectItem key={choice.value} value={choice.value} >
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estimated_time" className="block text-sm font-medium mb-1">Estimated Time (e.g., "1 hour", "30 mins")</Label>
                <Input
                  id="estimated_time"
                  name="estimated_time"
                  value={formData.estimated_time || ""}
                  onChange={handleInputChange}
                  
                />
              </div>

              <div>
                <Label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags || ""}
                  onChange={handleInputChange}
                  
                  placeholder="e.g.: react, typescript, beginners"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_demo"
                  name="is_demo"
                  checked={!!formData.is_demo}
                  onCheckedChange={(checked) => handleCheckboxChange('is_demo', !!checked)}
                  className="dark:border-gray-600 data-[state=checked]:dark:bg-blue-500"
                />
                <Label htmlFor="is_demo" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Demo resource (visible to unauthenticated users)
                </Label>
              </div>

            </CardContent>
            <CardFooter className="p-6 border-t flex justify-end">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 