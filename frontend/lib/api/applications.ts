import axios from 'axios';
import apiClient from './client';
import { Application } from '@/lib/types';
import type { ApiResponse } from "./client";
import { toast } from "sonner";

export interface ApplicationsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  job?: string;
  ordering?: string;
}

// Define the structure of the paginated response for getApplications
interface ApplicationsResponsePayload {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
}

export const applicationsApi = {
  // Получение списка заявок с возможностью фильтрации
  getApplications: async (params?: ApplicationsQueryParams): Promise<ApiResponse<ApplicationsResponsePayload>> => {
    try {
      const response = await apiClient.get('/application/', { params });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to retrieve applications";
      toast.error(errorMessage);
      // Return a structure consistent with ApiResponse type
      return {
        status: "error",
        message: errorMessage,
        data: { count: 0, next: null, previous: null, results: [] }, // Ensure data is not undefined
      };
    }
  },

  // Получение отдельной заявки по ID
  getApplication: async (id: string) => {
    try {
      const response = await apiClient.get(`/application/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  },

  // Создание новой заявки
  createApplication: async (applicationData: Partial<Application>) => {
    try {
      const response = await apiClient.post('/application/', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  // Обновление существующей заявки
  updateApplication: async (id: string, applicationData: Partial<Application>) => {
    try {
      const response = await apiClient.put(`/application/${id}/`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating application ${id}:`, error);
      throw error;
    }
  },

  // Удаление заявки
  deleteApplication: async (id: string) => {
    try {
      const response = await apiClient.delete(`/application/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      throw error;
    }
  },

  // Обновление статуса заявки
  updateApplicationStatus: async (
    applicationId: string | number,
    newStatus: string,
    notes?: string 
  ): Promise<ApiResponse<Application>> => {
    try {
      const payload: { status: string; notes?: string } = { status: newStatus };
      if (notes) {
        payload.notes = notes;
      }
      // The endpoint is /application/{id}/update_status/
      const response = await apiClient.post<ApiResponse<Application>>(
        `/application/${applicationId}/update_status/`,
        payload
      );
      toast.success(response.data.message || "Application status updated successfully!");
      return response.data;
    } catch (error: any) {
      let errorMessage = "Failed to update application status.";
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        errorMessage = responseData?.message || responseData?.error?.details?.detail || errorMessage;
      }
      toast.error(errorMessage);
      return {
        status: "error",
        message: errorMessage,
        data: null as any, // Or a more specific error payload
      };
    }
  },

  // Назначение собеседования
  scheduleInterview: async (id: string, interview_date: string, notes?: string) => {
    try {
      const response = await apiClient.post(`/application/${id}/schedule_interview/`, { interview_date, notes });
      return response.data;
    } catch (error) {
      console.error(`Error scheduling interview for application ${id}:`, error);
      throw error;
    }
  },

  // Получение заявок на конкретную вакансию
  getApplicationsByJob: async (jobId: string, status?: string) => {
    try {
      const params = { job_id: jobId };
      if (status) {
        Object.assign(params, { status });
      }
      const response = await apiClient.get(`/application/by-job/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching applications for job ${jobId}:`, error);
      throw error;
    }
  },

  // Получение заявок текущего соискателя
  getMyApplications: async (status?: string) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(`/application/my/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my applications:', error);
      throw error;
    }
  },

  // Получение заявок для работодателя
  getEmployerApplications: async (params?: ApplicationsQueryParams) => {
    try {
      const response = await apiClient.get(`/application/employer/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employer applications:', error);
      throw error;
    }
  },

  // Получение статистики по заявкам
  getApplicationStats: async () => {
    try {
      const response = await apiClient.get(`/application/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },

  // Function specifically for cancelling an application by a student
  cancelApplication: async (applicationId: string | number): Promise<ApiResponse<Application | null>> => {
    try {
      const response = await apiClient.post<ApiResponse<Application>>(
        `/application/${applicationId}/update_status/`,
        { status: "canceled" } // Send status directly for cancellation
      );
      
      if (response.data.status === 'success') {
        toast.success(response.data.message || "Application cancelled successfully!");
      } else {
        // Handle cases where API returns 2xx but indicates logical error in response body
        toast.error(response.data.message || "Failed to cancel application.");
      }
      return response.data;
    } catch (error: any) {
      let errorMessage = "Failed to cancel application.";
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        // Backend might send specific error messages for 403 (e.g., student trying to change to non-canceled status)
        errorMessage = responseData?.message || responseData?.error?.details?.detail || errorMessage;
      }
      toast.error(errorMessage);
      return {
        status: "error",
        message: errorMessage,
        data: null,
      };
    }
  },
};
