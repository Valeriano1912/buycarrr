import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Linking,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PhotoGallery from './PhotoGallery';
import Footer from './Footer';
import axios from 'axios';

const { width } = Dimensions.get('window');

// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr-1.onrender.com/api';

const CarDetailsClient = ({ car, onClose, onReserve, onFavorite, authToken }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationMessage, setReservationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'comments'
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [adminContact, setAdminContact] = useState({
    phone: '11999999999',
    name: 'Administrador',
    email: 'admin@buycarr.com'
  });

  if (!car) return null;

  // Processar imagens com tratamento de erro
  let images = [];
  try {
    console.log('🔍 Carro images raw:', car.images);
    console.log('🔍 Carro images type:', typeof car.images);
    
    if (car.images) {
      if (typeof car.images === 'string') {
        try {
          images = JSON.parse(car.images);
          console.log('✅ JSON parseado com sucesso');
        } catch (parseError) {
          console.error('Erro ao fazer parse das imagens:', parseError);
          images = [car.images]; // Se não for JSON válido, trata como uma string única
        }
      } else if (Array.isArray(car.images)) {
        images = car.images;
      }
      
      console.log('📸 Imagens após processamento:', images);
      
      // Garantir que images é um array antes de filtrar
      if (Array.isArray(images)) {
        // Garantir que images é um array de strings válidas
        images = images.filter(img => {
        const isValid = img && typeof img === 'string' && img.length > 0;
        if (!isValid) {
          console.log('⚠️ Imagem inválida filtrada:', img);
        }
          return isValid;
        });
      } else {
        images = [];
      }
      
      console.log('🖼️ Tipo primeira imagem:', typeof images[0], '- Tamanho:', images[0]?.length);
      console.log('📸 Quantidade de imagens:', images.length);
      if (images[0]) {
        console.log('📸 Primeira imagem preview:', images[0].substring(0, 50) + '...');
      }
    }
  } catch (error) {
    console.error('Erro ao processar imagens:', error);
    images = [];
  }
  
  console.log('🚗 Carro:', car.id, '- Imagens finais:', images.length);

  // Buscar informações de contato do administrador
  useEffect(() => {
    const fetchAdminContact = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/contact`);
        if (response.status === 200) {
          setAdminContact(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar contato do admin:', error);
        // Manter os valores padrão se houver erro
      }
    };

    fetchAdminContact();
  }, []);

  // Buscar comentários do carro
  useEffect(() => {
    const fetchComments = async () => {
      if (!car?.id) return;
      setLoadingComments(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/cars/${car.id}/comments`);
        if (response.status === 200) {
          setComments(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [car?.id]);

  // Handler para salvar comentário
  const handleSubmitComment = async () => {
    if (!newComment.trim() || rating === 0) {
      Alert.alert('Aviso', 'Por favor, digite um comentário e selecione uma avaliação.');
      return;
    }

    if (!authToken) {
      Alert.alert('Erro', 'Você precisa estar logado para comentar.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/cars/${car.id}/comments`,
        {
          comment: newComment,
          rating: rating
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        setComments([...comments, response.data]);
        setNewComment('');
        setRating(0);
        Alert.alert('Sucesso', 'Comentário adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o comentário');
    }
  };

  // Renderizar estrelas
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

  const handleOpenGallery = (index = 0) => {
    setGalleryInitialIndex(index);
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  const handleFavorite = async () => {
    if (!authToken) {
      Alert.alert('Erro', 'Token de autenticação não encontrado');
      return;
    }

    try {
      if (isFavorited) {
        // Remover dos favoritos
        await axios.delete(`${API_BASE_URL}/favorites/${car.favorite_id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        setIsFavorited(false);
        Alert.alert('Sucesso', 'Carro removido dos favoritos');
      } else {
        // Adicionar aos favoritos
        const response = await axios.post(`${API_BASE_URL}/favorites`, {
          car_id: car.id
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 201) {
          setIsFavorited(true);
          car.favorite_id = response.data.favorite_id;
          Alert.alert('Sucesso', 'Carro adicionado aos favoritos');
        }
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      if (error.response?.status === 400) {
        Alert.alert('Aviso', error.response.data.error);
      } else if (error.response?.status === 422) {
        Alert.alert('Erro', 'Dados inválidos enviados');
      } else {
        Alert.alert('Erro', 'Não foi possível gerenciar favorito');
      }
    }
  };

  const handleReserve = () => {
    setShowReservationModal(true);
  };

  const handleCreateReservation = async () => {
    if (!authToken) {
      Alert.alert('Erro', 'Token de autenticação não encontrado');
      return;
    }

    if (!car || !car.id) {
      Alert.alert('Erro', 'Informações do carro não disponíveis');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/reservations`, {
        car_id: car.id,
        message: reservationMessage
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 201) {
        Alert.alert('Sucesso', 'Reserva criada com sucesso!');
        setShowReservationModal(false);
        setReservationMessage('');
        if (onReserve) {
          onReserve();
        }
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      if (error.response?.status === 422) {
        Alert.alert('Erro', 'Dados inválidos enviados');
      } else {
        Alert.alert('Erro', 'Não foi possível criar a reserva');
      }
    }
  };

  const handleCall = () => {
    const phoneNumber = adminContact.phone;
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => {
      Alert.alert('Erro', 'Não foi possível fazer a ligação');
    });
  };

  const handleWhatsApp = () => {
    if (!car) {
      Alert.alert('Erro', 'Informações do carro não disponíveis');
      return;
    }

    // Converter para formato internacional (adicionar 258 se não tiver código do país)
    let phoneNumber = adminContact.phone;
    
    // Remover espaços e caracteres especiais
    phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Se não começar com código de país, adicionar +258 (Moçambique)
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('258')) {
        phoneNumber = '+' + phoneNumber;
      } else {
        phoneNumber = '+258' + phoneNumber;
      }
    }
    
    const message = `Olá ${adminContact.name}! Tenho interesse no ${car.brand} ${car.model} ${car.year}. Gostaria de mais informações.`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(err => {
      Alert.alert('Erro', 'WhatsApp não está instalado');
    });
  };

  return (
    <View style={styles.container}>
      {/* Botões flutuantes */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.floatingButton} onPress={onClose}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={handleFavorite}>
          <MaterialIcons 
            name={isFavorited ? "favorite" : "favorite-border"} 
            size={24} 
            color={isFavorited ? "#e74c3c" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Foto principal */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => handleOpenGallery(0)}
          disabled={images.length === 0}
        >
          {images.length > 0 ? (
            <View>
              <Image
                source={{ uri: images[0] }}
                style={styles.mainImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error('❌ Erro ao carregar imagem:', error.nativeEvent?.error || error);
                  console.error('❌ URI da imagem:', images[0]);
                }}
                onLoad={() => {
                  console.log('✅ Imagem carregada com sucesso!');
                  console.log('✅ URI da imagem:', images[0]);
                }}
              />
              {images.length > 1 && (
                <View style={styles.imageOverlay}>
                  <MaterialIcons name="zoom-in" size={30} color="#fff" />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="directions-car" size={80} color="#bdc3c7" />
              <Text style={styles.placeholderText}>Sem foto disponível</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Informações principais */}
        <View style={styles.mainInfo}>
          <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
          <Text style={styles.carYear}>Ano: {car.year}</Text>
          <Text style={styles.price}>{(car.price || 0).toLocaleString()} MZN</Text>
          
          {/* Status do carro */}
          <View style={[
            styles.statusBadge,
            car.status === 'Disponível' && styles.statusAvailable,
            car.status === 'Reservado' && styles.statusReserved,
            car.status === 'Vendido' && styles.statusSold
          ]}>
            <Text style={styles.statusText}>{car.status}</Text>
          </View>
        </View>

        {/* Especificações técnicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especificações Técnicas</Text>
          
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <MaterialIcons name="local-gas-station" size={24} color="#FF6B00" />
              <Text style={styles.specLabel}>Combustível</Text>
              <Text style={styles.specValue}>{car.fuel_type}</Text>
            </View>
            
            <View style={styles.specItem}>
              <MaterialIcons name="settings" size={24} color="#FF6B00" />
              <Text style={styles.specLabel}>Transmissão</Text>
              <Text style={styles.specValue}>{car.transmission}</Text>
            </View>
            
            <View style={styles.specItem}>
              <MaterialIcons name="speed" size={24} color="#FF6B00" />
              <Text style={styles.specLabel}>Quilometragem</Text>
              <Text style={styles.specValue}>{(car.mileage || 0).toLocaleString()} km</Text>
            </View>
            
            <View style={styles.specItem}>
              <MaterialIcons name="palette" size={24} color="#FF6B00" />
              <Text style={styles.specLabel}>Cor</Text>
              <Text style={styles.specValue}>{car.color}</Text>
            </View>
          </View>
        </View>

        {/* Descrição */}
        {car.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{car.description}</Text>
          </View>
        )}

        {/* Galeria de fotos adicionais */}
        {images.length > 1 && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => handleOpenGallery(1)}>
              <Text style={styles.sectionTitle}>Mais Fotos ({images.length - 1})</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
              {images.slice(1).map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOpenGallery(index + 1)}
                  style={styles.galleryImageContainer}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <View style={styles.galleryImageOverlay}>
                    <MaterialIcons name="zoom-in" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              Informações
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
            onPress={() => setActiveTab('comments')}
          >
            <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>
              Comentários ({comments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das Abas */}
        {activeTab === 'info' ? (
          <>
            {/* Botões de ação */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.favoriteButton, isFavorited && styles.favoriteButtonActive]} 
                onPress={handleFavorite}
              >
                <MaterialIcons 
                  name={isFavorited ? "favorite" : "favorite-border"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.buttonText}>
                  {isFavorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.reserveButton,
                  car.status !== 'Disponível' && styles.reserveButtonDisabled
                ]} 
                onPress={handleReserve}
                disabled={car.status !== 'Disponível'}
              >
                <MaterialIcons name="bookmark" size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  {car.status === 'Disponível' ? 'Reservar Carro' : car.status}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Informações de contato */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Interessado neste carro?</Text>
              <Text style={styles.contactText}>
                Entre em contato conosco para mais informações ou para agendar uma visita.
              </Text>
              
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                  <MaterialIcons name="phone" size={20} color="#FF6B00" />
                  <Text style={styles.contactButtonText}>Ligar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
                  <MaterialIcons name="message" size={20} color="#25d366" />
                  <Text style={styles.contactButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Seção de adicionar comentário */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Adicionar Comentário</Text>
              
              {/* Seleção de estrelas */}
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Avaliação:</Text>
                {renderStars(rating, true, setRating)}
              </View>

              {/* Input de comentário */}
              <TextInput
                style={styles.commentInput}
                placeholder="Digite seu comentário aqui..."
                placeholderTextColor="#666"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.submitCommentButton} onPress={handleSubmitComment}>
                <Text style={styles.submitCommentText}>Enviar Comentário</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de comentários */}
            <View style={styles.commentsListContainer}>
              <Text style={styles.sectionTitle}>Comentários ({comments.length})</Text>
              
              {loadingComments ? (
                <Text style={styles.loadingText}>Carregando comentários...</Text>
              ) : comments.length === 0 ? (
                <Text style={styles.emptyCommentsText}>Ainda não há comentários. Seja o primeiro!</Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{comment.user_name || 'Usuário'}</Text>
                      <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    {renderStars(comment.rating, false)}
                    <Text style={styles.commentText}>{comment.comment}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Footer */}
        <Footer />
      </ScrollView>

      {/* Galeria de fotos */}
      <PhotoGallery
        images={images}
        visible={showGallery}
        onClose={handleCloseGallery}
        initialIndex={galleryInitialIndex}
      />

      {/* Modal de Reserva */}
      <Modal
        visible={showReservationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReservationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fazer Reserva</Text>
            <Text style={styles.modalSubtitle}>
              Digite uma mensagem personalizada para sua reserva:
            </Text>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Ex: Gostaria de agendar uma visita para ver este carro..."
              value={reservationMessage}
              onChangeText={setReservationMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowReservationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleCreateReservation}
              >
                <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
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
  floatingButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 10,
  },
  floatingButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 70,
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#1a1a1a',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  mainInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  carYear: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 15,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusAvailable: {
    backgroundColor: '#d4edda',
  },
  statusReserved: {
    backgroundColor: '#fff3cd',
  },
  statusSold: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 15,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 10,
  },
  specLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
  gallery: {
    marginTop: 10,
  },
  galleryImageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  galleryImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  favoriteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
  },
  favoriteButtonActive: {
    backgroundColor: '#c0392b',
  },
  reserveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 10,
  },
  reserveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
    minHeight: 100,
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Estilos para Abas
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B00',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  // Estilos para Comentários
  commentSection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    color: '#FF6B00',
    fontSize: 16,
    marginRight: 15,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  commentInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  submitCommentButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitCommentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsListContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  commentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentUser: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600',
  },
  commentDate: {
    color: '#666',
    fontSize: 12,
  },
  commentText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  loadingText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  emptyCommentsText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default CarDetailsClient;
