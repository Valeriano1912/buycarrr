import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Configuração da API
// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr-1.onrender.com/api';

// Configurar timeout do axios
axios.defaults.timeout = 30000; // 30 segundos

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação salva:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔵 Tentando fazer login...');
      console.log('🌐 URL:', `${API_BASE_URL}/auth/login`);
      console.log('📧 Email:', email);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      console.log('✅ Resposta recebida:', response.data);
      
      if (response.data.access_token) {
        const { access_token: authToken, user: userData } = response.data;
        
        // Salvar no estado
        setToken(authToken);
        setUser(userData);
        
        // Salvar no AsyncStorage
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login realizado com sucesso!');
        return { success: true };
      } else {
        console.log('❌ Resposta sem access_token:', response.data);
        return { success: false, error: response.data.error || 'Erro no login' };
      }
    } catch (error) {
      console.error('❌ ERRO NO LOGIN!');
      console.error('Objeto erro:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem:', error?.message);
      console.error('Código:', error?.code);
      console.error('Stack:', error?.stack);
      
      if (error.response) {
        console.error('✅ Tem resposta do servidor');
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('⚠️ NÃO teve resposta do servidor (timeout ou conexão recusada)');
        console.error('Request:', error.request);
      } else {
        console.error('⚠️ Erro ao configurar a requisição');
      }
      
      // Determinar mensagem de erro apropriada
      let errorMessage = 'Erro desconhecido';
      
      if (error.response) {
        // Servidor respondeu com erro (4xx, 5xx)
        errorMessage = error.response.data?.error || 
                      `Erro do servidor (${error.response.status})` ||
                      'Erro no servidor';
        console.error('❌ Erro do servidor:', errorMessage);
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta (timeout, conexão recusada, etc)
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está online.';
        console.error('❌ Sem resposta do servidor - possíveis causas: servidor offline, timeout, ou CORS');
      } else {
        // Erro ao configurar a requisição
        errorMessage = error.message || 'Erro ao fazer a requisição';
        console.error('❌ Erro na configuração da requisição:', errorMessage);
      }
      
      console.error('Mensagem final de erro:', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
      console.log('🔄 Loading finalizado');
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔵 Tentando fazer login admin...');
      
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
        email,
        password,
      });

      console.log('✅ Resposta admin recebida:', response.data);
      
      if (response.data.access_token) {
        const { access_token: authToken, user: userData } = response.data;
        
        // Salvar no estado
        setToken(authToken);
        setUser(userData);
        
        // Salvar no AsyncStorage
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login admin realizado com sucesso!');
        return { success: true };
      } else {
        console.log('❌ Resposta sem access_token:', response.data);
        return { success: false, error: response.data.error || 'Erro no login' };
      }
    } catch (error) {
      console.error('❌ Erro no login admin:', error);
      console.error('Erro completo:', error.response?.data || error.message);
      console.error('Status do erro:', error.response?.status);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Erro de conexão' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password, confirmPassword) => {
    try {
      setLoading(true);
      console.log('🔵 Tentando fazer cadastro...');
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        confirmPassword,
      });

      console.log('✅ Resposta cadastro recebida:', response.data);
      
      if (response.data.access_token) {
        const { access_token: authToken, user: userData } = response.data;
        
        // Salvar no estado
        setToken(authToken);
        setUser(userData);
        
        // Salvar no AsyncStorage
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Cadastro realizado com sucesso!');
        return { success: true };
      } else {
        console.log('❌ Resposta sem access_token:', response.data);
        return { success: false, error: response.data.error || 'Erro no cadastro' };
      }
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      console.error('Erro completo:', error.response?.data || error.message);
      console.error('Status do erro:', error.response?.status);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Erro de conexão' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Limpar estado
      setUser(null);
      setToken(null);
      
      // Limpar AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, error: 'Erro ao fazer logout' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    adminLogin,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;