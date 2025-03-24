import { driverApi, partnerApi } from './axios/instance';

interface Driver {
  partnerId: string;
  fullName: string;
  email: string;
  phone: string;
  status: boolean;
}

interface DashboardStats {
  todayDeliveries: number;
  todayEarnings: number;
  weeklyDeliveries: number;
  weeklyEarnings: number;
  weeklyDeliveryTrend: number;
  weeklyEarningTrend: number;
}

interface PerformanceMetrics {
  onTimeDelivery: number;
  customerSatisfaction: number;
  orderAcceptance: number;
  period: string;
}

interface ActiveDelivery {
  orderId: string;
  destination: string;
  eta: number;
  status: 'pending' | 'in_progress' | 'completed';
  customerName: string;
  customerPhone: string;
}

interface DriverProfile {
  fullName: string;
  rating: number;
  totalDeliveries: number;
  memberSince: string;
  profileImage?: string;
  isOnline: boolean;
  phone: string;
  email: string;
  address?: string;
}

export const driverService = {
  getAllDrivers: async () => {
    const response = await driverApi.get('/api/drivers');
    return response.data;
  },

  getDriverById: async (id: string) => {
    const response = await driverApi.get(`/api/drivers/${id}`);
    return response.data;
  },

  updateDriverStatus: async (id: string, status: boolean) => {
    const response = await driverApi.put(`/api/drivers/${id}/status`, { status });
    return response.data;
  },

  updateDriver: async (id: string, data: Partial<Driver>) => {
    const response = await driverApi.put(`/api/drivers/${id}`, data);
    return response.data;
  },

  deleteDriver: async (id: string) => {
    const response = await driverApi.delete(`/api/drivers/${id}`);
    return response.data;
  },

  verifyDocument: async (id: string, field: string) => {
    const response = await driverApi.put(`/api/drivers/${id}/verification`, {
      [field]: true
    });
    return response.data;
  },

  checkVerificationStatus: async (email: string) => {
    const response = await partnerApi.get(`/api/drivers/verify-doc?email=${email}`);
    return response.data;
  },

  getDashboardStats: async (driverId: string): Promise<DashboardStats> => {
    const response = await driverApi.get(`/api/drivers/${driverId}/dashboard-stats`);
    return response.data;
  },

  getPerformanceMetrics: async (driverId: string, period: string): Promise<PerformanceMetrics> => {
    const response = await driverApi.get(`/api/drivers/${driverId}/performance?period=${period}`);
    return response.data;
  },

  getActiveDelivery: async (driverId: string): Promise<ActiveDelivery | null> => {
    const response = await driverApi.get(`/api/drivers/${driverId}/active-delivery`);
    return response.data.delivery;
  },

  getDriverProfile: async (driverId: string): Promise<DriverProfile> => {
    const response = await driverApi.get(`/api/drivers/${driverId}/profile`);
    return response.data.profile;
  },

  updateOnlineStatus: async (driverId: string, isOnline: boolean): Promise<boolean> => {
    const response = await driverApi.put(`/api/drivers/${driverId}/status`, { isOnline });
    return response.data.success;
  },

  updateProfile: async (driverId: string, data: Partial<DriverProfile>): Promise<DriverProfile> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await driverApi.put(`/api/drivers/${driverId}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.profile;
  },
}; 