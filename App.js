import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { AuthProvider } from './src/contexts/AuthContext';
import CarManagementScreen from './src/screens/CarManagementScreen';
import ClientScreen from './src/screens/ClientScreen';

// Configuração da API
// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr.onrender.com/api';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [cars, setCars] = useState([]);
  const [adminCars, setAdminCars] = useState([]);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    color: '',
    fuel_type: 'Gasolina',
    transmission: 'Automático',
    description: '',
    images: []
  });
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    location: '',
    photo: null
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [adminTab, setAdminTab] = useState('cars'); // 'cars' ou 'add'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'cars', 'reservas', 'perfil'

  // Função para renderizar ícones das tabs
  const renderTabIcon = (tabName, isActive) => {
    const iconStyle = {
      fontSize: 24,
      color: isActive ? '#007AFF' : '#8E8E93',
      marginBottom: 4,
    };

    switch (tabName) {
      case 'dashboard':
        return <Text style={iconStyle}>📊</Text>;
      case 'cars':
        return <Text style={iconStyle}>🚗</Text>;
      case 'reservas':
        return <Text style={iconStyle}>📋</Text>;
      case 'perfil':
        return <Text style={iconStyle}>👤</Text>;
      default:
        return <Text style={iconStyle}>❓</Text>;
    }
  };

  // Funções para renderizar cada tela
  const renderDashboardScreen = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
      <Text style={styles.tabTitle}>Dashboard</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Carros Disponíveis</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Reservas Ativas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Vendas Hoje</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R$ 245.000</Text>
          <Text style={styles.statLabel}>Faturamento</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderCarsScreen = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
      <Text style={styles.tabTitle}>Carros</Text>
      
      {/* Tabs internas para Admin */}
      {user?.is_admin && (
        <View style={styles.internalTabContainer}>
          <TouchableOpacity 
            style={[styles.internalTab, adminTab === 'cars' && styles.activeInternalTab]} 
            onPress={() => setAdminTab('cars')}
          >
            <Text style={[styles.internalTabText, adminTab === 'cars' && styles.activeInternalTabText]}>
              📋 Ver Carros
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.internalTab, adminTab === 'add' && styles.activeInternalTab]} 
            onPress={() => setAdminTab('add')}
          >
            <Text style={[styles.internalTabText, adminTab === 'add' && styles.activeInternalTabText]}>
              ➕ Adicionar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {adminTab === 'cars' && (
        <View>
          <TouchableOpacity style={styles.loadButton} onPress={loadCars}>
            <Text style={styles.buttonText}>Carregar Carros</Text>
          </TouchableOpacity>
          
          {cars.length > 0 && (
            <View style={styles.carsContainer}>
              {cars.map((car, index) => (
                <View key={index} style={styles.carCard}>
                  <Text style={styles.carTitle}>🚗 {car.brand} {car.model}</Text>
                  <Text style={styles.carDetails}>Ano: {car.year} | KM: {car.mileage}</Text>
                  <Text style={styles.carPrice}>{car.price.toLocaleString()} MZN</Text>
                  <TouchableOpacity style={styles.reserveButton}>
                    <Text style={styles.buttonText}>Reservar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {adminTab === 'add' && user?.is_admin && (
        <View>
          <Text style={styles.featuresTitle}>Adicionar Novo Carro:</Text>
          
          <TextInput
            style={styles.adminInput}
            placeholder="Marca"
            value={newCar.brand}
            onChangeText={(text) => setNewCar({...newCar, brand: text})}
          />
          
          <TextInput
            style={styles.adminInput}
            placeholder="Modelo"
            value={newCar.model}
            onChangeText={(text) => setNewCar({...newCar, model: text})}
          />
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.adminInput, styles.halfInput]}
              placeholder="Ano"
              value={newCar.year}
              onChangeText={(text) => setNewCar({...newCar, year: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.adminInput, styles.halfInput]}
              placeholder="KM"
              value={newCar.mileage}
              onChangeText={(text) => setNewCar({...newCar, mileage: text})}
              keyboardType="numeric"
            />
          </View>
          
          <TextInput
            style={styles.adminInput}
            placeholder="Preço (MZN)"
            value={newCar.price}
            onChangeText={(text) => setNewCar({...newCar, price: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.adminInput}
            placeholder="Cor"
            value={newCar.color}
            onChangeText={(text) => setNewCar({...newCar, color: text})}
          />

          <TextInput
            style={styles.adminInput}
            placeholder="Tipo de Combustível"
            value={newCar.fuel_type}
            onChangeText={(text) => setNewCar({...newCar, fuel_type: text})}
          />

          <TextInput
            style={styles.adminInput}
            placeholder="Transmissão"
            value={newCar.transmission}
            onChangeText={(text) => setNewCar({...newCar, transmission: text})}
          />

          <TextInput
            style={[styles.adminInput, styles.textArea]}
            placeholder="Descrição do carro..."
            value={newCar.description}
            onChangeText={(text) => setNewCar({...newCar, description: text})}
            multiline={true}
            numberOfLines={4}
          />

          {/* Seção de Imagens */}
          <Text style={styles.sectionTitle}>📸 Imagens do Carro:</Text>
          
          {newCar.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {newCar.images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Text style={styles.imageText}>📷 {image}</Text>
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeCarImage(index)}
                  >
                    <Text style={styles.removeImageText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.addImageButton} onPress={addCarImage}>
            <Text style={styles.buttonText}>📷 Adicionar Imagem</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.addCarButton, loading && styles.disabledButton]} 
            onPress={addCar}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Adicionando...' : 'Adicionar Carro'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderReservasScreen = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
      <Text style={styles.tabTitle}>Minhas Reservas</Text>
      <View style={styles.reservasContainer}>
        <Text style={styles.emptyText}>Você ainda não possui reservas.</Text>
        <Text style={styles.emptySubtext}>Navegue até a aba "Carros" para fazer sua primeira reserva!</Text>
      </View>
    </ScrollView>
  );

  const renderPerfilScreen = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.profileAvatar} onPress={addProfilePhoto}>
          <Text style={styles.avatarText}>
            {profileData.photo ? '📷' : '👤'}
          </Text>
          <View style={styles.cameraIcon}>
            <Text style={styles.cameraIconText}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'email@exemplo.com'}</Text>
        <TouchableOpacity style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Administrador</Text>
        </TouchableOpacity>
      </View>
      
      {editingProfile ? (
        <View style={styles.editProfileContainer}>
          <Text style={styles.sectionTitle}>✏️ Editar Perfil:</Text>
          
          <TextInput
            style={styles.editInput}
            placeholder="Nome"
            value={profileData.name}
            onChangeText={(text) => setProfileData({...profileData, name: text})}
          />
          
          <TextInput
            style={styles.editInput}
            placeholder="Telefone"
            value={profileData.phone}
            onChangeText={(text) => setProfileData({...profileData, phone: text})}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.editInput}
            placeholder="Localização"
            value={profileData.location}
            onChangeText={(text) => setProfileData({...profileData, location: text})}
          />
          
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.buttonText}>💾 Salvar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingProfile(false)}>
              <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📱</Text>
            <Text style={styles.infoText}>{user?.phone || 'Não informado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{profileData.location || 'Beira, Moçambique'}</Text>
          </View>
        </View>
      )}
      
      {!editingProfile && (
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Função para adicionar imagem ao carro
  const addCarImage = () => {
    Alert.alert(
      'Adicionar Imagem',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => selectImageFromCamera() },
        { text: 'Galeria', onPress: () => selectImageFromGallery() }
      ]
    );
  };

  const selectImageFromCamera = () => {
    // Simulação - em um app real usaria expo-image-picker
    const newImage = `camera_${Date.now()}.jpg`;
    setNewCar(prev => ({ ...prev, images: [...prev.images, newImage] }));
    Alert.alert('Sucesso', 'Imagem adicionada da câmera!');
  };

  const selectImageFromGallery = () => {
    // Simulação - em um app real usaria expo-image-picker
    const newImage = `gallery_${Date.now()}.jpg`;
    setNewCar(prev => ({ ...prev, images: [...prev.images, newImage] }));
    Alert.alert('Sucesso', 'Imagem adicionada da galeria!');
  };

  // Função para remover imagem
  const removeCarImage = (index) => {
    setNewCar(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Função para editar perfil
  const handleEditProfile = () => {
    setEditingProfile(true);
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || '',
      location: 'Beira, Moçambique',
      photo: null
    });
  };

  // Função para salvar perfil
  const saveProfile = () => {
    if (!profileData.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    
    setUser(prev => ({
      ...prev,
      name: profileData.name,
      phone: profileData.phone
    }));
    
    setEditingProfile(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  // Função para adicionar foto do perfil
  const addProfilePhoto = () => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => selectProfilePhotoFromCamera() },
        { text: 'Galeria', onPress: () => selectProfilePhotoFromGallery() }
      ]
    );
  };

  const selectProfilePhotoFromCamera = () => {
    const photoUri = `profile_camera_${Date.now()}.jpg`;
    setProfileData(prev => ({ ...prev, photo: photoUri }));
    Alert.alert('Sucesso', 'Foto adicionada da câmera!');
  };

  const selectProfilePhotoFromGallery = () => {
    const photoUri = `profile_gallery_${Date.now()}.jpg`;
    setProfileData(prev => ({ ...prev, photo: photoUri }));
    Alert.alert('Sucesso', 'Foto adicionada da galeria!');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

          if (response.data.access_token) {
            setUser(response.data.user);
            setAuthToken(response.data.access_token);
            setCurrentScreen('main');
            
            // Se for admin, vai direto para a aba de carros
            if (response.data.user.is_admin) {
              setActiveTab('cars');
              console.log('Login admin - Token definido:', response.data.access_token ? 'Sim' : 'Não');
              Alert.alert('Sucesso', 'Login administrativo realizado com sucesso!');
            } else {
              setActiveTab('dashboard');
              Alert.alert('Sucesso', 'Login realizado com sucesso!');
            }
          }
    } catch (error) {
      console.log('Erro no login:', error.response?.data);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setEmail('');
    setPassword('');
    setUser(null);
    setAuthToken(null);
    setCars([]);
    setAdminCars([]);
  };

  const testAPI = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      Alert.alert('API Test', response.data.message);
    } catch (error) {
      Alert.alert('API Error', 'Erro ao conectar com a API');
    }
  };

  const loadCars = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars`);
      setCars(response.data.cars);
    } catch (error) {
      console.log('Erro ao carregar carros:', error.response?.data);
      Alert.alert('Erro', 'Erro ao carregar carros');
    }
  };

  const loadAdminCars = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars`);
      setAdminCars(response.data.cars);
    } catch (error) {
      console.log('Erro ao carregar carros:', error.response?.data);
      Alert.alert('Erro', 'Erro ao carregar carros');
    }
  };

  const addCar = async () => {
    const { brand, model, year, mileage, price, color, fuel_type, transmission, description, images } = newCar;
    
    if (!brand || !model || !year || !mileage || !price || !color || !description) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos uma imagem do carro');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/cars`, {
        brand,
        model,
        year: parseInt(year),
        mileage: parseInt(mileage),
        price: parseFloat(price),
        color,
        fuel_type,
        transmission,
        description,
        images
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Carro adicionado com sucesso!');
        setNewCar({
          brand: '',
          model: '',
          year: '',
          mileage: '',
          price: '',
          color: '',
          fuel_type: 'Gasolina',
          transmission: 'Automático',
          description: '',
          images: []
        });
        loadAdminCars(); // Recarregar lista
      }
    } catch (error) {
      console.log('Erro ao adicionar carro:', error.response?.data);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao adicionar carro');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = registerData;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        confirmPassword
      });

      if (response.data.access_token) {
        setUser(response.data.user);
        setCurrentScreen('main');
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
    } catch (error) {
      console.log('Erro no cadastro:', error.response?.data);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };


  if (currentScreen === 'register') {
    return (
      <AuthProvider>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
          <Text style={styles.title}>BuyCarr</Text>
          <Text style={styles.subtitle}>Criar Nova Conta</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            value={registerData.name}
            onChangeText={(text) => setRegisterData({...registerData, name: text})}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={registerData.email}
            onChangeText={(text) => setRegisterData({...registerData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={registerData.phone}
            onChangeText={(text) => setRegisterData({...registerData, phone: text})}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha (mínimo 6 caracteres)"
            value={registerData.password}
            onChangeText={(text) => setRegisterData({...registerData, password: text})}
            secureTextEntry={true}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            value={registerData.confirmPassword}
            onChangeText={(text) => setRegisterData({...registerData, confirmPassword: text})}
            secureTextEntry={true}
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentScreen('login')}
          >
            <Text style={styles.backButtonText}>Voltar ao Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </AuthProvider>
    );
  }

  if (currentScreen === 'main') {
    // Se for admin, mostrar a tela de gerenciamento de carros
    if (user?.is_admin) {
      console.log('App.js - Passando authToken para CarManagementScreen:', authToken ? 'Token presente' : 'Token ausente');
      return (
        <AuthProvider>
          <CarManagementScreen navigation={{ navigate: () => handleLogout() }} authToken={authToken} />
        </AuthProvider>
      );
    }

    // Se for usuário normal, mostrar a tela do cliente
    return (
      <AuthProvider>
        <ClientScreen authToken={authToken} onLogout={handleLogout} />
      </AuthProvider>
    );
  }


  return (
    <AuthProvider>
      <View style={styles.container}>
        <Text style={styles.title}>BuyCarr</Text>
        <Text style={styles.subtitle}>Sistema de Venda de Carros</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerLinkButton} onPress={() => setCurrentScreen('register')}>
          <Text style={styles.registerLinkText}>Não tem conta? Criar conta</Text>
        </TouchableOpacity>
        
        <Text style={styles.info}>
          Backend rodando em: https://buycarrr.onrender.com
        </Text>
        <Text style={styles.info}>
          Admin: admin@buycarr.com / admin123
        </Text>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  adminContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  adminScrollView: {
    flex: 1,
  },
  adminContent: {
    padding: 15,
    paddingBottom: 100,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  // Estilos para o layout principal com tabs
  mainContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  contentArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Bottom Tab Navigation
  bottomTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeBottomTab: {
    // Cor de fundo será aplicada via ícone e texto
  },
  bottomTabText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  activeBottomTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  // Estilos para Dashboard
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Estilos para Carros
  carsContainer: {
    marginTop: 20,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  carDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  carPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  reserveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  // Estilos para Reservas
  reservasContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Estilos para Perfil
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  adminBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 15,
    width: 25,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para novos campos
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  imagesContainer: {
    marginBottom: 15,
  },
  imageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeImageButton: {
    padding: 5,
  },
  removeImageText: {
    fontSize: 16,
  },
  addImageButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  // Estilos para edição de perfil
  editProfileContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  editInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconText: {
    fontSize: 12,
    color: '#fff',
  },
  // Estilos para tabs internas
  internalTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 10,
  },
  internalTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeInternalTab: {
    backgroundColor: '#007AFF',
  },
  internalTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeInternalTabText: {
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 45,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  testButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#34C759',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  registerLinkButton: {
    marginTop: 15,
    padding: 10,
  },
  registerLinkText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#34C759',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminActions: {
    marginBottom: 20,
  },
  adminActionButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  adminActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  carText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  carPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  adminInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  addCarButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    height: 45,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    marginBottom: 15,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});
