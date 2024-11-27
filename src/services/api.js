 // services/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = {
  // Vehicle APIs
  vehicles: {
    async getAll(userId) {
      const res = await axios.get(`${API_URL}/vehicles?userId=${userId}`);
      return res.data;
    },

    async getById(id) {
      const res = await axios.get(`${API_URL}/vehicles/${id}`);
      return res.data;
    },

    async create(vehicleData) {
      const res = await axios.post(`${API_URL}/vehicles`, vehicleData);
      return res.data;
    },

    async update(id, data) {
      const res = await axios.put(`${API_URL}/vehicles/${id}`, data);
      return res.data;
    }
  },

  // CarWash APIs
  carWash: {
    async getHistory(vehicleId) {
      const res = await axios.get(`${API_URL}/carwash/${vehicleId}`);
      return res.data;
    },

    async addWash(data) {
      const res = await axios.post(`${API_URL}/carwash`, data);
      return res.data;
    },

    async getReminders(vehicleId) {
      const res = await axios.get(`${API_URL}/carwash/reminders/${vehicleId}`);
      return res.data;
    }
  },

  // FasTag APIs
  fasTag: {
    async getBalance(vehicleId) {
      const res = await axios.get(`${API_URL}/fastag/${vehicleId}/balance`);
      return res.data;
    },

    async addTransaction(data) {
      const res = await axios.post(`${API_URL}/fastag/transaction`, data);
      return res.data;
    },

    async getTransactions(vehicleId, params = {}) {
      const res = await axios.get(`${API_URL}/fastag/${vehicleId}/transactions`, { params });
      return res.data;
    },

    async updateBalance(vehicleId, amount) {
      const res = await axios.post(`${API_URL}/fastag/${vehicleId}/recharge`, { amount });
      return res.data;
    }
  },

  // Maintenance APIs
  maintenance: {
    async getHistory(vehicleId) {
      const res = await axios.get(`${API_URL}/maintenance/${vehicleId}`);
      return res.data;
    },

    async addService(data) {
      const res = await axios.post(`${API_URL}/maintenance/service`, data);
      return res.data;
    },

    async addRepair(data) {
      const res = await axios.post(`${API_URL}/maintenance/repair`, data);
      return res.data;
    },

    async updateMetrics(vehicleId, metrics) {
      const res = await axios.put(`${API_URL}/maintenance/${vehicleId}/metrics`, metrics);
      return res.data;
    }
  }
};

// Error handling middleware
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error?.response?.data || error);
  }
);

export default api;
