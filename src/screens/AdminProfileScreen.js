import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

// Configuração da API
// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr-1.onrender.com/api';

const AdminProfileScreen = ({ onClose, authToken }) => {
  const [profileData, setProfileData] = useState({
    name: 'Administrador',
    email: 'admin@buycarmoz.com',
    phone: '',
    profilePhoto: null,
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(authToken);

  useEffect(() => {
    const initializeToken = async () => {
      if (!token) {
        try {
          const storedToken = await AsyncStorage.getItem('authToken');
          if (storedToken) {
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Erro ao carregar token:', error);
        }
      }
    };
    initializeToken();
  }, [token]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.status === 200 && response.data.user) {
            const userData = response.data.user;
            setProfileData({
              name: userData.name || 'Administrador',
              email: userData.email || 'admin@buycarmoz.com',
              phone: userData.phone || '',
              profilePhoto: userData.profile_photo || null,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do perfil:', error);
        }
      }
    };
    loadProfileData();
  }, [token]);

  const handleChangePhoto = async () => {
    try {
      // Solicitar permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto.');
        return;
      }

      // Mostrar opções de imagem
      Alert.alert(
        'Alterar Foto do Perfil',
        'Escolha uma opção',
        [
          {
            text: 'Galeria',
            onPress: () => pickImageFromGallery(),
          },
          {
            text: 'Câmera',
            onPress: () => takePhoto(),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: result.assets[0].uri,
        }));
        Alert.alert('Sucesso', 'Foto do perfil atualizada!');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar uma foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: result.assets[0].uri,
        }));
        Alert.alert('Sucesso', 'Foto do perfil atualizada!');
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      Alert.alert('Erro', 'Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    try {
      // Preparar dados para envio
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        profile_photo: profileData.profilePhoto, // URI da imagem
      };

      console.log('Enviando dados do perfil:', updateData);
      console.log('Token disponível:', token ? 'Sim' : 'Não');

      // Fazer requisição para atualizar perfil
      const response = await axios.put(`${API_BASE_URL}/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        console.log('Perfil atualizado:', response.data);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      if (error.response) {
        Alert.alert('Erro', `Erro do servidor: ${error.response.data.message || 'Erro desconhecido'}`);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar as alterações. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Perfil do Administrador"
        showBackButton={true}
        onBackPress={onClose}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção da Foto do Perfil */}
        <View style={styles.profileSection}>
          <View style={styles.photoContainer}>
            {profileData.profilePhoto ? (
              <Image 
                source={{ uri: profileData.profilePhoto }} 
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="person" size={60} color="#bdc3c7" />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
            >
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
              <Text style={styles.changePhotoText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Informações */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Digite seu nome"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
              placeholder="Digite seu email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
              placeholder="Digite seu telefone"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <MaterialIcons name="save" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  photoContainer: {
    alignItems: 'center',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdminProfileScreen;
