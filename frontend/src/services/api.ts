import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const meetingsApi = {
  getMeetings: async () => {
    const response = await api.get('/meetings');
    return response.data;
  },

  getHighPriorityEmails: async () => {
    const response = await api.get('/emails', {
      params: { urgency: 'High' }
    });
    return response.data;
  },

  syncEmails: async () => {
    const response = await api.post('/analyze-new-emails');
    return response.data;
  },

  resetProcessingStatus: async () => {
    const response = await api.post('/reset-processing-status');
    return response.data;
  }
};

export const companiesApi = {
  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  createCompany: async (companyData: any) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  }
};

export const tasksApi = {
  getTasks: async (companyId: string, date: string) => {
    const response = await api.get('/tasks', {
      params: { companyId, date }
    });
    return response.data;
  },

  createTask: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTaskStatus: async (taskId: string, updateData: any) => {
    const response = await api.post(`/tasks/${taskId}/updates`, updateData);
    return response.data;
  }
}; 