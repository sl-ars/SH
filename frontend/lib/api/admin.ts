import axios from 'axios';
import apiClient from './client';
import { 
  User, 
  Job, 
  Company, 
  Application, 
  ModerationLog, 
  AdminNotification, 
  AdminDashboardStats
} from '@/lib/types';
import { API_URL } from '../utils/config';

const API_PATH = `/admin`;

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  ordering?: string;
  [key: string]: any; 
}

export interface CreateUserData {
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  password: string;
  role: string;
  university?: string;
  company?: string;
  company_id?: string;
  sendWelcomeEmail?: boolean;
  activateImmediately?: boolean;
}

export const adminApi = {
  getUsers: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/users/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await apiClient.delete(`${API_PATH}/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  updateUser: async (id: string, userData: any) => {
    try {
      console.log("Starting user update for ID:", id);
      console.log("Raw update data received:", userData);
      
      const dataToSend = { ...userData };
      
      if (userData.first_name !== undefined || userData.last_name !== undefined) {
        dataToSend.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        console.log("Generated name field:", dataToSend.name);
      }
      
      delete dataToSend.first_name;
      delete dataToSend.last_name;
      
      console.log("Final data to be sent to API:", dataToSend);
      
      const response = await apiClient.patch(`${API_PATH}/users/${id}/`, dataToSend);
      console.log("Update response status:", response.status);
      console.log("Update response data:", response.data);
      
      return {
        status: 'success',
        message: 'User updated successfully',
        data: response.data.data || response.data
      };
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      console.error('Error response:', error.response?.data);
      
      return {
        status: 'error',
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to update user',
        data: null
      };
    }
  },

  createUser: async (userData: CreateUserData) => {
    try {
      console.log("Admin API: Creating user with data:", userData);
      
      if ((userData.first_name || userData.last_name) && !userData.name) {
        userData.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      }
    
      const cleanedData: Omit<CreateUserData, 'first_name' | 'last_name'> = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        university: userData.university,
        company: userData.company,
        company_id: userData.company_id,
        sendWelcomeEmail: userData.sendWelcomeEmail,
        activateImmediately: userData.activateImmediately
      };
      
      console.log("Sending cleaned user data to API:", cleanedData);
      
      const response = await apiClient.post(`${API_PATH}/users/`, cleanedData);
      console.log("User creation response:", response.data);
      
      return {
        status: 'success',
        message: 'User created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to create user',
        data: null
      };
    }
  },

  bulkCreateUsers: async (file: File) => {
    try {
      console.log("Attempting to bulk create users with file:", file);
      if (!(file instanceof File)) {
        console.error("bulkCreateUsers was called with an invalid file object:", file);
        return {
          status: 'error',
          message: 'Invalid file object provided.',
          data: { success_count: 0, failed_count: 0, details: [] }
        };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`${API_PATH}/users/bulk/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      const backendPayload = response.data;
      const countsAndDetails = backendPayload.data; 

      return {
        status: backendPayload.status || 'success',
        message: backendPayload.message || 'Users processed successfully',
        data: { 
          success_count: countsAndDetails?.success_count || 0,
          failed_count: countsAndDetails?.failed_count || 0,
          details: countsAndDetails?.details || []
        }
      };
    } catch (error: any) {
      console.error('Error bulk creating users:', error);
      const backendMessage = error.response?.data?.message || 
                             (error.response?.data?.details && typeof error.response.data.details === 'string' 
                                ? error.response.data.details 
                                : 'Failed to process file');

      const errorDetails = error.response?.data?.data?.details || error.response?.data?.details || [];
      return {
        status: 'error',
        message: backendMessage,
        data: {
          success_count: 0,
          failed_count: 0, 
          details: errorDetails
        }
      };
    }
  },

  toggleUserActive: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/users/${id}/toggle_active/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling user status ${id}:`, error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/users/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  getJobs: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/jobs/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getJob: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  toggleJobActive: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/jobs/${id}/toggle_active/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling job status ${id}:`, error);
      throw error;
    }
  },

  toggleJobFeatured: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/jobs/${id}/feature/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling job featured status ${id}:`, error);
      throw error;
    }
  },

  getCompanies: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/companies/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  getCompany: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },
  
  getCompanyById: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  createCompany: async (companyData: any) => {
    try {
      console.log("Creating company with data:", companyData);
      const response = await apiClient.post(`${API_PATH}/companies/`, companyData);
      return {
        status: 'success',
        message: 'Company created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating company:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to create company',
        data: null
      };
    }
  },

  deleteCompany: async (id: string) => {
    try {
      const response = await apiClient.delete(`${API_PATH}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  },

  updateCompany: async (id: string, companyData: any) => {
    try {
      const response = await apiClient.patch(`${API_PATH}/companies/${id}/`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  verifyCompany: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/companies/${id}/verify/`);
      return response.data;
    } catch (error) {
      console.error(`Error verifying company ${id}:`, error);
      throw error;
    }
  },

  toggleCompanyFeatured: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/companies/${id}/feature/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling company featured status ${id}:`, error);
      throw error;
    }
  },

  getApplications: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/applications/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  getApplication: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_PATH}/applications/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  },

  getModerationLogs: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/moderation-logs/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      throw error;
    }
  },

  getNotifications: async (params?: AdminQueryParams) => {
    try {
      const response = await apiClient.get(`${API_PATH}/notifications/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      const response = await apiClient.post(`${API_PATH}/notifications/${id}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await apiClient.post(`${API_PATH}/notifications/mark_all_as_read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/dashboard/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getDashboardSettings: async () => {
    try {
      const response = await apiClient.get(`${API_PATH}/dashboard-settings/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      throw error;
    }
  },

  updateDashboardSettings: async (settings: any) => {
    try {
      const response = await apiClient.put(`${API_PATH}/dashboard-settings/`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      throw error;
    }
  },

  updateUserName: async (id: string, firstName: string, lastName: string) => {
    try {
      const nameData = {
        name: `${firstName} ${lastName}`.trim()
      };
      
      console.log(`Direct name update for user ${id}:`, nameData);
      
      const response = await apiClient.patch(`${API_PATH}/users/${id}/`, nameData);
      console.log("Name update response:", response.data);
    
      try {
        const updatedUser = await apiClient.get(`${API_PATH}/users/${id}/`);
        console.log("User data after name update:", updatedUser.data);
      } catch (e) {
        console.warn("Could not fetch user after name update:", e);
      }
      
      return {
        status: 'success',
        message: 'User name updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error(`Error updating user name ${id}:`, error);
      console.error('Error response:', error.response?.data);
      
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to update user name',
        data: null
      };
    }
  },

  getAnalytics: async (params?: { period?: string; year?: number }) => {
    try {
      const response = await apiClient.get(`${API_PATH}/analytics/`, { params });
      return {
        status: 'success',
        data: response.data,
        message: 'Analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        status: 'error',
        message: 'Failed to fetch analytics data',
        data: null
      };
    }
  },

  getSettings: async () => {
    try {
      console.log("Calling settings API endpoint...");
      const response = await apiClient.get(`${API_PATH}/settings/`);
      console.log("Raw settings API response:", response);
      
      if (response && response.data) {
        return response.data;
      } else {
        console.error("Settings API returned unexpected format:", response);
        return {
          status: 'error',
          message: 'Settings API returned unexpected format',
          data: null
        };
      }
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch system settings',
        data: null
      };
    }
  },
  
  updateSettings: async (settings: any) => {
    try {
      const response = await apiClient.put(`${API_PATH}/settings/`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return {
        status: 'error',
        message: 'Failed to update system settings',
        data: null
      };
    }
  },
};
