import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import placeholderImg from '../../assets/favicon.png'; // Use o caminho para uma imagem padrão já existente

// Usar MediaType ao invés de MediaTypeOptions (deprecado)
const { MediaType } = ImagePicker;

// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr.onrender.com/api';

const CommentsScreen = ({ authToken }) => {
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUriError, setImageUriError] = useState(false); // Adicione estado para controlar o erro de URI

  // Buscar comentários
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments`);
      console.log('📋 Comentários recebidos:', response.data);
      setComments(response.data);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      setComments([]);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setNewComment('');
    setRating(0);
    setPhoto(null);
    setImageUriError(false); // Resetar o estado de erro de URI
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MediaType ? MediaType.Images : 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled && result.uri) {
        setPhoto(result.uri);
        setImageUriError(false); // Resetar o estado de erro de URI
      } else if (!result.cancelled && result.assets && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        setImageUriError(false); // Resetar o estado de erro de URI
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a foto: ' + error.message);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled && result.uri) {
        setPhoto(result.uri);
        setImageUriError(false); // Resetar o estado de erro de URI
      } else if (!result.cancelled && result.assets && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        setImageUriError(false); // Resetar o estado de erro de URI
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto: ' + error.message);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || rating === 0) {
      Alert.alert('Aviso', 'Por favor, digite um comentário e selecione uma avaliação.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('comment', newComment);
      formData.append('rating', rating.toString());
      
      if (photo) {
        console.log('📸 Foto selecionada:', photo);
        const filename = photo.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        
        // Na web, photo já é uma URL base64 ou blob
        if (photo.startsWith('data:') || photo.startsWith('blob:')) {
          // É base64 ou blob, passar como string
          formData.append('photo_base64', photo);
        } else {
          // É um arquivo real, passar como antes
          formData.append('photo', {
            uri: photo,
            name: filename,
            type: type,
          });
        }
      }

      console.log('📤 Enviando comentário...');
      const response = await axios.post(
        `${API_BASE_URL}/comments`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Resposta do servidor:', response.data);
      if (response.status === 201) {
        Alert.alert('Sucesso', 'Comentário enviado com sucesso!');
        setShowModal(false);
        fetchComments();
      }
    } catch (error) {
      console.error('❌ Erro ao enviar comentário:', error);
      console.error('Status:', error.response?.status);
      console.error('Dados:', error.response?.data);
      console.error('Mensagem:', error.message);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível enviar o comentário.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarPress = () => {}) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && onStarPress(star)}
          >
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={30}
              color="#FF6B00"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getCommentPhotoUri = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('data:')) return photo; // base64
    if (photo.startsWith('/uploads')) return `${API_BASE_URL.replace('/api','')}${photo}`;
    if (photo.startsWith('http')) return photo; // já absoluto
    return photo; // fallback
  };

  const renderComment = ({ item }) => {
    console.log('📸 Renderizando comentário:', item.id, '- Foto:', item.photo ? 'Sim' : 'Não');
    console.log('📸 URL da foto:', item.photo);
    
    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.user_name || 'Usuário'}</Text>
          <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
        </View>
        {renderStars(item.rating, false)}
        <Text style={styles.commentText}>{item.comment}</Text>
        {item.photo && (
          <Image 
            source={{ uri: imageUriError ? placeholderImg : getCommentPhotoUri(item.photo) }} 
            style={styles.commentPhoto} 
            resizeMode="cover"
            onError={() => setImageUriError(true)}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="comment" size={28} color="#FF6B00" />
        <Text style={styles.headerTitle}>Comentários e Avaliações</Text>
      </View>

      {/* Botão para adicionar comentário */}
      <TouchableOpacity style={styles.addCommentButton} onPress={handleOpenModal}>
        <MaterialIcons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addCommentText}>Adicionar Comentário</Text>
      </TouchableOpacity>

      {/* Comentários existentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comentários ({comments.length})</Text>
        {comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="comment" size={48} color="#666" />
            <Text style={styles.emptyText}>Ainda não há comentários</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal de adicionar comentário */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Comentário</Text>
            <Text style={styles.modalSubtitle}>Compartilhe sua experiência com a BuyCar Moz</Text>

            {/* Avaliação */}
            <Text style={styles.label}>Avaliação *</Text>
            {renderStars(rating, true, setRating)}

            {/* Comentário */}
            <Text style={styles.label}>Comentário *</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Descreva sua experiência com a BuyCar Moz..."
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Foto */}
            <Text style={styles.label}>Foto (opcional)</Text>
            {photo ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.photoPreviewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhoto(null)}>
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoOptions}>
                <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                  <MaterialIcons name="camera-alt" size={24} color="#FF6B00" />
                  <Text style={styles.photoButtonText}>Tirar foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
                  <MaterialIcons name="photo-library" size={24} color="#FF6B00" />
                  <Text style={styles.photoButtonText}>Galeria</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botões */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                onPress={handleSubmitComment}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{loading ? 'Enviando...' : 'Enviar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
    marginBottom: 15,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 12,
  },
  addCommentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  commentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    lineHeight: 20,
  },
  commentPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
    marginTop: 15,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#FF6B00',
    marginLeft: 8,
    fontWeight: '600',
  },
  photoPreview: {
    position: 'relative',
  },
  photoPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommentsScreen;