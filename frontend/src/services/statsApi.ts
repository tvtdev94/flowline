import axios from 'axios';
import { DailyStats } from '../types/stats';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const statsApi = {
  getDailyStats: async (userId: string, date: Date): Promise<DailyStats> => {
    const params = new URLSearchParams({
      userId,
      date: date.toISOString(),
    });

    const response = await api.get(`/api/stats/daily?${params.toString()}`);
    return response.data;
  },
};

export default statsApi;
