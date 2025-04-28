import { applicationsApi } from './applications'
import { authApi } from './auth'
import { campusApi } from './campus'
import { careerQuestApi } from './career-quest'
import apiClient from './client'
import { companiesApi } from './companies'
import { jobApi } from './jobs'
import { notificationApi } from './notifications'
import { resourcesApi } from './resources'
import { resumeApi } from './resume'
import { statsApi } from './stats'
import { userApi } from './user'
import { adminUsersApi } from './admin-users'
import { achievementsApi } from './achievements'
import { gamificationApi } from './gamification'
import { employerApi } from './employer'
import { mockService } from './mock-service'
import axios from 'axios'
import { 
  User, 
  Job, 
  Company, 
  Application, 
  ModerationLog, 
  AdminNotification, 
  AdminDashboardStats 
} from '@/lib/types'
import { API_URL } from '../utils/config'

export {
  applicationsApi,
  authApi,
  campusApi,
  careerQuestApi,
  apiClient,
  companiesApi,
  jobApi,
  notificationApi,
  resourcesApi,
  resumeApi,
  statsApi,
  userApi,
  adminUsersApi,
  achievementsApi,
  gamificationApi,
  employerApi,
  mockService
}

// Экспорт всех API-сервисов
export * from './jobs';

// Экспорт API для работы с компаниями (если существует)
export * from './companies';

// Экспорт API для работы с ресурсами (если существует)
export * from './resources';

// Админские API
const ADMIN_API_PATH = `${API_URL}/admin`;

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  ordering?: string;
  [key: string]: any; // Для дополнительных фильтров
}

export const adminApi = {
  // ПОЛЬЗОВАТЕЛИ
  
  // Получение списка пользователей
  getUsers: async (params?: AdminQueryParams) => {
    try {
      const response = await axios.get(`${ADMIN_API_PATH}/users/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Получение отдельного пользователя
  getUser: async (id: string) => {
    try {
      const response = await axios.get(`${ADMIN_API_PATH}/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Изменение статуса пользователя (активен/заблокирован)
  toggleUserActive: async (id: string) => {
    try {
      const response = await axios.post(`${ADMIN_API_PATH}/users/${id}/toggle_active/`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling user status ${id}:`, error);
      throw error;
    }
  },

  // ВАКАНСИИ
  getJobs: async (params?: AdminQueryParams) => {
    try {
      const response = await axios.get(`${ADMIN_API_PATH}/jobs/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // СТАТИСТИКА
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${ADMIN_API_PATH}/dashboard/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 