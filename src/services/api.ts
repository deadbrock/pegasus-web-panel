import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://10.0.2.2:8000', // Para Android Emulator
  // baseURL: 'http://localhost:8000', // Para iOS Simulator
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
}); 