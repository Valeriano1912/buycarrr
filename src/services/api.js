import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar a URL base da API
// Substitua pelo IP da sua máquina quando estiver testando
// URL do backend em produção (Render)
const BASE_URL = 'https://buycarrr-1.onrender.com/api';

// Criar instância do axios com configurações otimizadas para React Native
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos (mesmo do AuthContext)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Configurações específicas para React Native/Expo
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Aceitar status codes até 499
  },
}); 

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Erro ao obter token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Cadastro de usuário
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao cadastrar usuário' };
    }
  },

  // Login de usuário
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao fazer login' };
    }
  },

  // Login de administrador
  adminLogin: async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao fazer login administrativo' };
    }
  },

  // Obter dados do usuário logado
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao obter dados do usuário' };
    }
  },

  // Salvar token e dados do usuário
  saveAuthData: async (token, userData) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.log('Erro ao salvar dados de autenticação:', error);
    }
  },

  // Obter dados salvos
  getAuthData: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      return {
        token,
        userData: userData ? JSON.parse(userData) : null,
      };
    } catch (error) {
      console.log('Erro ao obter dados de autenticação:', error);
      return { token: null, userData: null };
    }
  },

  
  // Limpar dados de autenticação
  clearAuthData: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.log('Erro ao limpar dados de autenticação:', error);
    }
  },
};

// Serviços de carros
export const carService = {
  // Listar todos os carros
  getAllCars: async () => {
    try {
      const response = await api.get('/cars');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar carros' };
    }
  },

  // Listar carros disponíveis
  getCars: async () => {
    try {
      const response = await api.get('/cars');
      // Filtrar apenas carros disponíveis
      const availableCars = response.data.cars.filter(car => car.status === 'Disponível');
      return { cars: availableCars };
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar carros' };
    }
  },

  // Obter detalhes de um carro
  getCarById: async (carId) => {
    try {
      const response = await api.get(`/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar carro' };
    }
  },

  // Criar um novo carro
  createCar: async (carData) => {
    try {
      const response = await api.post('/cars', carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar carro' };
    }
  },

  // Atualizar um carro
  updateCar: async (carId, carData) => {
    try {
      const response = await api.put(`/cars/${carId}`, carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao atualizar carro' };
    }
  },

  // Excluir um carro
  deleteCar: async (carId) => {
    try {
      const response = await api.delete(`/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao excluir carro' };
    }
  },
};

// Função para testar conexão com a API
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Erro ao testar conexão' };
  }
};


