"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { adminApi } from "@/lib/api/admin"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  industry: z.string().min(2, { message: "Industry is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  verified: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      industry: "",
      location: "",
      description: "",
      website: "",
      verified: false,
    },
  });

  const watchVerified = watch("verified");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting company data:", data);
      
      const response = await adminApi.createCompany(data);
      
      if (response.status === "success") {
        toast({
          title: "Company Created",
          description: `Company ${data.name} has been created successfully`,
        });
        
        // Redirect to company list page
        router.push("/admin/companies");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create company",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/companies" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
          <CardDescription>
            Create a new company profile in the system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select 
                  onValueChange={(value) => setValue("industry", value)}
                  defaultValue=""
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input id="location" {...register("location")} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">
                Website
              </Label>
              <Input id="website" type="url" {...register("website")} placeholder="https://example.com" />
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea 
                id="description" 
                {...register("description")}
                rows={4}
                placeholder="Provide a brief description of the company"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="verified"
                checked={watchVerified}
                onCheckedChange={(checked) => setValue("verified", checked)}
              />
              <Label htmlFor="verified" className="text-sm font-normal">
                Verify this company (verified companies appear with a badge and gain additional trust)
              </Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/companies")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Company"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 