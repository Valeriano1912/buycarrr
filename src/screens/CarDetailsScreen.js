import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PhotoGallery from '../components/PhotoGallery';
import Header from '../components/Header';

const CarDetailsScreen = ({ car, onClose, onEdit, onDelete, onCancelReservation }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  if (!car) return null;

  const images = car.images ? JSON.parse(car.images) : [];

  const handleOpenGallery = (index = 0) => {
    setGalleryInitialIndex(index);
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  const handleEdit = () => {
    onEdit(car);
  };

  const handleDelete = () => {
    onDelete(car);
  };

  const handleCancelReservation = () => {
    if (onCancelReservation) {
      onCancelReservation(car);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Detalhes do Carro"
        showBackButton={true}
        onBackPress={onClose}
      />

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
              />
              {images.length > 1 && (
                <View style={styles.imageOverlay}>
                  <MaterialIcons name="zoom-in" size={30} color="#fff" />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="image" size={60} color="#bdc3c7" />
              <Text style={styles.placeholderText}>Sem foto disponível</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Título e preço */}
        <View style={styles.titleContainer}>
          <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
          <Text style={styles.carYear}>Ano: {car.year}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{car.price.toLocaleString()} MZN</Text>
            <View style={[
              styles.statusBadge, 
              car.status === 'Disponível' && styles.statusAvailable,
              car.status === 'Reservado' && styles.statusReserved,
              car.status === 'Vendido' && styles.statusSold
            ]}>
              <Text style={styles.statusText}>{car.status}</Text>
            </View>
          </View>
        </View>

        {/* Informações básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="directions-car" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Marca:</Text>
              <Text style={styles.infoValue}>{car.brand}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="label" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Modelo:</Text>
              <Text style={styles.infoValue}>{car.model}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="date-range" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Ano:</Text>
              <Text style={styles.infoValue}>{car.year}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="speed" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Quilometragem:</Text>
              <Text style={styles.infoValue}>{car.mileage.toLocaleString()} km</Text>
            </View>
          </View>
        </View>

        {/* Especificações técnicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especificações Técnicas</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="local-gas-station" size={20} color="#e67e22" />
              <Text style={styles.infoLabel}>Combustível:</Text>
              <Text style={styles.infoValue}>{car.fuel_type}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="settings" size={20} color="#e67e22" />
              <Text style={styles.infoLabel}>Transmissão:</Text>
              <Text style={styles.infoValue}>{car.transmission}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="palette" size={20} color="#e67e22" />
              <Text style={styles.infoLabel}>Cor:</Text>
              <Text style={styles.infoValue}>{car.color}</Text>
            </View>
          </View>
        </View>

        {/* Descrição */}
        {car.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{car.description}</Text>
            </View>
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

        {/* Botões de ação */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          
          {car.status === 'Reservado' && (
            <TouchableOpacity style={styles.cancelReservationButton} onPress={handleCancelReservation}>
              <MaterialIcons name="cancel" size={20} color="#fff" />
              <Text style={styles.buttonText}>Cancelar Reserva</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Galeria de fotos */}
      <PhotoGallery
        images={images}
        visible={showGallery}
        onClose={handleCloseGallery}
        initialIndex={galleryInitialIndex}
      />
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
  },
  imageContainer: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e9ecef',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
    marginTop: 10,
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  carYear: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusAvailable: {
    backgroundColor: '#27ae60',
  },
  statusReserved: {
    backgroundColor: '#f39c12',
  },
  statusSold: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    color: '#6c757d',
    fontSize: 16,
    marginLeft: 10,
    width: 120,
  },
  infoValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  descriptionText: {
    color: '#495057',
    fontSize: 16,
    lineHeight: 24,
  },
  gallery: {
    marginTop: 10,
  },
  galleryImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  galleryImage: {
    width: 120,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#e9ecef',
  },
  galleryImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 15,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  cancelReservationButton: {
    backgroundColor: '#f39c12',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 15,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CarDetailsScreen;
