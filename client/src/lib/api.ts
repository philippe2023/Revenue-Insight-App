import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Hotel API functions
export const hotelApi = {
  getAll: () => fetch('/api/hotels', { credentials: 'include' }).then(res => res.json()),
  getById: (id: string) => fetch(`/api/hotels/${id}`, { credentials: 'include' }).then(res => res.json()),
  create: async (data: any) => {
    const response = await apiRequest('POST', '/api/hotels', data);
    queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest('PUT', `/api/hotels/${id}`, data);
    queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    queryClient.invalidateQueries({ queryKey: ['/api/hotels', id] });
    return response.json();
  },
  delete: async (id: string) => {
    await apiRequest('DELETE', `/api/hotels/${id}`);
    queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
  }
};

// Event API functions
export const eventApi = {
  getAll: () => fetch('/api/events', { credentials: 'include' }).then(res => res.json()),
  getUpcoming: (limit?: number) => 
    fetch(`/api/events/upcoming${limit ? `?limit=${limit}` : ''}`, { credentials: 'include' }).then(res => res.json()),
  search: (city: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ city });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetch(`/api/events/search?${params}`, { credentials: 'include' }).then(res => res.json());
  },
  create: async (data: any) => {
    const response = await apiRequest('POST', '/api/events', data);
    queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    return response.json();
  }
};

// Forecast API functions
export const forecastApi = {
  getAll: (hotelId?: string) => 
    fetch(`/api/forecasts${hotelId ? `?hotelId=${hotelId}` : ''}`, { credentials: 'include' }).then(res => res.json()),
  getByDateRange: (hotelId: string, startDate: string, endDate: string) =>
    fetch(`/api/forecasts/date-range?hotelId=${hotelId}&startDate=${startDate}&endDate=${endDate}`, { credentials: 'include' }).then(res => res.json()),
  create: async (data: any) => {
    const response = await apiRequest('POST', '/api/forecasts', data);
    queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
    return response.json();
  }
};

// Task API functions
export const taskApi = {
  getAll: (hotelId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (hotelId) params.append('hotelId', hotelId);
    if (status) params.append('status', status);
    return fetch(`/api/tasks?${params}`, { credentials: 'include' }).then(res => res.json());
  },
  getUpcoming: (limit?: number) =>
    fetch(`/api/tasks/upcoming${limit ? `?limit=${limit}` : ''}`, { credentials: 'include' }).then(res => res.json()),
  create: async (data: any) => {
    const response = await apiRequest('POST', '/api/tasks', data);
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest('PUT', `/api/tasks/${id}`, data);
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    return response.json();
  }
};

// Comment API functions
export const commentApi = {
  getAll: (entityType: string, entityId: string) =>
    fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`, { credentials: 'include' }).then(res => res.json()),
  create: async (data: any) => {
    const response = await apiRequest('POST', '/api/comments', data);
    queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
    return response.json();
  }
};

// Hotel Actuals API functions
export const actualApi = {
  getByHotel: (hotelId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetch(`/api/hotel-actuals/${hotelId}?${params}`, { credentials: 'include' }).then(res => res.json());
  },
  upload: async (actuals: any[]) => {
    const response = await apiRequest('POST', '/api/hotel-actuals', { actuals });
    queryClient.invalidateQueries({ queryKey: ['/api/hotel-actuals'] });
    return response.json();
  },
  getKPIs: (hotelId: string) =>
    fetch(`/api/hotel-actuals/${hotelId}/kpis`, { credentials: 'include' }).then(res => res.json())
};

// AI Chat API functions
export const aiApi = {
  chat: async (message: string) => {
    const response = await apiRequest('POST', '/api/ai-chat', { message });
    return response.json();
  }
};
