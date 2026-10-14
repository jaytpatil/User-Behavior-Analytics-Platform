import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Overview stats
export const fetchOverviewStats = async () => {
  const response = await apiClient.get('/stats/overview');
  return response.data;
};

// Sessions list
export const fetchSessions = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const response = await apiClient.get('/sessions', {
    params: { page, limit, search },
  });
  return response.data;
};

// Single session event history
export const fetchSessionEvents = async (sessionId, { page = 1, limit = 100 } = {}) => {
  const response = await apiClient.get(`/sessions/${sessionId}/events`, {
    params: { page, limit },
  });
  return response.data;
};

// Click heatmap coordinates for a page
export const fetchHeatmapData = async (pageUrl, limit = 2000) => {
  const response = await apiClient.get('/heatmap', {
    params: { url: pageUrl, limit },
  });
  return response.data;
};

// Distinct tracked pages
export const fetchDistinctPages = async () => {
  const response = await apiClient.get('/pages');
  return response.data;
};

// Health status
export const fetchHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Manually send an event
export const postEvent = async (eventData) => {
  const response = await apiClient.post('/events', eventData);
  return response.data;
};

export default apiClient;
