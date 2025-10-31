import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Pressable,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
// Removido carService - vamos usar axios diretamente
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CarDetailsScreen from './CarDetailsScreen';
import AdminProfileScreen from './AdminProfileScreen';
import Header from '../components/Header';

// Configuração da API
// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr.onrender.com/api';
console.log('API_BASE_URL configurada:', API_BASE_URL);

// Componente para selecionar fotos (real)
const ImagePickerComponent = ({ onImageSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectImage = async (source) => {
    try {
      // Na web, usar input HTML
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => {
          const files = Array.from(e.target.files);
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              onImageSelect(e.target.result);
            };
            reader.readAsDataURL(file);
          });
          if (files.length > 0) {
            Alert.alert('Sucesso', `${files.length} imagem(ns) adicionada(s) com sucesso!`);
          }
        };
        input.click();
        setModalVisible(false);
        return;
      }
      
      let result;
      
      if (source === 'camera') {
        // Solicitar permissão da câmera
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          Alert.alert('Permissão necessária', 'Permissão da câmera é necessária para tirar fotos.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaType.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // Solicitar permissão da galeria
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (galleryPermission.status !== 'granted') {
          Alert.alert('Permissão necessária', 'Permissão da galeria é necessária para selecionar fotos.');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaType.Images,
          allowsEditing: false,
          allowsMultipleSelection: true,
          selectionLimit: 10,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Selecionar todas as imagens de uma vez
        result.assets.forEach(asset => onImageSelect(asset.uri));
        Alert.alert('Sucesso', `${result.assets.length} imagem(ns) adicionada(s) com sucesso!`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem: ' + error.message);
    }
    
    setModalVisible(false);
  };

  return (
    <View style={styles.imagePickerContainer}>
      <TouchableOpacity 
        style={styles.imagePickerButton} 
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add-a-photo" size={24} color="#fff" />
        <Text style={styles.imagePickerText}>Adicionar Fotos</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Foto</Text>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => selectImage('camera')}
            >
              <MaterialIcons name="photo-camera" size={24} color="#3498db" />
              <Text style={styles.modalOptionText}>Tirar Foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => selectImage('gallery')}
            >
              <MaterialIcons name="photo-library" size={24} color="#3498db" />
              <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelButton]} 
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="cancel" size={24} color="#e74c3c" />
              <Text style={styles.modalOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Componente para exibir pré-visualização de imagens
const ImagePreview = ({ images, onRemoveImage }) => {
  if (!images || images.length === 0) return null;
  
  return (
    <View style={styles.imagePreviewContainer}>
      <Text style={styles.sectionTitle}>Fotos do Veículo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((image, index) => (
          <View key={index} style={styles.imagePreviewItem}>
            <Image 
              source={{ uri: image }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => onRemoveImage(index)}
            >
              <MaterialIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Componente para formulário de carro
const CarForm = ({ car, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year ? car.year.toString() : '',
    mileage: car?.mileage ? car.mileage.toString() : '',
    price: car?.price ? car.price.toString() : '',
    color: car?.color || '',
    fuel_type: car?.fuel_type || 'Gasolina',
    transmission: car?.transmission || 'Automática',
    car_type: car?.car_type || 'sedan',
    description: car?.description || '',
    status: car?.status || 'Disponível',
  });
  
  const [images, setImages] = useState(car?.images ? JSON.parse(car.images) : []);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    console.log('=== INÍCIO handleSave ===');
    console.log('handleSave chamado com formData:', formData);
    
    // Validação básica de todos os campos obrigatórios
    if (!formData.brand || !formData.model || !formData.year || 
        !formData.mileage || !formData.price || !formData.color ||
        !formData.fuel_type || !formData.transmission || !formData.car_type) {
      console.log('Campos obrigatórios faltando:');
      console.log('- brand:', formData.brand);
      console.log('- model:', formData.model);
      console.log('- year:', formData.year);
      console.log('- mileage:', formData.mileage);
      console.log('- price:', formData.price);
      console.log('- color:', formData.color);
      console.log('- fuel_type:', formData.fuel_type);
      console.log('- transmission:', formData.transmission);
      console.log('- car_type:', formData.car_type);
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Validar campos numéricos
    const year = parseInt(formData.year);
    const mileage = parseInt(formData.mileage);
    const price = parseFloat(formData.price);
    
    if (isNaN(year) || isNaN(mileage) || isNaN(price)) {
      Alert.alert('Erro', 'Por favor, verifique se os campos numéricos estão preenchidos corretamente');
      return;
    }
    
    // Garantir que todos os campos sejam strings válidas
    const carData = {
      brand: String(formData.brand).trim(),
      model: String(formData.model).trim(),
      year: year,
      mileage: mileage,
      price: price,
      color: String(formData.color).trim(),
      fuel_type: String(formData.fuel_type).trim(),
      transmission: String(formData.transmission).trim(),
      car_type: String(formData.car_type).trim(),
      description: String(formData.description || '').trim(),
      status: String(formData.status || 'Disponível').trim(),
      images: JSON.stringify(images) // URLs das imagens selecionadas
    };
    
    console.log('Dados do carro validados:', carData);
    console.log('Chamando onSave com carData:', carData);
    onSave(carData);
    console.log('=== FIM handleSave ===');
  };
  
  const handleImageSelect = (imageUri) => {
    setImages(prev => [...prev, imageUri]);
  };
  
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>{car ? 'Editar Carro' : 'Adicionar Novo Carro'}</Text>
      
      {/* Marca */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Marca *</Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="directions-car" size={20} color="#7f8c8d" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Toyota, Honda, Ford..."
            value={formData.brand}
            onChangeText={(value) => handleInputChange('brand', value)}
          />
        </View>
      </View>
      
      {/* Modelo */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Modelo *</Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="label" size={20} color="#7f8c8d" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Corolla, Civic, Focus..."
            value={formData.model}
            onChangeText={(value) => handleInputChange('model', value)}
          />
        </View>
      </View>
      
      {/* Ano */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Ano *</Text>
          <View style={styles.inputWithIcon}>
            <MaterialIcons name="date-range" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 2020"
              keyboardType="numeric"
              value={formData.year}
              onChangeText={(value) => handleInputChange('year', value)}
            />
          </View>
        </View>
        
        {/* Quilometragem */}
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Quilometragem *</Text>
          <View style={styles.inputWithIcon}>
            <MaterialIcons name="speed" size={20} color="#7f8c8d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 30000"
              keyboardType="numeric"
              value={formData.mileage}
              onChangeText={(value) => handleInputChange('mileage', value)}
            />
          </View>
        </View>
      </View>
      
      {/* Preço */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preço (MZN) *</Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="attach-money" size={20} color="#7f8c8d" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: 85000"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
          />
        </View>
      </View>
      
      {/* Cor */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cor *</Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="palette" size={20} color="#7f8c8d" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Prata, Preto, Branco..."
            value={formData.color}
            onChangeText={(value) => handleInputChange('color', value)}
          />
        </View>
      </View>
      
      {/* Tipo de Combustível */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Combustível</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.fuel_type}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('fuel_type', value)}
          >
            <Picker.Item label="Gasolina" value="Gasolina" />
            <Picker.Item label="Álcool" value="Álcool" />
            <Picker.Item label="Diesel" value="Diesel" />
            <Picker.Item label="Flex" value="Flex" />
            <Picker.Item label="Elétrico" value="Elétrico" />
            <Picker.Item label="Híbrido" value="Híbrido" />
          </Picker>
        </View>
      </View>
      
      {/* Transmissão */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Transmissão</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.transmission}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('transmission', value)}
          >
            <Picker.Item label="Automática" value="Automática" />
            <Picker.Item label="Manual" value="Manual" />
            <Picker.Item label="Semi-Automática" value="Semi-Automática" />
          </Picker>
        </View>
      </View>

      {/* Tipo de Carro */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Carro</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.car_type}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('car_type', value)}
          >
            <Picker.Item label="Sedan" value="sedan" />
            <Picker.Item label="Minibus" value="minibus" />
            <Picker.Item label="Bus" value="bus" />
            <Picker.Item label="Cope" value="cope" />
            <Picker.Item label="SUV" value="suv" />
            <Picker.Item label="Pickup" value="pickup" />
            <Picker.Item label="Truck" value="truck" />
            <Picker.Item label="Camioneta" value="camioneta" />
            <Picker.Item label="Coupé" value="coupe" />
            <Picker.Item label="Off-Road" value="off-road" />
          </Picker>
        </View>
      </View>
      
      {/* Status */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.status}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <Picker.Item label="Disponível" value="Disponível" />
            <Picker.Item label="Reservado" value="Reservado" />
            <Picker.Item label="Vendido" value="Vendido" />
          </Picker>
        </View>
      </View>
      
      {/* Fotos do veículo */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fotos do Veículo</Text>
        <ImagePickerComponent onImageSelect={handleImageSelect} />
        <ImagePreview images={images} onRemoveImage={handleRemoveImage} />
      </View>
      
      {/* Descrição detalhada */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descrição Detalhada</Text>
        <View style={styles.textAreaContainer}>
          <MaterialIcons name="description" size={20} color="#7f8c8d" style={styles.textAreaIcon} />
          <TextInput
            style={styles.textArea}
            placeholder="Detalhes adicionais sobre o veículo..."
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
          />
        </View>
      </View>
      
      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Componente para item de lista de carros
const CarListItem = ({ car, onShowDetails }) => {
  return (
    <TouchableOpacity style={styles.carItem} onPress={() => onShowDetails(car)}>
      <View style={styles.carHeader}>
        <View>
          <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
          <Text style={styles.carYear}>{car.year}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          car.status === 'Disponível' && styles.statusAvailable,
          car.status === 'Reservado' && styles.statusReserved,
          car.status === 'Vendido' && styles.statusSold
        ]}>
          <Text style={styles.statusText}>{car.status}</Text>
        </View>
      </View>
      
      <View style={styles.carDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="local-gas-station" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{car.fuel_type}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="settings" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{car.transmission}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="speed" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{car.mileage.toLocaleString()} km</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>{car.price.toLocaleString()} MZN</Text>
        </View>
      </View>
      
      {/* Foto do carro */}
      {car.images && car.images.length > 0 ? (
        <View style={styles.carImageContainer}>
          <Image 
            source={{ uri: JSON.parse(car.images)[0] }} 
            style={styles.carImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={styles.carImageContainer}>
          <View style={styles.carImagePlaceholder}>
            <MaterialIcons name="image" size={30} color="#bdc3c7" />
            <Text style={styles.carImagePlaceholderText}>Sem foto</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};


export default function CarManagementScreen({ navigation, authToken }) {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [activeTab, setActiveTab] = useState('cars'); // 'dashboard', 'cars', 'reservations', 'profile'
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailsScreen, setShowDetailsScreen] = useState(false);
  const [showProfileScreen, setShowProfileScreen] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);

  // Usar token passado como prop ou tentar obter do contexto
  const [token, setToken] = useState(authToken || null);
  
  // Estados para reservas
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  
  // Debug: verificar se o token está chegando
  console.log('CarManagementScreen - authToken prop:', authToken ? 'Token presente' : 'Token ausente');
  console.log('CarManagementScreen - token final:', token ? 'Token presente' : 'Token ausente');

  // Função para buscar reservas
  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        setReservations(response.data.reservations || []);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    } finally {
      setReservationsLoading(false);
    }
  };

  // Função para confirmar venda
  const handleConfirmSale = async (reservationId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/reservations/${reservationId}/confirm`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        Alert.alert('Sucesso', 'Venda confirmada com sucesso!');
        // Recarregar reservas e carros
        fetchReservations();
        fetchCars();
      }
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
      Alert.alert('Erro', 'Não foi possível confirmar a venda');
    }
  };

  // Função para cancelar reserva
  const handleCancelReservation = async (reservationId) => {
    Alert.alert(
      'Cancelar Reserva',
      'Tem certeza que deseja cancelar esta reserva?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              const response = await axios.put(`${API_BASE_URL}/admin/reservations/${reservationId}/cancel`, {}, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (response.status === 200) {
                Alert.alert('Sucesso', 'Reserva cancelada com sucesso!');
                // Recarregar reservas e carros
                fetchReservations();
                fetchCars();
              }
            } catch (error) {
              console.error('Erro ao cancelar reserva:', error);
              Alert.alert('Erro', 'Não foi possível cancelar a reserva');
            }
          },
        },
      ]
    );
  };

  // Tentar obter token do AsyncStorage se não estiver disponível
  useEffect(() => {
    const getTokenFromStorage = async () => {
      if (!token) {
        try {
          const storedToken = await AsyncStorage.getItem('authToken');
          if (storedToken) {
            setToken(storedToken);
            console.log('Token obtido do AsyncStorage');
          }
        } catch (error) {
          console.error('Erro ao obter token do AsyncStorage:', error);
        }
      }
    };
    
    getTokenFromStorage();
  }, [token]);
  
  useEffect(() => {
    fetchCars();
  }, []);

  // Carregar reservas quando o token estiver disponível
  useEffect(() => {
    if (token) {
      fetchReservations();
    }
  }, [token]);
  
  const fetchCars = async () => {
    try {
      setLoading(true);
      console.log('fetchCars - token:', token ? 'Token presente' : 'Token ausente');
      
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/cars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCars(response.data.cars || response.data);
    } catch (error) {
      console.error('Erro ao carregar carros:', error.response?.data);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível carregar os carros');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCar = () => {
    console.log('Botão Adicionar Carro clicado!');
    setEditingCar(null);
    setShowForm(true);
  };
  
  const handleEditCar = (car) => {
    setEditingCar(car);
    setShowForm(true);
  };
  
  const handleDeleteCar = async (car) => {
    const latestToken = token || await AsyncStorage.getItem('authToken');
    if (!latestToken) {
      Alert.alert('Erro', 'Token de autenticação não encontrado. Faça login novamente.');
      return;
    }
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o carro ${car.brand} ${car.model}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Chamando API DELETE para carro ID:', car.id);
              const response = await axios.delete(`${API_BASE_URL}/cars/${car.id}`, {
                headers: {
                  'Authorization': `Bearer ${latestToken}`
                }
              });
              console.log('✅ Resposta do servidor:', response.data);
              setCars(prev => prev.filter(c => c.id !== car.id));
              Alert.alert('Sucesso', 'Carro excluído com sucesso!');
            } catch (error) {
              const status = error.response?.status;
              const msg = error.response?.data?.error || 'Não foi possível excluir o carro';
              if(status === 403) {
                Alert.alert('Acesso negado', 'Apenas administradores podem excluir carros. Faça login como admin.');
              } else if(status === 401) {
                Alert.alert('Token inválido', 'Faça login novamente para gerenciar carros.');
              } else {
                Alert.alert('Erro', msg);
              }
              console.error('❌ Erro ao deletar:', status, msg);
            }
          }
        }
      ]
    );
  };

  const handleCancelCarReservation = (car) => {
    Alert.alert(
      'Cancelar Reserva',
      `Deseja cancelar a reserva do carro ${car.brand} ${car.model} e disponibilizá-lo novamente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCar = { ...car, status: 'Disponível' };
              await axios.put(`${API_BASE_URL}/cars/${car.id}`, updatedCar, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              });
              setCars(prev => prev.map(c => c.id === car.id ? updatedCar : c));
              Alert.alert('Sucesso', 'Reserva cancelada! O carro está disponível novamente.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar a reserva');
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const handleSaveCar = async (carData) => {
    try {
      console.log('handleSaveCar chamado com carData:', carData);
      console.log('Token disponível:', token ? 'Sim' : 'Não');
      console.log('Token:', token);
      
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado');
        return;
      }
      
      console.log('Enviando dados do carro:', carData);
      console.log('Verificação de tipos:');
      console.log('- brand:', typeof carData.brand, carData.brand);
      console.log('- model:', typeof carData.model, carData.model);
      console.log('- year:', typeof carData.year, carData.year);
      console.log('- mileage:', typeof carData.mileage, carData.mileage);
      console.log('- price:', typeof carData.price, carData.price);
      console.log('- color:', typeof carData.color, carData.color);
      console.log('- fuel_type:', typeof carData.fuel_type, carData.fuel_type);
      console.log('- transmission:', typeof carData.transmission, carData.transmission);
      console.log('- car_type:', typeof carData.car_type, carData.car_type);
      console.log('- description:', typeof carData.description, carData.description);
      
      if (editingCar) {
        // Atualizar carro existente
        const response = await axios.put(`${API_BASE_URL}/cars/${editingCar.id}`, carData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setCars(prev => prev.map(car => 
          car.id === editingCar.id ? response.data.car : car
        ));
        Alert.alert('Sucesso', 'Carro atualizado com sucesso!');
      } else {
        // Adicionar novo carro
        const response = await axios.post(`${API_BASE_URL}/cars`, carData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setCars(prev => [...prev, response.data.car]);
        Alert.alert('Sucesso', 'Carro adicionado com sucesso!');
      }
      
      setShowForm(false);
      setEditingCar(null);
    } catch (error) {
      console.error('Erro ao salvar carro:', error.response?.data);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível salvar o carro');
    }
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCar(null);
  };

  const handleShowCarDetails = (car) => {
    setSelectedCar(car);
    setShowDetailsScreen(true);
  };

  const handleCloseDetailsScreen = () => {
    setShowDetailsScreen(false);
    setSelectedCar(null);
  };

  const handleOpenProfile = () => {
    setShowProfileScreen(true);
  };

  const handleCloseProfile = () => {
    setShowProfileScreen(false);
  };

  const handleMenuPress = () => {
    setShowSideMenu(true);
  };

  const handleCloseSideMenu = () => {
    setShowSideMenu(false);
  };

  const handleMenuNavigation = (tab) => {
    setActiveTab(tab);
    setShowSideMenu(false);
  };

  // Função para renderizar ícones das tabs
  const renderTabIcon = (tabName, isActive) => {
    switch (tabName) {
      case 'dashboard':
        return <MaterialIcons name="dashboard" size={24} color={isActive ? '#3498db' : '#bdc3c7'} />;
      case 'cars':
        return <MaterialIcons name="directions-car" size={24} color={isActive ? '#3498db' : '#bdc3c7'} />;
      case 'reservations':
        return <MaterialIcons name="event-note" size={24} color={isActive ? '#3498db' : '#bdc3c7'} />;
      case 'profile':
        return <MaterialIcons name="person" size={24} color={isActive ? '#3498db' : '#bdc3c7'} />;
      default:
        return <MaterialIcons name="help" size={24} color={isActive ? '#3498db' : '#bdc3c7'} />;
    }
  };

  // Renderizar Dashboard
  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.dashboardContainer}>
        <Text style={styles.dashboardTitle}>Dashboard Administrativo</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="directions-car" size={30} color="#3498db" />
            <Text style={styles.statNumber}>{cars.length}</Text>
            <Text style={styles.statLabel}>Total de Carros</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={30} color="#2ecc71" />
            <Text style={styles.statNumber}>{cars.filter(car => car.status === 'Disponível').length}</Text>
            <Text style={styles.statLabel}>Disponíveis</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="event-note" size={30} color="#f39c12" />
            <Text style={styles.statNumber}>{cars.filter(car => car.status === 'Reservado').length}</Text>
            <Text style={styles.statLabel}>Reservados</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="attach-money" size={30} color="#e74c3c" />
            <Text style={styles.statNumber}>{cars.filter(car => car.status === 'Vendido').length}</Text>
            <Text style={styles.statLabel}>Vendidos</Text>
          </View>
        </View>

        <View style={styles.revenueCard}>
          <Text style={styles.revenueTitle}>Faturamento Total</Text>
          <Text style={styles.revenueAmount}>
            {cars.filter(car => car.status === 'Vendido').reduce((total, car) => total + car.price, 0).toLocaleString()} MZN
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  // Renderizar Carros com Fotos
  const renderCarsWithPhotos = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.carsWithPhotosContainer}>
        <Text style={styles.sectionTitle}>Carros Disponíveis com Fotos</Text>
        
        {cars.filter(car => car.status === 'Disponível').map((car, index) => (
          <View key={index} style={styles.carPhotoCard}>
            <View style={styles.carPhotoHeader}>
              <Text style={styles.carPhotoTitle}>{car.brand} {car.model}</Text>
              <Text style={styles.carPhotoYear}>{car.year}</Text>
            </View>
            
            <View style={styles.carPhotoImage}>
              {car.images && car.images.length > 0 ? (
                <Image 
                  source={{ uri: JSON.parse(car.images)[0] }} 
                  style={styles.carPhotoImageReal}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <MaterialIcons name="image" size={40} color="#bdc3c7" />
                  <Text style={styles.carPhotoText}>Foto do Carro</Text>
                </>
              )}
            </View>
            
            <View style={styles.carPhotoDetails}>
              <Text style={styles.carPhotoPrice}>{car.price.toLocaleString()} MZN</Text>
              <Text style={styles.carPhotoMileage}>{car.mileage.toLocaleString()} km</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // Renderizar Reservas
  const renderReservations = () => {
    if (reservationsLoading) {
      return (
        <ScrollView style={styles.tabContent}>
          <View style={styles.reservationsContainer}>
            <Text style={styles.sectionTitle}>Reservas Realizadas</Text>
            <View style={styles.loadingContainer}>
              <MaterialIcons name="refresh" size={40} color="#3498db" />
              <Text style={styles.loadingText}>Carregando reservas...</Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.reservationsContainer}>
          <Text style={styles.sectionTitle}>Reservas Realizadas</Text>
          
          {reservations.length > 0 ? (
            reservations.map((reservation) => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationTitle}>{reservation.car.brand} {reservation.car.model}</Text>
                  <View style={styles.reservationStatus}>
                    <MaterialIcons name="event-note" size={16} color="#f39c12" />
                    <Text style={styles.reservationStatusText}>{reservation.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.reservationDetails}>
                  Ano: {reservation.car.year} | Cliente: {reservation.user.name}
                </Text>
                <Text style={styles.reservationPrice}>{(reservation.car.price || 0).toLocaleString()} MZN</Text>
                
                {reservation.message && (
                  <Text style={styles.reservationMessage}>
                    <Text style={styles.messageLabel}>Mensagem: </Text>
                    {reservation.message}
                  </Text>
                )}
                
                <Text style={styles.reservationDate}>
                  Reservado em: {new Date(reservation.created_at).toLocaleDateString('pt-BR')}
                </Text>
                
                <View style={styles.reservationActions}>
                  {reservation.status === 'Pendente' && (
                    <TouchableOpacity 
                      style={styles.confirmButton}
                      onPress={() => handleConfirmSale(reservation.id)}
                    >
                      <Text style={styles.confirmButtonText}>Confirmar Venda</Text>
                    </TouchableOpacity>
                  )}
                  {reservation.status === 'Pendente' && (
                    <TouchableOpacity 
                      style={styles.cancelReservationButton}
                      onPress={() => handleCancelReservation(reservation.id)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
                    </TouchableOpacity>
                  )}
                  {reservation.status === 'Vendido' && (
                    <View style={styles.soldBadge}>
                      <Text style={styles.soldBadgeText}>✅ VENDIDO</Text>
                    </View>
                  )}
                  {reservation.status === 'Cancelado' && (
                    <View style={styles.cancelledBadge}>
                      <Text style={styles.cancelledBadgeText}>❌ CANCELADO</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyReservations}>
              <MaterialIcons name="event-note" size={60} color="#3498db" />
              <Text style={styles.emptyReservationsText}>Nenhuma Reserva</Text>
              <Text style={styles.emptyReservationsSubtext}>
                Quando houver reservas de carros, elas aparecerão aqui
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // Renderizar Perfil
  const renderProfile = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.profileContainer}>
        <Text style={styles.sectionTitle}>Perfil do Administrador</Text>
        
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <MaterialIcons name="person" size={40} color="#fff" />
          </View>
          
          <Text style={styles.profileName}>{user?.name || 'Administrador'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'admin@buycarr.com'}</Text>
          <Text style={styles.profileRole}>Administrador do Sistema</Text>
        </View>
        
        <View style={styles.profileStats}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatNumber}>{cars.length}</Text>
            <Text style={styles.profileStatLabel}>Carros Gerenciados</Text>
          </View>
          
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatNumber}>{cars.filter(car => car.status === 'Vendido').length}</Text>
            <Text style={styles.profileStatLabel}>Vendas Realizadas</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutProfileButton} onPress={() => navigation.navigate('Login')}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutProfileText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  if (showDetailsScreen) {
    return (
      <CarDetailsScreen 
        car={selectedCar}
        onClose={handleCloseDetailsScreen}
        onEdit={handleEditCar}
        onDelete={handleDeleteCar}
        onCancelReservation={handleCancelCarReservation}
      />
    );
  }

  if (showProfileScreen) {
    return (
      <AdminProfileScreen 
        onClose={handleCloseProfile}
        authToken={token}
      />
    );
  }
  
  if (showForm) {
    return (
      <LinearGradient colors={['#2c3e50', '#34495e']} style={styles.container}>
        <StatusBar style="light" />
        <CarForm 
          car={editingCar} 
          onSave={handleSaveCar} 
          onCancel={handleCancelForm} 
        />
      </LinearGradient>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header 
        title="BuyCarMoz Admin"
        rightIcon="logout"
        onRightPress={() => navigation.navigate('Login')}
        onMenuPress={handleMenuPress}
      />
      
      {/* Content Area */}
      <View style={styles.contentArea}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'cars' && (
          <View>
            <View style={styles.addCarContainer}>
              <TouchableOpacity style={styles.addButton} onPress={handleAddCar}>
                <MaterialIcons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Adicionar Novo Carro</Text>
              </TouchableOpacity>
            </View>
            
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <CarListItem 
              car={item} 
              onShowDetails={handleShowCarDetails}
            />
          )}
          contentContainerStyle={styles.carsGrid}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                    <MaterialIcons name="directions-car" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nenhum carro cadastrado</Text>
              <Text style={styles.emptySubtext}>Adicione seu primeiro carro ao catálogo</Text>
            </View>
          }
        />
      )}
          </View>
        )}
        {activeTab === 'reservations' && renderReservations()}
        {activeTab === 'profile' && renderProfile()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabContainer}>
        <TouchableOpacity 
          style={[styles.bottomTab, activeTab === 'dashboard' && styles.activeBottomTab]} 
          onPress={() => setActiveTab('dashboard')}
        >
          {renderTabIcon('dashboard', activeTab === 'dashboard')}
          <Text style={[styles.bottomTabText, activeTab === 'dashboard' && styles.activeBottomTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomTab, activeTab === 'cars' && styles.activeBottomTab]} 
          onPress={() => setActiveTab('cars')}
        >
          {renderTabIcon('cars', activeTab === 'cars')}
          <Text style={[styles.bottomTabText, activeTab === 'cars' && styles.activeBottomTabText]}>
            Carros
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomTab, activeTab === 'reservations' && styles.activeBottomTab]} 
          onPress={() => setActiveTab('reservations')}
        >
          {renderTabIcon('reservations', activeTab === 'reservations')}
          <Text style={[styles.bottomTabText, activeTab === 'reservations' && styles.activeBottomTabText]}>
            Reservas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomTab, activeTab === 'profile' && styles.activeBottomTab]} 
          onPress={handleOpenProfile}
        >
          {renderTabIcon('profile', activeTab === 'profile')}
          <Text style={[styles.bottomTabText, activeTab === 'profile' && styles.activeBottomTabText]}>
            Perfil
          </Text>
        </TouchableOpacity>
          </View>

      {/* Side Menu */}
      {showSideMenu && (
        <View style={styles.sideMenuOverlay}>
          <TouchableOpacity 
            style={styles.sideMenuBackdrop}
            onPress={handleCloseSideMenu}
            activeOpacity={1}
          />
          <View style={styles.sideMenu}>
            <View style={styles.sideMenuHeader}>
              <Text style={styles.sideMenuTitle}>Menu</Text>
              <TouchableOpacity onPress={handleCloseSideMenu} style={styles.closeMenuButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sideMenuContent}>
              <TouchableOpacity 
                style={[styles.sideMenuItem, activeTab === 'dashboard' && styles.activeSideMenuItem]}
                onPress={() => handleMenuNavigation('dashboard')}
              >
                <MaterialIcons name="dashboard" size={24} color={activeTab === 'dashboard' ? '#3498db' : '#666'} />
                <Text style={[styles.sideMenuText, activeTab === 'dashboard' && styles.activeSideMenuText]}>
                  Dashboard
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sideMenuItem, activeTab === 'cars' && styles.activeSideMenuItem]}
                onPress={() => handleMenuNavigation('cars')}
              >
                <MaterialIcons name="directions-car" size={24} color={activeTab === 'cars' ? '#3498db' : '#666'} />
                <Text style={[styles.sideMenuText, activeTab === 'cars' && styles.activeSideMenuText]}>
                  Carros
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sideMenuItem, activeTab === 'reservations' && styles.activeSideMenuItem]}
                onPress={() => handleMenuNavigation('reservations')}
              >
                <MaterialIcons name="event-note" size={24} color={activeTab === 'reservations' ? '#3498db' : '#666'} />
                <Text style={[styles.sideMenuText, activeTab === 'reservations' && styles.activeSideMenuText]}>
                  Reservas
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sideMenuItem, activeTab === 'profile' && styles.activeSideMenuItem]}
                onPress={() => handleMenuNavigation('profile')}
              >
                <MaterialIcons name="person" size={24} color={activeTab === 'profile' ? '#3498db' : '#666'} />
                <Text style={[styles.sideMenuText, activeTab === 'profile' && styles.activeSideMenuText]}>
                  Perfil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    opacity: 0.8,
  },
  contentArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addCarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 30,
    minHeight: 60,
    elevation: 5,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#2980b9',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  carsGrid: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubtext: {
    color: '#6c757d',
    fontSize: 14,
    marginTop: 5,
  },
  carItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    flex: 1,
    minHeight: 160,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  carYear: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusAvailable: {
    backgroundColor: '#2ecc71',
  },
  statusReserved: {
    backgroundColor: '#f39c12',
  },
  statusSold: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  carDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  detailText: {
    color: '#6c757d',
    fontSize: 11,
    marginLeft: 6,
  },
  carImageContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  carImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  carImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carImagePlaceholderText: {
    color: '#6c757d',
    fontSize: 10,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: '#2c3e50',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  picker: {
    color: '#2c3e50',
    height: 50,
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  textAreaIcon: {
    marginTop: 5,
    marginRight: 10,
  },
  textArea: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  imagePickerContainer: {
    marginBottom: 15,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  imagePickerText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  imagePreviewContainer: {
    marginTop: 15,
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#2c3e50',
  },
  cancelButtonModal: {
    borderBottomWidth: 0,
  },
  // Estilos para tabs
  bottomTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeBottomTab: {
    // Cor será aplicada via ícone e texto
  },
  bottomTabText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  activeBottomTabText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  // Estilos para Dashboard
  dashboardContainer: {
    paddingTop: 20,
    backgroundColor: '#000',
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B00',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  revenueTitle: {
    fontSize: 18,
    color: '#FF6B00',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  revenueAmount: {
    fontSize: 28,
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  // Estilos para Carros com Fotos
  carsWithPhotosContainer: {
    paddingTop: 20,
  },
  carPhotoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  carPhotoHeader: {
    marginBottom: 15,
  },
  carPhotoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  carPhotoYear: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  carPhotoImage: {
    height: 150,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  carPhotoImageReal: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  carPhotoText: {
    color: '#6c757d',
    fontSize: 14,
    marginTop: 8,
  },
  carPhotoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carPhotoPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  carPhotoMileage: {
    fontSize: 14,
    color: '#6c757d',
  },
  // Estilos para Reservas
  reservationsContainer: {
    paddingTop: 20,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reservationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reservationStatusText: {
    color: '#f39c12',
    fontSize: 12,
    marginLeft: 5,
  },
  reservationDetails: {
    color: '#6c757d',
    fontSize: 14,
    marginBottom: 8,
  },
  reservationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 15,
  },
  reservationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelReservationButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  emptyReservations: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyReservationsText: {
    color: '#2c3e50',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyReservationsSubtext: {
    color: '#6c757d',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  reservationMessage: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 8,
    fontStyle: 'italic',
  },
  messageLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reservationDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 10,
  },
  soldBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'center',
  },
  soldBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelledBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'center',
  },
  cancelledBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Estilos para Perfil
  profileContainer: {
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileStatItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  logoutProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  logoutProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Estilos para o menu lateral
  sideMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sideMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#3498db',
  },
  sideMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeMenuButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: 20,
  },
  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeSideMenuItem: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  sideMenuText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  activeSideMenuText: {
    color: '#3498db',
    fontWeight: '600',
  },
});