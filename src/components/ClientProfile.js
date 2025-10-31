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

// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr-1.onrender.com/api';

const ClientProfile = ({ authToken, onLogout }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: null,
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(authToken);
  const [isEditing, setIsEditing] = useState(false);

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
              name: userData.name || '',
              email: userData.email || '',
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto.');
        return;
      }

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
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        profile_photo: profileData.profilePhoto,
      };

      const response = await axios.put(`${API_BASE_URL}/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        setIsEditing(false);
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <View style={styles.container}>
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
            
            {isEditing && (
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={handleChangePhoto}
              >
                <MaterialIcons name="camera-alt" size={20} color="#fff" />
                <Text style={styles.changePhotoText}>Alterar Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Seção de Informações */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditToggle}
            >
              <MaterialIcons 
                name={isEditing ? "close" : "edit"} 
                size={20} 
                color={isEditing ? "#e74c3c" : "#FF6B00"} 
              />
              <Text style={[styles.editButtonText, { color: isEditing ? "#e74c3c" : "#FF6B00" }]}>
                {isEditing ? "Cancelar" : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Digite seu nome"
              placeholderTextColor="#666"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={profileData.email}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
              placeholder="Digite seu email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Telefone</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={profileData.phone}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
              placeholder="Digite seu telefone"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>
        </View>

        {/* Botão Salvar */}
        {isEditing && (
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
        )}

        {/* Botão de Sair */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={onLogout}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  photoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2a2a2a',
    borderWidth: 4,
    borderColor: '#FF6B00',
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#333',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
    color: '#999',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B00',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#2a2a2a',
    color: '#666',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2.22,
    marginBottom: 20,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ClientProfile;
