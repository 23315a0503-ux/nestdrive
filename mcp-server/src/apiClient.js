import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const USER_JWT_TOKEN = process.env.USER_JWT_TOKEN || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${USER_JWT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      throw new Error('Authentication failed. Please update USER_JWT_TOKEN in your MCP server environment.');
    }
    throw err;
  }
);

export default apiClient;
