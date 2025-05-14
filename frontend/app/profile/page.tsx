"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { USER_ROLES, UserRole } from "@/lib/constants/roles"; // Убедимся, что UserRole импортирован
import { userApi } from "@/lib/api/user";
import type { 
  AnyFullProfile, 
  User, 
  Education, 
  Experience, 
  StudentProfile, // Corrected from FullStudentProfile
  EmployerProfile, // Corrected from FullEmployerProfile
  CampusProfile, // Corrected from FullCampusProfile
  AdminProfile, // Corrected from FullAdminProfile
  BaseProfileData // Assuming BaseProfileData contains common fields like description
} from "@/lib/types"; 
import { ResumeUpload } from "@/components/resume-upload"; // Added
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/avatar-upload";
import ProtectedRoute from "@/components/protected-route";
import { Progress } from "@/components/ui/progress";
import { Shield, Briefcase, GraduationCap, Award, Users, Building2, Settings, ChevronDown, ChevronUp, Plus, Trash2, FileText, Download, CheckCircle2, Star, Eye } from "lucide-react"; // Добавим иконки, Star добавлена, Eye добавлена
import { Badge } from "@/components/ui/badge"; // Added Badge for skills
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {resumeApi} from "@/lib/api"; // Added Tabs components

// ЗАГЛУШКИ для компонентов секций - их нужно будет создать/реализовать
const BasicInfoCard = ({ profileData, onInputChange, userRole, commonFieldsConfig }: { profileData: AnyFullProfile, onInputChange: Function, userRole: UserRole, commonFieldsConfig: any[] }) => (
    <Card>
        <CardHeader><CardTitle>Basic Information ({userRole})</CardTitle></CardHeader>
        <CardContent> {/* TODO: Implement based on commonFieldsConfig and profileData */} </CardContent>
    </Card>
);

// Props for StudentSections
interface StudentSectionsProps {
  profileData: StudentProfile;
  skillsInputValue: string;
  onSkillsChange: (value: string) => void;
  achievementsInputValue: string;
  onAchievementsChange: (value: string) => void;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
  onUpdateEducation: (index: number, field: keyof Education, value: string) => void;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
  onUpdateExperience: (index: number, field: keyof Experience, value: string | string[]) => void; // value can be string[] for skills_used
  resumes: Array<{ id: string; name: string; created_at: string; url?: string; file?: string }>;
  loadingResumes: boolean;
  deletingResume: string | null;
  onDeleteResume: (resumeId: string) => Promise<void>;
  onResumeUploadComplete: (url: string) => void;
  onShowResume: (resumeId: string) => Promise<void>;
  showingResumeId: string | null;
}

const StudentSections = ({ 
  profileData, 
  skillsInputValue, 
  onSkillsChange, 
  achievementsInputValue, 
  onAchievementsChange,
  onInputChange,
  commonFieldsConfig,
  onAddEducation,
  onRemoveEducation,
  onUpdateEducation,
  onAddExperience,
  onRemoveExperience,
  onUpdateExperience,
  resumes,
  loadingResumes,
  deletingResume,
  onDeleteResume,
  onResumeUploadComplete,
  onShowResume,
  showingResumeId
}: StudentSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal-info");
  const [expandedEducation, setExpandedEducation] = useState<number | null>(null);
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="skills-achievements">Skills & Achievements</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {commonFieldsConfig
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`student-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`student-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof StudentProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-500" />Bio / Description</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="student-description">Your Bio</Label>
                  <Textarea
                    id="student-description"
                    value={profileData.description || ""}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills-achievements" className="space-y-6">
            {/* Skills Section Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" /> 
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="student-skills">Skills (comma-separated)</Label>
                  <Textarea
                    id="student-skills"
                    placeholder="e.g., JavaScript, React, Node.js, Python"
                    value={skillsInputValue}
                    onChange={(e) => onSkillsChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {profileData.skills && profileData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Section Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="student-achievements">Achievements (one per line)</Label>
                  <Textarea
                    id="student-achievements"
                    placeholder="e.g., Dean's List Fall 2023\\nWon 1st place in Hackathon XYZ"
                    value={achievementsInputValue}
                    onChange={(e) => onAchievementsChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {profileData.achievements && profileData.achievements.length > 0 && (
                    <ul className="list-disc list-inside pt-2 space-y-1">
                      {profileData.achievements.map((achievement, index) => (
                        <li key={index} className="text-sm">
                          {achievement} 
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
                  Education History
                </CardTitle>
                <Button onClick={onAddEducation} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.education && profileData.education.length > 0 ? (
                  profileData.education.map((edu, index) => (
                    <Card key={edu.id || index} className="border rounded-lg shadow-sm">
                      <CardHeader className="p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setExpandedEducation(expandedEducation === index ? null : index)}>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-md">
                            {edu.degree || 'Degree'} at {edu.university || 'University'}
                          </h4>
                          <CardDescription className="text-xs">
                            {edu.field || 'Field of Study'}
                            {(edu.start_date || edu.end_date) && " | "}
                            {edu.start_date && new Date(edu.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            {edu.start_date && edu.end_date && " - "}
                            {edu.end_date && (edu.end_date.toLowerCase() === 'present' ? 'Present' : new Date(edu.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }))}
                          </CardDescription>
                        </div>
                        <div className="flex items-center ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent CardHeader onClick
                              onRemoveEducation(index);
                              if (expandedEducation === index) setExpandedEducation(null);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                            {expandedEducation === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </Button>
                        </div>
                      </CardHeader>
                      {expandedEducation === index && (
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`edu-university-${index}`}>University/Institution</Label>
                              <Input
                                id={`edu-university-${index}`}
                                value={edu.university || ""}
                                onChange={(e) => onUpdateEducation(index, 'university', e.target.value)}
                                placeholder="e.g., Harvard University"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                              <Input
                                id={`edu-degree-${index}`}
                                value={edu.degree || ""}
                                onChange={(e) => onUpdateEducation(index, 'degree', e.target.value)}
                                placeholder="e.g., Bachelor of Science"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                              <Input
                                id={`edu-field-${index}`}
                                value={edu.field || ""}
                                onChange={(e) => onUpdateEducation(index, 'field', e.target.value)}
                                placeholder="e.g., Computer Science"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                <Label htmlFor={`edu-start-date-${index}`}>Start Date</Label>
                                <Input
                                    type="text" // Using text for now, consider a date picker
                                    id={`edu-start-date-${index}`}
                                    value={edu.start_date || ""}
                                    onChange={(e) => onUpdateEducation(index, 'start_date', e.target.value)}
                                    placeholder="e.g., 2020-09"
                                />
                                </div>
                                <div className="space-y-1">
                                <Label htmlFor={`edu-end-date-${index}`}>End Date (or Expected)</Label>
                                <Input
                                    type="text" // Using text for now, consider a date picker
                                    id={`edu-end-date-${index}`}
                                    value={edu.end_date || ""}
                                    onChange={(e) => onUpdateEducation(index, 'end_date', e.target.value)}
                                    placeholder="e.g., 2024-06 or Present"
                                />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <Label htmlFor={`edu-description-${index}`}>Description (Optional)</Label>
                              <Textarea
                                id={`edu-description-${index}`}
                                value={edu.description || ""}
                                onChange={(e) => onUpdateEducation(index, 'description', e.target.value)}
                                placeholder="e.g., Relevant coursework, thesis, activities..."
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No education history added yet. Click "Add Education" to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                  Work Experience
                </CardTitle>
                <Button onClick={onAddExperience} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Add Experience
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.experience && profileData.experience.length > 0 ? (
                  profileData.experience.map((exp, index) => (
                    <Card key={exp.id || index} className="border rounded-lg shadow-sm">
                      <CardHeader className="p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setExpandedExperience(expandedExperience === index ? null : index)}>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-md">
                            {exp.position || 'Position'} at {exp.company || 'Company'}
                          </h4>
                          <CardDescription className="text-xs">
                            {exp.start_date && new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            {exp.start_date && exp.end_date && " - "}
                            {exp.end_date && (exp.end_date.toLowerCase() === 'present' ? 'Present' : new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }))}
                            {!exp.start_date && !exp.end_date && "Dates not specified"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent CardHeader onClick
                              onRemoveExperience(index);
                              if (expandedExperience === index) setExpandedExperience(null);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                            {expandedExperience === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </Button>
                        </div>
                      </CardHeader>
                      {expandedExperience === index && (
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`exp-company-${index}`}>Company</Label>
                              <Input
                                id={`exp-company-${index}`}
                                value={exp.company || ""}
                                onChange={(e) => onUpdateExperience(index, 'company', e.target.value)}
                                placeholder="e.g., Google"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`exp-position-${index}`}>Position/Role</Label>
                              <Input
                                id={`exp-position-${index}`}
                                value={exp.position || ""}
                                onChange={(e) => onUpdateExperience(index, 'position', e.target.value)}
                                placeholder="e.g., Software Engineer Intern"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div className="space-y-1">
                                <Label htmlFor={`exp-start-date-${index}`}>Start Date</Label>
                                <Input
                                    type="text" // Consider a date picker
                                    id={`exp-start-date-${index}`}
                                    value={exp.start_date || ""}
                                    onChange={(e) => onUpdateExperience(index, 'start_date', e.target.value)}
                                    placeholder="e.g., 2022-06"
                                />
                                </div>
                                <div className="space-y-1">
                                <Label htmlFor={`exp-end-date-${index}`}>End Date (or Present)</Label>
                                <Input
                                    type="text" // Consider a date picker
                                    id={`exp-end-date-${index}`}
                                    value={exp.end_date || ""}
                                    onChange={(e) => onUpdateExperience(index, 'end_date', e.target.value)}
                                    placeholder="e.g., 2022-09 or Present"
                                />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <Label htmlFor={`exp-description-${index}`}>Description (Optional)</Label>
                              <Textarea
                                id={`exp-description-${index}`}
                                value={exp.description || ""}
                                onChange={(e) => onUpdateExperience(index, 'description', e.target.value)}
                                placeholder="e.g., Developed key features for..., Led a team of..."
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No work experience added yet. Click "Add Experience" to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resumes">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-vibrant-blue">
                  <FileText className="w-5 h-5 mr-2" />
                  Resumes
                </CardTitle>
                <CardDescription>Upload and manage your resumes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResumeUpload onUploadComplete={onResumeUploadComplete} />

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Your Resumes</h4>
                  {loadingResumes ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vibrant-blue"></div>
                    </div>
                  ) : resumes.length > 0 ? (
                    <div className="space-y-2">
                      {resumes.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-vibrant-blue" />
                            <div>
                              <p className="text-sm font-medium">{resume.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(resume.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onShowResume(resume.id)}
                              disabled={showingResumeId === resume.id}
                            >
                              {showingResumeId === resume.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vibrant-blue"></div>
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDeleteResume(resume.id)}
                              disabled={deletingResume === resume.id}
                            >
                              {deletingResume === resume.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Props for EmployerSections
interface EmployerSectionsProps {
  profileData: EmployerProfile;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
  companySkillsInputValue: string;
  onCompanySkillsChange: (value: string) => void;
}

const EmployerSections = ({ 
  profileData, 
  onInputChange, 
  commonFieldsConfig, 
  companySkillsInputValue, 
  onCompanySkillsChange 
}: EmployerSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("company-details"); // Default to company-details

  // Filter out 'description' from commonFieldsConfig for Employer's Personal Info tab
  const employerCommonFields = commonFieldsConfig.filter(field => field.key !== 'description');

  return (
    <Card>
      <CardHeader><CardTitle>Employer & Company Details</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="contact-info">Contact Person Info</TabsTrigger>
            <TabsTrigger value="company-details">Company Details</TabsTrigger>
          </TabsList>

          <TabsContent value="contact-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Contact Person</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {employerCommonFields
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`employer-contact-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`employer-contact-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof EmployerProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company-details" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Building2 className="w-5 h-5 mr-2 text-sky-500" /> Company Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="employer-company-name">Company Name</Label>
                  <Input
                    id="employer-company-name"
                    type="text"
                    value={(profileData as EmployerProfile).company_name || (profileData as EmployerProfile).company || ""} 
                    onChange={(e) => onInputChange('company_name' as keyof AnyFullProfile, e.target.value)}
                    placeholder="Your Company LLC"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="employer-company-website">Company Website</Label>
                  <Input
                    id="employer-company-website"
                    type="url"
                    value={(profileData as EmployerProfile).company_website || ""} 
                    onChange={(e) => onInputChange('company_website' as keyof AnyFullProfile, e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="employer-company-description">Company Description</Label>
                  <Textarea
                    id="employer-company-description"
                    value={(profileData as EmployerProfile).description || ""} // description from BaseProfileData is company description
                    onChange={(e) => onInputChange('description' as keyof AnyFullProfile, e.target.value)}
                    placeholder="Describe your company..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employer-company-skills">Company Skills/Tags (comma-separated)</Label>
                  <Textarea
                    id="employer-company-skills"
                    placeholder="e.g., Fintech, AI, SaaS"
                    value={companySkillsInputValue}
                    onChange={(e) => onCompanySkillsChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {(profileData as EmployerProfile).company_skills_tags && (profileData as EmployerProfile).company_skills_tags!.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(profileData as EmployerProfile).company_skills_tags!.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Props for CampusSections
interface CampusSectionsProps {
  profileData: CampusProfile;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
  programsOfferedInputValue: string;
  onProgramsOfferedChange: (value: string) => void;
}

const CampusSections = ({ 
  profileData, 
  onInputChange, 
  commonFieldsConfig, 
  programsOfferedInputValue, 
  onProgramsOfferedChange 
}: CampusSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal-info");

  return (
    <Card>
      <CardHeader><CardTitle>Campus Details</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4"> {/* 2 Tabs for now */}
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="campus-specifics">Campus Specifics</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {commonFieldsConfig
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`campus-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`campus-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof CampusProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-500" />Campus Description</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="campus-description">Description of the Campus</Label>
                  <Textarea
                    id="campus-description"
                    value={profileData.description || ""}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Tell us about your campus..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campus-specifics" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-purple-500" /> Programs Offered</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="campus-programs">Programs Offered (one per line)</Label>
                  <Textarea
                    id="campus-programs"
                    placeholder="e.g., Computer Science\\nBusiness Administration"
                    value={programsOfferedInputValue}
                    onChange={(e) => onProgramsOfferedChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {profileData.programs_offered && profileData.programs_offered.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-1">Current Programs:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {profileData.programs_offered.map((program, index) => (
                          <li key={index} className="text-sm">
                            {program}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* TODO: Add other campus-specific fields if any, e.g., website, specific contact persons etc. */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Props for AdminSections
interface AdminSectionsProps {
  profileData: AdminProfile;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
}

const AdminSections = ({ 
  profileData, 
  onInputChange, 
  commonFieldsConfig 
}: AdminSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal-info");

  return (
    <Card>
      <CardHeader><CardTitle>Administrator Control</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4"> {/* 2 Tabs for Admin */}
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="system-settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {commonFieldsConfig
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`admin-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`admin-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof AdminProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-500" />Admin Description</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="admin-description">Your Description (optional)</Label>
                  <Textarea
                    id="admin-description"
                    value={profileData.description || ""}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Brief description about your role or yourself..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system-settings" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Settings className="w-5 h-5 mr-2 text-gray-700" /> System Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="admin-system-name">System Name</Label>
                  <Input
                    id="admin-system-name"
                    type="text"
                    value={(profileData as AdminProfile).system_name || ""} 
                    onChange={(e) => onInputChange('system_name' as keyof AnyFullProfile, e.target.value)}
                    placeholder="e.g., StudentHunter Platform"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="admin-system-description">System Description</Label>
                  <Textarea
                    id="admin-system-description"
                    value={(profileData as AdminProfile).system_description || ""}
                    onChange={(e) => onInputChange('system_description' as keyof AnyFullProfile, e.target.value)}
                    placeholder="Brief overview of the system..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Updated StudentStatsCard to use profile_completeness_percentage and missing_profile_fields from profileData
const StudentStatsCard = ({ profileData }: { profileData: StudentProfile }) => {
    const completion = profileData.profile_completeness_percentage;
    const missing = profileData.missing_profile_fields;

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-vibrant-blue" /> Profile Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {typeof completion === 'number' && (
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Completeness</span>
                            <span className="text-sm font-medium text-vibrant-blue">{completion.toFixed(0)}%</span>
                        </div>
                        <Progress value={completion} className="h-2 [&>div]:bg-vibrant-blue" />
                    </div>
                )}
                {missing && missing.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Areas to improve:</h4>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            {missing.map((field, index) => (
                                <li key={index} className="text-xs text-gray-600 dark:text-gray-400">{field}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {(!missing || missing.length === 0) && typeof completion === 'number' && completion === 100 && (
                     <p className="text-sm text-green-600 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Profile is 100% complete!
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

const EmployerStatsCard = ({ profileData }: any) => (
    <Card><CardHeader><CardTitle>Employer Stats</CardTitle></CardHeader><CardContent> {/* TODO */} </CardContent></Card>
);

const CampusStatsCard = ({ profileData }: any) => (
    <Card><CardHeader><CardTitle>Campus Stats</CardTitle></CardHeader><CardContent> {/* TODO */} </CardContent></Card>
);

const AdminStatsCard = ({ profileData }: any) => (
    <Card><CardHeader><CardTitle>Admin System Stats</CardTitle></CardHeader><CardContent> {/* TODO */} </CardContent></Card>
);


export default function UnifiedProfilePage() {
  const { user, logout, refreshUserInfo } = useAuth(); // Removed authLoading
  const router = useRouter();
  const [profileData, setProfileData] = useState<AnyFullProfile | null>(null);
  const [originalProfileData, setOriginalProfileData] = useState<AnyFullProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingResume, setDeletingResume] = useState<string | null>(null);
  const [showingResumeId, setShowingResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // State for controlled inputs for lists/tags
  const [skillsInputValue, setSkillsInputValue] = useState('');
  const [achievementsInputValue, setAchievementsInputValue] = useState('');
  const [companySkillsInputValue, setCompanySkillsInputValue] = useState('');
  const [programsOfferedInputValue, setProgramsOfferedInputValue] = useState('');

  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [hasShownCompletionPopup, setHasShownCompletionPopup] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    try {
      const response = await userApi.getMyProfile();
      if (response.status === "success" && response.data) {
        setProfileData(response.data);
        setOriginalProfileData(JSON.parse(JSON.stringify(response.data)));
        setUserRole(response.data.role as UserRole);

        // Initialize input values from profile data
        if (response.data.role === USER_ROLES.STUDENT) {
          const studentProfile = response.data as StudentProfile;
          setSkillsInputValue(studentProfile.skills?.join(', ') || '');
          setAchievementsInputValue(studentProfile.achievements?.join('\n') || '');
          // Set profileCompletion and missingFields from backend data if available
          // These will be used by StudentStatsCard directly via profileData prop
          // So, local states profileCompletion and missingFields might not be needed for students if backend provides this reliably.
          if (typeof studentProfile.profile_completeness_percentage === 'number') {
            setProfileCompletion(studentProfile.profile_completeness_percentage);
          }
          if (studentProfile.missing_profile_fields) {
            setMissingFields(studentProfile.missing_profile_fields);
          }
        } else if (response.data.role === USER_ROLES.EMPLOYER) {
          const employerProfile = response.data as EmployerProfile;
          setCompanySkillsInputValue(employerProfile.company_skills_tags?.join(', ') || '');
        } else if (response.data.role === USER_ROLES.CAMPUS) {
          const campusProfile = response.data as CampusProfile;
          setProgramsOfferedInputValue(campusProfile.programs_offered?.map(p => typeof p === 'string' ? p : (p as {name: string}).name).join(', ') || '');
        }
        
        setError(null);
      } else {
        setError(response.message || "Failed to load profile data.");
        toast.error(response.message || "Failed to load profile data.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching profile data.");
      toast.error(err.message || "An error occurred while fetching profile data.");
    } finally {
      setLoadingProfile(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && !profileData) {
      fetchProfileData();
    }
  }, [user?.id, profileData, fetchProfileData]);
  
  const handleDeleteResume = useCallback(async (resumeId: string) => {
    if (!profileData || profileData.role !== USER_ROLES.STUDENT) return;
    
    setDeletingResume(resumeId);
    try {
      const response = await resumeApi.deleteResume(resumeId);
      if (response.status === "success") {
        toast.success("Resume deleted successfully. Refreshing profile...");
        await fetchProfileData();
      } else {
        toast.error(response.message || "Failed to delete resume.");
      }
    } catch (err: any) {
      toast.error("Error deleting resume: " + (err.message || "Unknown error"));
    } finally {
      setDeletingResume(null);
    }
  }, [profileData, fetchProfileData]);

  const handleResumeUploadComplete = useCallback(async () => {
    toast.success("Resume action completed. Refreshing profile...");
    await fetchProfileData();
  }, [fetchProfileData]);

  const handleShowResume = useCallback(async (resumeId: string) => {
    setShowingResumeId(resumeId);
    try {
      const response = await resumeApi.getResumeDetails(resumeId);
      if (response.status === "success" && response.data?.file) {
        window.open(response.data.file, '_blank');
      } else {
        toast.error(response.message || "Could not retrieve resume link.");
      }
    } catch (err: any) {
      toast.error("Error fetching resume details: " + (err.message || "Unknown error"));
    } finally {
      setShowingResumeId(null);
    }
  }, []);

  const commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean; role?: UserRole }> = [
    { key: 'name', label: 'Full Name', type: 'text', readOnly: false },
    { key: 'email', label: 'Email', type: 'email', readOnly: true }, // Email обычно не меняется
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 555-5555', readOnly: false },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'City, State', readOnly: false },
  ];

  useEffect(() => {
    if (profileData && userRole) {
        // If the role is student, the stats are now directly in profileData.
        // For other roles, or if student data is missing these fields, calculateProfileCompletion might still be used.
        if (userRole !== USER_ROLES.STUDENT || 
            (userRole === USER_ROLES.STUDENT && 
             (!(profileData as StudentProfile).profile_completeness_percentage || 
              !(profileData as StudentProfile).missing_profile_fields))) {
          const { percentage, missing } = calculateProfileCompletion(profileData, userRole);
          setProfileCompletion(percentage);
          setMissingFields(missing);
        }
    }
  }, [profileData, userRole]);

  const calculateProfileCompletion = useCallback((data: AnyFullProfile | null, currentRole: UserRole | null) => {
    if (!data || !currentRole) return { percentage: 0, missing: [] };

    type ProfileKey = keyof User | keyof StudentProfile | keyof EmployerProfile | keyof CampusProfile | 'resumes' | 'portfolio_url' | 'linkedin_url' | 'company_skills_tags' | 'programs_offered' | 'system_name' | 'system_description' | 'company_website' | 'description'; // Added missing keys
    interface FieldConfig {
      key: ProfileKey;
      label: string;
      role?: UserRole[]; // Optional: field is specific to these roles
      isList?: boolean; // Optional: field is an array and considered complete if not empty
      isResumeCheck?: boolean; // Optional: special handling for resume check
    }

    let commonRequiredFields: FieldConfig[] = [
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'location', label: 'Location' },
      // 'description' (bio/company description) is handled role-specifically below
    ];

    let roleSpecificFields: FieldConfig[] = [];

    if (currentRole === USER_ROLES.STUDENT) {
      roleSpecificFields = [
        { key: 'description', label: 'Bio', role: [USER_ROLES.STUDENT] }, // Student's bio
        { key: 'education', label: 'Education History', role: [USER_ROLES.STUDENT], isList: true },
        { key: 'experience', label: 'Work Experience', role: [USER_ROLES.STUDENT], isList: true },
        { key: 'skills', label: 'Skills', role: [USER_ROLES.STUDENT], isList: true },
        { key: 'achievements', label: 'Achievements/Awards', role: [USER_ROLES.STUDENT], isList: true },
        { key: 'portfolio_url', label: 'Portfolio URL', role: [USER_ROLES.STUDENT] }, 
        { key: 'linkedin_url', label: 'LinkedIn Profile', role: [USER_ROLES.STUDENT] },
        { key: 'resumes', label: 'Resume(s)', role: [USER_ROLES.STUDENT], isResumeCheck: true }
      ];
    } else if (currentRole === USER_ROLES.EMPLOYER) {
      roleSpecificFields = [
        { key: 'company_name', label: 'Company Name', role: [USER_ROLES.EMPLOYER] },
        { key: 'company_website', label: 'Company Website', role: [USER_ROLES.EMPLOYER] },
        { key: 'description', label: 'Company Description', role: [USER_ROLES.EMPLOYER] }, // Employer's company description
        { key: 'company_skills_tags', label: 'Company Skills/Tags', role: [USER_ROLES.EMPLOYER], isList: true },
      ];
    } else if (currentRole === USER_ROLES.CAMPUS) {
        roleSpecificFields = [
            { key: 'description', label: 'Campus Description', role: [USER_ROLES.CAMPUS] },
            { key: 'programs_offered', label: 'Programs Offered', role: [USER_ROLES.CAMPUS], isList: true },
        ];
    }
    // No specific fields for ADMIN for completion calculation by default

    const allRequiredFields = [...commonRequiredFields, ...roleSpecificFields];
    let completedCount = 0;
    const missing: string[] = [];

    allRequiredFields.forEach(field => {
      let isFieldCompleted = false;
      if (field.isResumeCheck && currentRole === USER_ROLES.STUDENT) {
        const studentData = data as StudentProfile;
        isFieldCompleted = Array.isArray((studentData as any).resumes) && (studentData as any).resumes.length > 0;
      } else if (field.key === 'avatar') {
        // ... rest of calculateProfileCompletion, ensuring it correctly accesses data for other fields
        const value = (data as any)[field.key];
        if (Array.isArray(value)) {
          isFieldCompleted = value.length > 0;
        } else if (typeof value === 'object' && value !== null) {
          isFieldCompleted = Object.keys(value).length > 0; // Or some other logic for objects
        } else {
          isFieldCompleted = !!value; // For primitive types, non-empty string, non-zero number, true boolean
        }
      } else {
        // Safely access parts of the union type AnyFullProfile
        if (currentRole === USER_ROLES.STUDENT && field.role?.includes(USER_ROLES.STUDENT)) {
            const value = (data as StudentProfile)[field.key as keyof StudentProfile];
            if (Array.isArray(value)) {
                isFieldCompleted = value.length > 0;
            } else if (typeof value === 'object' && value !== null) {
                isFieldCompleted = Object.keys(value).length > 0;
            } else {
                isFieldCompleted = !!value;
            }
        } else if (currentRole === USER_ROLES.EMPLOYER && field.role?.includes(USER_ROLES.EMPLOYER)) {
            const value = (data as EmployerProfile)[field.key as keyof EmployerProfile];
            if (Array.isArray(value)) {
                isFieldCompleted = value.length > 0;
            } else if (typeof value === 'object' && value !== null) {
                isFieldCompleted = Object.keys(value).length > 0;
            } else {
                isFieldCompleted = !!value;
            }
        } else if (currentRole === USER_ROLES.CAMPUS && field.role?.includes(USER_ROLES.CAMPUS)) {
            const value = (data as CampusProfile)[field.key as keyof CampusProfile];
            if (Array.isArray(value)) {
                isFieldCompleted = value.length > 0;
            } else if (typeof value === 'object' && value !== null) {
                isFieldCompleted = Object.keys(value).length > 0;
            } else {
                isFieldCompleted = !!value;
            }
        } else if (!field.role) { // Common field
            const value = (data as User)[field.key as keyof User];
            if (Array.isArray(value)) {
                isFieldCompleted = value.length > 0;
            } else if (typeof value === 'object' && value !== null) {
                isFieldCompleted = Object.keys(value).length > 0;
            } else {
                isFieldCompleted = !!value;
            }
        }
      }

      if (isFieldCompleted) {
        completedCount++;
      } else {
        missing.push(field.label);
      }
    });

    const percentage = allRequiredFields.length > 0 ? (completedCount / allRequiredFields.length) * 100 : 0;
    return { percentage, missing };
  }, []);

  const handleInputChange = useCallback((field: keyof AnyFullProfile, value: any) => {
    setProfileData(prev => {
      if (!prev) return null;
      // Для сложных полей (массивы объектов как education/experience) нужна отдельная логика
      // Этот обработчик больше для простых полей
      return { ...prev, [field]: value } as AnyFullProfile;
    });
  }, []);
  
  const handleStudentSkillsChange = useCallback((newRawValue: string) => {
    setSkillsInputValue(newRawValue);
    const skillsArray = newRawValue.split(",").map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => 
        (prev && prev.role === USER_ROLES.STUDENT) 
            ? { ...prev, skills: skillsArray } as AnyFullProfile 
            : prev
    );
  }, []);

  const handleStudentAchievementsChange = useCallback((newRawValue: string) => {
    setAchievementsInputValue(newRawValue);
    const newAchievements = newRawValue.split("\n").map(s => s.trim()).filter(s => s);
     setProfileData(prev => 
        (prev && prev.role === USER_ROLES.STUDENT) 
            ? { ...prev, achievements: newAchievements } as AnyFullProfile
            : prev
    );
  }, []);

  const handleCampusProgramsChange = useCallback((newRawValue: string) => {
    setProgramsOfferedInputValue(newRawValue);
    const programsArray = newRawValue.split("\n").map(p => p.trim()).filter(Boolean);
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.CAMPUS) {
        // Ensure we are casting to the specific profile type before spreading and adding new fields
        return { ...(prev as CampusProfile), programs_offered: programsArray } as CampusProfile;
      }
      return prev;
    });
  }, []);

  const handleEmployerSkillsChange = useCallback((newRawValue: string) => {
    setCompanySkillsInputValue(newRawValue);
    const skillsArray = newRawValue.split(",").map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.EMPLOYER) {
        return { ...(prev as EmployerProfile), company_skills_tags: skillsArray } as EmployerProfile;
      }
      return prev;
    });
  }, []);

  // Обработчики для Education (студент)
  const handleAddEducationItem = useCallback(() => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        const newEducationEntry: Education = {
          // id: String(Date.now()), // ID будет присвоен бэкендом или использовать UUID
          id: `new_${Date.now()}`, // Временный ID для ключей React, бэк должен присвоить реальный
          university: "",
          field: "",
          degree: "",
          start_date: "",
          end_date: "",
          description: "",
        };
        return {
          ...studentProfile,
          education: [...(studentProfile.education || []), newEducationEntry],
        } as StudentProfile;
      }
      return prev;
    });
  }, []);

  const handleRemoveEducationItem = useCallback((index: number) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.education) {
          const updatedEducation = [...studentProfile.education];
          updatedEducation.splice(index, 1);
          return { ...studentProfile, education: updatedEducation } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  const handleUpdateEducationItem = useCallback((index: number, field: keyof Education, value: string) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.education && studentProfile.education[index]) {
          const updatedEducation = [...studentProfile.education];
          updatedEducation[index] = { ...updatedEducation[index], [field]: value };
          return { ...studentProfile, education: updatedEducation } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  // TODO: Обработчики для experience (add, update, remove, move) для студента

  // Обработчики для Experience (студент)
  const handleAddExperienceItem = useCallback(() => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        const newExperienceEntry: Experience = {
          id: `new_exp_${Date.now()}`, // Временный ID
          company: "",
          position: "", // Corrected from role
          start_date: "",
          end_date: "",
          description: "",
          // skills_used: [], // Removed as it's not in Experience type
        };
        return {
          ...studentProfile,
          experience: [...(studentProfile.experience || []), newExperienceEntry],
        } as StudentProfile;
      }
      return prev;
    });
  }, []);

  const handleRemoveExperienceItem = useCallback((index: number) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.experience) {
          const updatedExperience = [...studentProfile.experience];
          updatedExperience.splice(index, 1);
          return { ...studentProfile, experience: updatedExperience } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  const handleUpdateExperienceItem = useCallback((index: number, field: keyof Experience, value: string | string[]) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.experience && studentProfile.experience[index]) {
          const updatedExperience = [...studentProfile.experience];
          // Simplified update: skills_used logic removed as it's not in Experience type
          updatedExperience[index] = { ...updatedExperience[index], [field]: value as string }; // Ensure value is string if Experience fields are strings
          return { ...studentProfile, experience: updatedExperience } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  const handleProfileUpdate = async () => {
    if (!profileData || !user) return;
    setSavingProfile(true);

    let avatarFile: File | undefined = undefined;

    // Adjusted instanceof File check
    if (profileData.avatar && typeof profileData.avatar !== 'string' && (profileData.avatar as any) instanceof File) {
        avatarFile = profileData.avatar;
    }

    const changedData: Partial<AnyFullProfile> = {};
    // If avatarFile is set, use originalProfileData.avatar for comparison to avoid issues with File object stringification
    const profileDataForComparison = avatarFile ? { ...profileData, avatar: originalProfileData?.avatar } : { ...profileData };

    for (const key in profileDataForComparison) {
        if (Object.prototype.hasOwnProperty.call(profileDataForComparison, key)) {
            const typedKey = key as keyof AnyFullProfile;
            if (JSON.stringify(profileDataForComparison[typedKey]) !== JSON.stringify(originalProfileData?.[typedKey])) {
                (changedData as any)[typedKey] = profileDataForComparison[typedKey];
            }
        }
    }
    
    // Special handling for array fields from input values for specific roles (skills, achievements, etc.)
    if (user.role === USER_ROLES.STUDENT) {
        const studentProfile = profileData as StudentProfile;
        const initialStudentProfile = originalProfileData as StudentProfile | null;
        if (skillsInputValue !== (initialStudentProfile?.skills?.join(", ") || "")) {
            (changedData as Partial<StudentProfile>).skills = skillsInputValue.split(',').map(s => s.trim()).filter(s => s !== '');
        }
        if (achievementsInputValue !== (initialStudentProfile?.achievements?.join("\n") || "")) {
            (changedData as Partial<StudentProfile>).achievements = achievementsInputValue.split('\n').map(s => s.trim()).filter(s => s !== '');
        }
    } else if (user.role === USER_ROLES.EMPLOYER) {
        const employerProfile = profileData as EmployerProfile;
        const initialEmployerProfile = originalProfileData as EmployerProfile | null;
        if (companySkillsInputValue !== (initialEmployerProfile?.company_skills_tags?.join(", ") || "")) {
            (changedData as Partial<EmployerProfile>).company_skills_tags = companySkillsInputValue.split(',').map(s => s.trim()).filter(s => s !== '');
        }
    } else if (user.role === USER_ROLES.CAMPUS) {
        const campusProfile = profileData as CampusProfile;
        const initialCampusProfile = originalProfileData as CampusProfile | null;
        if (programsOfferedInputValue !== (initialCampusProfile?.programs_offered?.map(p => typeof p === 'string' ? p : (p as {name: string}).name).join("\n") || "")) {
            (changedData as Partial<CampusProfile>).programs_offered = programsOfferedInputValue.split('\n').map(s => s.trim()).filter(s => s !== '');
        }
    }

    // Ensure education and experience are arrays if they were stringified in changedData
    if (user.role === USER_ROLES.STUDENT) {
        const studentChangedData = changedData as Partial<StudentProfile>;
        if (studentChangedData.education && typeof studentChangedData.education === 'string') {
            try {
                const parsedEducation = JSON.parse(studentChangedData.education as string);
                if (Array.isArray(parsedEducation)) {
                    studentChangedData.education = parsedEducation;
                }
            } catch (e) {
                console.error("Could not parse education string from changedData:", studentChangedData.education, e);
                toast.error("Education data is malformed. Please re-enter or refresh.");
                // Optionally, delete the malformed field to prevent sending bad data
                // delete studentChangedData.education;
                setSavingProfile(false);
                return; // Prevent saving if crucial data is malformed
            }
        }
        if (studentChangedData.experience && typeof studentChangedData.experience === 'string') {
            try {
                const parsedExperience = JSON.parse(studentChangedData.experience as string);
                if (Array.isArray(parsedExperience)) {
                    studentChangedData.experience = parsedExperience;
                }
            } catch (e) {
                console.error("Could not parse experience string from changedData:", studentChangedData.experience, e);
                toast.error("Experience data is malformed. Please re-enter or refresh.");
                // delete studentChangedData.experience;
                setSavingProfile(false);
                return; // Prevent saving if crucial data is malformed
            }
        }
    }

    // For students, if skills or achievements are being sent, ensure they are flat arrays from InputValues
    if (user.role === USER_ROLES.STUDENT) {
        const studentPayload = changedData as Partial<StudentProfile>; // Use a more specific type for clarity if it's known to be StudentProfile data

        // If 'skills' is a property in changedData, it means it was detected as changed.
        // Rebuild it from skillsInputValue to ensure it's flat.
        if (studentPayload.hasOwnProperty('skills')) {
            studentPayload.skills = skillsInputValue.split(',').map(s => s.trim()).filter(s => s !== '');
        }

        // If 'achievements' is a property in changedData, rebuild it from achievementsInputValue.
        if (studentPayload.hasOwnProperty('achievements')) {
             studentPayload.achievements = achievementsInputValue.split('\n').map(s => s.trim()).filter(s => s !== '');
        }
    }

    delete (changedData as any).role; 
    delete (changedData as any).email;
    
    const payload: any = { ...changedData };

    if (avatarFile) {
        // If a new avatar File is present, it takes precedence.
        payload.avatar = avatarFile;
    } else {
        // No new avatar file. If changedData.avatar (URL) hasn't actually changed from original, remove it from payload.
        if (payload.avatar === originalProfileData?.avatar) {
            delete payload.avatar;
        }
    }


    if (Object.keys(payload).length === 0) { // Check final payload for changes
      toast.info("No changes to save.");
      setSavingProfile(false);
      return;
    }

    console.log("Payload to send to API:", JSON.stringify(payload, null, 2)); // Added for debugging

    try {
      // Pass a single payload object to updateProfile
      const response = await userApi.updateProfile(payload as AnyFullProfile); 
      
      if (response.status === "success" && response.data) {
        setProfileData(response.data); // Update with response which should include new avatar URL
        setOriginalProfileData(response.data);
        toast.success("Profile updated successfully!");
        if (refreshUserInfo) await refreshUserInfo();

        if (user.role === USER_ROLES.STUDENT) {
          const studentProfile = response.data as StudentProfile;
          setSkillsInputValue(studentProfile.skills?.join(", ") || "");
          setAchievementsInputValue(studentProfile.achievements?.join("\n") || "");
          // Recalculate completion with potentially updated profile data
          const { percentage, missing } = calculateProfileCompletion(studentProfile, user.role);
          setProfileCompletion(percentage);
          setMissingFields(missing);
        } else if (user.role === USER_ROLES.EMPLOYER) {
          const employerProfile = response.data as EmployerProfile;
          setCompanySkillsInputValue(employerProfile.company_skills_tags?.join(", ") || "");
        } else if (user.role === USER_ROLES.CAMPUS) {
          const campusProfile = response.data as CampusProfile;
          setProgramsOfferedInputValue(campusProfile.programs_offered?.join("\n") || "");
        }

      } else {
        toast.error(response.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingProfile || !user) { // Removed authLoading from condition
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
      </div>
    );
  }

  if (!user || !profileData) {
    return <div className="text-center py-10">Could not load profile data. Please try refreshing.</div>;
  }
  
  return (
    <ProtectedRoute roles={[USER_ROLES.STUDENT, USER_ROLES.EMPLOYER, USER_ROLES.CAMPUS, USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            {`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile`}
          </h1>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple"></div>
                <CardContent className="-mt-16 relative flex flex-col items-center">
                  {user.role !== USER_ROLES.ADMIN ? (
                    <AvatarUpload
                      currentAvatar={profileData.avatar}
                      onAvatarChange={(newAvatarUrl) => {
                        setProfileData(prev => prev ? { ...prev, avatar: newAvatarUrl } as AnyFullProfile : null);
                        setOriginalProfileData(prev => prev ? { ...prev, avatar: newAvatarUrl } as AnyFullProfile : null);
                      }}
                      role={user.role as UserRole}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                      <Shield className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <h2 className="mt-4 text-2xl font-bold text-center">
                    {profileData.name || (profileData as EmployerProfile).company_name || "User Profile"} 
                  </h2>
                  <p className="text-muted-foreground text-center">{user.role}</p>
                </CardContent>
              </Card>
              
              {/* Статистика в зависимости от роли */}
              {user.role === USER_ROLES.STUDENT && profileData && (
                <StudentStatsCard profileData={profileData as StudentProfile} />
              )}
              {user.role === USER_ROLES.EMPLOYER && <EmployerStatsCard profileData={profileData as EmployerProfile} />}
              {user.role === USER_ROLES.CAMPUS && <CampusStatsCard profileData={profileData as CampusProfile} />}
              {user.role === USER_ROLES.ADMIN && <AdminStatsCard profileData={profileData as AdminProfile} />}
              
              {/* TODO: Для студента здесь может быть секция с резюме */}
            </div>

            <div className="md:col-span-2 space-y-6">
              {/* Общая информация и описание - УДАЛЕНО ОТСЮДА 
              <BasicInfoCard 
                profileData={profileData} 
                onInputChange={handleInputChange} 
                userRole={user.role as UserRole}
                commonFieldsConfig={commonFieldsConfiguration}
              />
              <Card>
                <CardHeader><CardTitle>Description / Bio</CardTitle></CardHeader>
                <CardContent>
                    <Textarea
                        value={profileData?.description || ""} 
                        onChange={(e) => handleInputChange('description', e.target.value)} 
                        className="min-h-[120px]"
                        placeholder="Tell us about yourself or your organization"
                    />
                </CardContent>
              </Card>
              */}

              {/* Секции, специфичные для роли */}
              {user.role === USER_ROLES.STUDENT && (
                <StudentSections 
                    profileData={profileData as StudentProfile} 
                    onSkillsChange={handleStudentSkillsChange}
                    onAchievementsChange={handleStudentAchievementsChange}
                    skillsInputValue={skillsInputValue}
                    achievementsInputValue={achievementsInputValue}
                    onInputChange={handleInputChange}
                    commonFieldsConfig={commonFieldsConfig.filter(f => !f.role || f.role === USER_ROLES.STUDENT)}
                    onAddEducation={handleAddEducationItem}
                    onRemoveEducation={handleRemoveEducationItem}
                    onUpdateEducation={handleUpdateEducationItem}
                    onAddExperience={handleAddExperienceItem}
                    onRemoveExperience={handleRemoveExperienceItem}
                    onUpdateExperience={handleUpdateExperienceItem}
                    resumes={(profileData as any).resumes || []}
                    loadingResumes={loadingProfile}
                    deletingResume={deletingResume}
                    onDeleteResume={handleDeleteResume}
                    onResumeUploadComplete={handleResumeUploadComplete}
                    onShowResume={handleShowResume}
                    showingResumeId={showingResumeId}
                />
              )}
              {user.role === USER_ROLES.EMPLOYER && 
                <EmployerSections 
                  profileData={profileData as EmployerProfile} 
                  onInputChange={handleInputChange} 
                  commonFieldsConfig={commonFieldsConfig.filter(cf => !cf.role || cf.role === USER_ROLES.EMPLOYER)}
                  companySkillsInputValue={companySkillsInputValue}
                  onCompanySkillsChange={handleEmployerSkillsChange}
                />}
              {user.role === USER_ROLES.CAMPUS && 
                <CampusSections 
                  profileData={profileData as CampusProfile} 
                  onInputChange={handleInputChange}
                  commonFieldsConfig={commonFieldsConfig.filter(cf => !cf.role || cf.role === USER_ROLES.CAMPUS)}
                  programsOfferedInputValue={programsOfferedInputValue}
                  onProgramsOfferedChange={handleCampusProgramsChange}
                />}
              {user.role === USER_ROLES.ADMIN && 
                <AdminSections 
                  profileData={profileData as AdminProfile} 
                  onInputChange={handleInputChange}
                  commonFieldsConfig={commonFieldsConfig.filter(cf => !cf.role || cf.role === USER_ROLES.ADMIN)}
                />}
              
              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProfileUpdate}
                  disabled={savingProfile}
                  className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue"
                  title={user.role === USER_ROLES.STUDENT && profileCompletion < 70 ? "Profile must be at least 70% complete to save changes that might affect applications." : undefined}
                >
                  {savingProfile ? (
                    <> <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving... </>
                  ) : (
                    <> <CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 