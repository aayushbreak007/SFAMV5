import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthService } from '../auth/auth-service';

// Base API URL
const API_BASE_URL = 'https://apim-sfam-core.azure-api.net/sfam/v1';

// Type definitions for API requests and responses
export interface TenantData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  enableVisitorRegistration?: boolean;
  enableEmployeeAccess?: boolean;
  enableNotifications?: boolean;
}

export interface VisitorData {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  purpose: string;
  hostId: string;
  visitDate: string;
  expectedArrival: string;
  expectedDeparture?: string;
}

export interface EmployeeData {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  title?: string;
  accessLevel: string;
  startDate?: string;
  endDate?: string;
}

export interface CheckInData {
  checkInTime: string;
  notes?: string;
  temperature?: number;
  method?: 'manual' | 'qr_code' | 'face_recognition';
}

export interface CheckOutData {
  checkOutTime: string;
  notes?: string;
}

export interface QueryParams {
  tenantId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  departmentId?: string;
  page?: number;
  pageSize?: number;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  [key: string]: string | number | undefined;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AuthService.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic API response handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login
      AuthService.logout();
    }
    return Promise.reject(error);
  }
);

// API Service class for all API calls
export class ApiService {
  // Tenants
  static async createTenant(tenantData: TenantData): Promise<AxiosResponse> {
    return apiClient.post('/tenants', tenantData);
  }

  static async getTenantById(tenantId: string): Promise<AxiosResponse> {
    return apiClient.get(`/tenants/${tenantId}`);
  }

  static async updateTenant(tenantId: string, tenantData: TenantData): Promise<AxiosResponse> {
    return apiClient.put(`/tenants/${tenantId}`, tenantData);
  }

  static async getAllTenants(): Promise<AxiosResponse> {
    return apiClient.get('/tenants');
  }

  // Visitors
  static async registerVisitor(visitorData: VisitorData): Promise<AxiosResponse> {
    return apiClient.post('/visitors', visitorData);
  }

  static async getVisitors(params?: QueryParams): Promise<AxiosResponse> {
    return apiClient.get('/visitors', { params });
  }

  static async getVisitorById(visitorId: string): Promise<AxiosResponse> {
    return apiClient.get(`/visitors/${visitorId}`);
  }

  static async checkInVisitor(visitorId: string, checkInData: CheckInData): Promise<AxiosResponse> {
    return apiClient.post(`/visitors/${visitorId}/check-in`, checkInData);
  }

  static async checkInVisitorByQRCode(qrCodeData: string, checkInData: CheckInData): Promise<AxiosResponse> {
    return apiClient.post('/visitors/check-in/qrcode', { 
      qrCodeData,
      ...checkInData,
      method: 'qr_code' 
    });
  }

  static async checkInVisitorByFaceRecognition(faceImageBase64: string, checkInData: CheckInData): Promise<AxiosResponse> {
    return apiClient.post('/visitors/check-in/face-recognition', { 
      faceImageBase64,
      ...checkInData,
      method: 'face_recognition' 
    });
  }

  static async findVisitorByEmail(email: string): Promise<AxiosResponse> {
    return apiClient.get(`/visitors/lookup?email=${encodeURIComponent(email)}`);
  }

  static async checkOutVisitor(visitorId: string, checkOutData?: CheckOutData): Promise<AxiosResponse> {
    return apiClient.post(`/visitors/${visitorId}/check-out`, checkOutData);
  }

  // Employees
  static async getEmployees(params?: QueryParams): Promise<AxiosResponse> {
    return apiClient.get('/employees', { params });
  }

  static async createEmployee(employeeData: EmployeeData): Promise<AxiosResponse> {
    return apiClient.post('/employees', employeeData);
  }

  static async updateEmployee(employeeId: string, employeeData: EmployeeData): Promise<AxiosResponse> {
    return apiClient.put(`/employees/${employeeId}`, employeeData);
  }

  static async getEmployeeById(employeeId: string): Promise<AxiosResponse> {
    return apiClient.get(`/employees/${employeeId}`);
  }

  // Analytics
  static async getDashboardStats(tenantId: string): Promise<AxiosResponse> {
    return apiClient.get(`/analytics/dashboard?tenantId=${tenantId}`);
  }

  static async getVisitorStats(tenantId: string, timeRange: string): Promise<AxiosResponse> {
    return apiClient.get(`/analytics/visitors?tenantId=${tenantId}&timeRange=${timeRange}`);
  }

  static async getEmployeeStats(tenantId: string, timeRange: string): Promise<AxiosResponse> {
    return apiClient.get(`/analytics/employees?tenantId=${tenantId}&timeRange=${timeRange}`);
  }

  // Generic request method
  static async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return apiClient(config);
  }
}