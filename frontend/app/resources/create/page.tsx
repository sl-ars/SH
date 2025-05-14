"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, PlusCircle } from "lucide-react" 
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

interface ResourceFormData extends Omit<Partial<Resource>, 'tags' | 'is_demo' | 'id' | 'author' | 'author_details' | 'created_at' | 'updated_at' | 'files' | 'file_count'> {
  tags?: string;
  is_demo?: boolean;
}

const initialFormData: ResourceFormData = {
  title: "",
  description: "",
  content: "",
  category: "",
  type: "",
  estimated_time: "",
  tags: "",
  is_demo: false,
};

export default function ResourceCreatePage() {
  const router = useRouter()

  const [formData, setFormData] = useState<ResourceFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: keyof ResourceFormData, checked: boolean) => {
    if (name === 'is_demo') {
        setFormData(prev => ({ ...prev, is_demo: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };

  const handleSelectChange = (name: keyof ResourceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSaving(true)
    setError(null) 
    
    const processedData: Partial<Resource> = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        is_demo: !!formData.is_demo 
    };

    try {
      console.log("Attempting to create resource with Data:", processedData);
      const response = await resourcesApi.createResource(processedData);

      if (response.status === "success" && response.data && response.data.id) {
        toast({
          title: "Resource Created",
          description: "The new resource has been successfully created.",
        });
        router.push(`/resources/${response.data.id}`);
      } else {
        const errorMessage = response.message || "Failed to create resource. Please try again.";
        setError(errorMessage);
        toast({
          title: "Creation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error creating resource:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while creating.";
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

  if (error) { 
    return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4 flex items-center text-muted-foreground hover:text-foreground" 
            onClick={() => router.push('/resources')} 
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
          </Button>
          <Card className="bg-destructive/10 text-destructive-foreground">
            <CardHeader>
              <CardTitle>Error Creating Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2 flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => router.push('/resources')}
              title="Cancel and return to resource list"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Creation
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Create New Resource</h1>
            <p className="text-muted-foreground mt-1">Fill in the details for the new resource below.</p>
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
                        <SelectItem key={choice.value} value={choice.value}>
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
                />
                <Label htmlFor="is_demo" className="text-sm font-medium cursor-pointer">
                  Demo resource (visible to unauthenticated users)
                </Label>
              </div>

            </CardContent>
            <CardFooter className="p-6 border-t flex justify-end">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} {}
                Create Resource
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 