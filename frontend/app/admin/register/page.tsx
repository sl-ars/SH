"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminApi } from "@/lib/api/admin"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft, RefreshCw, FileSpreadsheet, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { generateRandomPassword } from "@/lib/utils/password"
import { parseCSV, parseExcel } from "@/lib/utils/file-parser"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminCompanies } from "@/lib/mock-data/admin"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.string({ required_error: "Please select a user role" }),
  university: z.string().optional(),
  company: z.string().optional(),
  company_id: z.string().optional(),
  sendWelcomeEmail: z.boolean().default(true),
  activateImmediately: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface AdminCompany {
  id: string;
  name: string;
  industry: string;
  location: string;
  verified: boolean;
}

export default function AdminRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [useAutoPassword, setUseAutoPassword] = useState(false)
  const [processingFile, setProcessingFile] = useState(false)
  const [bulkResults, setBulkResults] = useState<{ success: number; failed: number; details?: any[] } | null>(null)
  const [companies, setCompanies] = useState<{ id: string; name: string; industry: string }[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      university: "",
      company: "",
      company_id: "",
      sendWelcomeEmail: true,
      activateImmediately: true,
    },
  })

  const watchRole = watch("role")
  const watchPassword = watch("password")

  const handleRoleChange = (value: string) => {
    setValue("role", value)
    setSelectedRole(value)
  }

  const handleGeneratePassword = () => {
    const password = generateRandomPassword(12)
    setValue("password", password)
  }

  const handleToggleAutoPassword = (checked: boolean) => {
    setUseAutoPassword(checked)
    if (checked) {
      handleGeneratePassword()
    }
  }

  useEffect(() => {
    if (selectedRole === "employer") {
      const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
          if (isMockEnabled()) {
            setCompanies(mockAdminCompanies.map((company: AdminCompany) => ({
              id: company.id,
              name: company.name,
              industry: company.industry
            })));
          } else {

            const response = await adminApi.getCompanies({
              limit: 100 
            });
            if (response.status === "success" && Array.isArray(response.data)) {
              setCompanies(response.data.map((company: AdminCompany) => ({
                id: company.id,
                name: company.name,
                industry: company.industry
              })));
            }
          }
        } catch (error) {
          console.error("Error fetching companies:", error);
          toast({
            title: "Error",
            description: "Failed to load companies. You may need to create a company first.",
            variant: "destructive",
          });
        } finally {
          setLoadingCompanies(false);
        }
      };

      fetchCompanies();
    }
  }, [selectedRole, toast]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    console.log("Submitting user data:", data);

    try {
      if (!data.name) {
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (data.role === "employer" && !data.company_id) {
        toast({
          title: "Validation Error",
          description: "Please select a company for the employer",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const userData = { ...data };
      
      console.log("Sending userData to createUser:", userData);

      const response = await adminApi.createUser(userData);
      console.log("Create user response:", response);

      if (response.status === 'success') {
        setSubmitSuccess(true);
        toast({
          title: "User Created Successfully",
          description: `User ${data.name} (${data.email}) has been created with role: ${data.role}`,
        });
        
        if (data.sendWelcomeEmail) {
          toast({
            title: "Welcome Email",
            description: "A welcome email has been sent to the user with login instructions.",
          });
        }
        
        reset();
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create user. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setProcessingFile(true)
    setBulkResults(null)

    try {
      let users: any[] = []

      if (file.name.endsWith(".csv")) {
        users = await parseCSV(file)
      } else if (file.name.endsWith(".xlsx")) {
        users = await parseExcel(file)
      } else {
        throw new Error("Unsupported file format")
      }

      if (users.length === 0) {
        throw new Error("No valid user data found in file")
      }

      const results = await adminApi.bulkCreateUsers(file)

      setBulkResults({
        success: results.data.success_count,
        failed: results.data.failed_count,
        details: results.data.details || []
      })

      toast({
        title: "Bulk Upload Processed",
        description: `${results.data.success_count} users created, ${results.data.failed_count} failed.`,
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      })
    } finally {
      setProcessingFile(false)
    }
  }

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/bulk_user_template.csv';
    link.setAttribute('download', 'bulk_user_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute roles="admin">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Register New Users
          </h1>

          <Tabs defaultValue="single" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single User</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle>Create User Account</CardTitle>
                  <CardDescription>
                    Add a new user to the platform. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                {submitSuccess && (
                  <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          User created successfully! You can add another user or return to the dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">
                            Password <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="auto-password" className="text-sm font-normal">
                              Auto-generate
                            </Label>
                            <Switch
                              id="auto-password"
                              checked={useAutoPassword}
                              onCheckedChange={handleToggleAutoPassword}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            id="password"
                            type="text"
                            {...register("password")}
                            disabled={useAutoPassword}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGeneratePassword}
                            disabled={isSubmitting}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">
                          User Role <span className="text-destructive">*</span>
                        </Label>
                        <Select onValueChange={handleRoleChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="employer">Employer</SelectItem>
                            <SelectItem value="campus">Campus Admin</SelectItem>
                            <SelectItem value="admin">System Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                      </div>

                      {selectedRole === "student" && (
                        <div className="space-y-2">
                          <Label htmlFor="university">University</Label>
                          <Input id="university" {...register("university")} />
                        </div>
                      )}

                      {selectedRole === "employer" && (
                        <div className="space-y-2">
                          <Label htmlFor="company">
                            Company <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex space-x-2">
                            <div className="flex-1">
                              {false && (
                                <Controller
                                  name="company_id"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      onValueChange={(value) => {
                                        const selectedCompany = companies.find(c => c.id === value);
                                        field.onChange(value);
                                        setValue("company", selectedCompany?.name || "");
                                        console.log("Selected company:", value, selectedCompany?.name);
                                      }}
                                      value={field.value}
                                      disabled={loadingCompanies}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select a company"} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {companies.map((company) => (
                                          <SelectItem key={company.id} value={company.id}>
                                            {company.name} ({company.industry})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              )}
                              
                              {/* Используем простой HTML select (способ 2) */}
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={watch("company_id")}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const selectedCompany = companies.find(c => c.id === value);
                                  setValue("company_id", value);
                                  setValue("company", selectedCompany?.name || "");
                                  console.log("Selected company (html):", value, selectedCompany?.name);
                                }}
                                disabled={loadingCompanies}
                              >
                                <option value="">{loadingCompanies ? "Loading companies..." : "Select a company"}</option>
                                {companies.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name} ({company.industry})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => router.push("/admin/companies/new")}
                              className="whitespace-nowrap"
                            >
                              New Company
                            </Button>
                          </div>
                          {watch("company_id") && (
                            <p className="text-xs text-muted-foreground">
                              Selected company: {watch("company")}
                            </p>
                          )}
                          {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
                        </div>
                      )}

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sendWelcomeEmail"
                            checked={watch("sendWelcomeEmail")}
                            onCheckedChange={(checked) => setValue("sendWelcomeEmail", checked as boolean)}
                          />
                          <Label htmlFor="sendWelcomeEmail" className="text-sm font-normal">
                            Send welcome email with login instructions
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="activateImmediately"
                            checked={watch("activateImmediately")}
                            onCheckedChange={(checked) => setValue("activateImmediately", checked as boolean)}
                          />
                          <Label htmlFor="activateImmediately" className="text-sm font-normal">
                            Activate account immediately
                          </Label>
                        </div>
                      </div>
                    </div>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => router.push("/admin")}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-vibrant-blue hover:bg-vibrant-blue/90">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>Create User</>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Import Users</CardTitle>
                  <CardDescription>
                    Upload a CSV or Excel file to create multiple student accounts at once.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Upload User Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">Supported formats: .csv, .xlsx</p>
                    <div className="flex justify-center">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileUpload}
                        disabled={processingFile}
                        className="max-w-xs"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      File must include columns: email, password, name, role (optional: university, department, position, company_name, phone)
                    </p>
                  </div>

                  {processingFile && (
                    <div className="flex items-center justify-center space-x-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p>Processing file, please wait...</p>
                    </div>
                  )}

                  {bulkResults && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Import Results</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Success</p>
                          <p className="text-2xl font-bold">{bulkResults.success}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed</p>
                          <p className="text-2xl font-bold">{bulkResults.failed}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Template Format</h4>
                    <p className="text-sm mb-2">Your CSV or Excel file should have the following columns:</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-3 text-left">email</th>
                            <th className="py-2 px-3 text-left">password</th>
                            <th className="py-2 px-3 text-left">name</th>
                            <th className="py-2 px-3 text-left">role</th>
                            <th className="py-2 px-3 text-left">university</th>
                            <th className="py-2 px-3 text-left">department</th>
                            <th className="py-2 px-3 text-left">position</th>
                            <th className="py-2 px-3 text-left">company_name</th>
                            <th className="py-2 px-3 text-left">phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-3">john.doe@example.com</td>
                            <td className="py-2 px-3">Pass123!</td>
                            <td className="py-2 px-3">John Doe</td>
                            <td className="py-2 px-3">student</td>
                            <td className="py-2 px-3">Example University</td>
                            <td className="py-2 px-3"></td>{/* department */}
                            <td className="py-2 px-3"></td>{/* position */}
                            <td className="py-2 px-3"></td>{/* company_name */}
                            <td className="py-2 px-3"></td>{/* phone */}                            
                          </tr>
                          <tr>
                            <td className="py-2 px-3">jane.smith@example.com</td>
                            <td className="py-2 px-3">SecurePass$</td>
                            <td className="py-2 px-3">Jane Smith</td>
                            <td className="py-2 px-3">employer</td>
                            <td className="py-2 px-3"></td>{/* university */}
                            <td className="py-2 px-3"></td>{/* department */}
                            <td className="py-2 px-3"></td>{/* position */}
                            <td className="py-2 px-3">Example Corp Inc.</td>{/* company_name */}
                            <td className="py-2 px-3">555-0101</td>{/* phone */}                            
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="h-3 w-3 mr-1" /> Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" type="button" onClick={() => router.push("/admin")} className="ml-auto">
                    Back to Dashboard
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
