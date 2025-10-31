import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import CarDetailsClient from './CarDetailsClient';

const API_BASE_URL = 'http://10.142.136.134:5000/api';

const FavoritesScreen = ({ authToken }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.status === 200) {
        const favoritesData = response.data.favorites || [];
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Alert.alert('Erro', `Não foi possível carregar os favoritos: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/favorites/${favoriteId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.status === 200) {
        Alert.alert('Sucesso', 'Carro removido dos favoritos');
        fetchFavorites(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      Alert.alert('Erro', 'Não foi possível remover dos favoritos');
    }
  };

  const handleShowCarDetails = (car) => {
    setSelectedCar(car);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCar(null);
  };

  const CarItem = ({ car }) => {
    // Verificar se o carro existe
    if (!car) {
      console.warn('Carro undefined no favorito');
      return (
        <View style={styles.carCard}>
          <Text style={styles.errorText}>Carro não disponível</Text>
        </View>
      );
    }
    
    let images = [];
    try {
      if (car.images) {
        images = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
        images = Array.isArray(images) ? images : [];
      }
    } catch (error) {
      console.error('Erro ao parsear imagens:', error);
      images = [];
    }
    
    return (
      <TouchableOpacity style={styles.carCard} onPress={() => handleShowCarDetails(car)}>
        <View style={styles.carImageContainer}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[0] }}
              style={styles.carImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.carImagePlaceholder}>
              <MaterialIcons name="directions-car" size={40} color="#bdc3c7" />
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.removeFavoriteButton} 
            onPress={() => handleRemoveFavorite(car.favorite_id)}
          >
            <MaterialIcons name="favorite" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
          <Text style={styles.carYear}>{car.year}</Text>
          <Text style={styles.price}>{car.price.toLocaleString()} MZN</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (showDetails && selectedCar) {
    return (
      <CarDetailsClient
        car={selectedCar}
        onClose={handleCloseDetails}
        onReserve={() => {}}
        onFavorite={() => {}}
      />
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialIcons name="favorite" size={48} color="#e74c3c" />
          <Text style={styles.loadingText}>Carregando favoritos...</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => <CarItem car={item} />}
          contentContainerStyle={styles.carsGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="favorite-border" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nenhum carro favorito</Text>
              <Text style={styles.emptySubtext}>Adicione carros aos favoritos para vê-los aqui</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  carsGrid: {
    padding: 10,
  },
  carCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    margin: 5,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  carImageContainer: {
    position: 'relative',
    height: 120,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFavoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
  },
  carInfo: {
    padding: 15,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  carYear: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    padding: 20,
    textAlign: 'center',
  },
});

export default FavoritesScreen;
