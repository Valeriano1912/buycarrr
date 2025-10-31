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

// URL do backend em produção (Render)
const API_BASE_URL = 'https://buycarrr-1.onrender.com/api';

const ReservationsScreen = ({ authToken }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.status === 200) {
        const reservationsData = response.data.reservations || [];
        setReservations(reservationsData);
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      Alert.alert('Erro', `Não foi possível carregar as reservas: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return '#f39c12';
      case 'Aprovado':
        return '#27ae60';
      case 'Rejeitado':
        return '#e74c3c';
      case 'Concluído':
        return '#3498db';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pendente':
        return 'schedule';
      case 'Aprovado':
        return 'check-circle';
      case 'Rejeitado':
        return 'cancel';
      case 'Concluído':
        return 'done-all';
      default:
        return 'help';
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

  const ReservationItem = ({ reservation }) => {
    const car = reservation.car;
    
    // Verificar se o carro existe
    if (!car) {
      console.warn('Reserva sem carro associado:', reservation.id);
      return (
        <View style={styles.reservationCard}>
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
      <TouchableOpacity 
        style={styles.reservationCard} 
        onPress={() => handleShowCarDetails(car)}
      >
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
        </View>

        <View style={styles.reservationInfo}>
          <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
          <Text style={styles.carYear}>Ano: {car.year}</Text>
          <Text style={styles.price}>{car.price.toLocaleString()} MZN</Text>
          
          <View style={styles.statusContainer}>
            <MaterialIcons 
              name={getStatusIcon(reservation.status)} 
              size={16} 
              color={getStatusColor(reservation.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
              {reservation.status}
            </Text>
          </View>
          
          {reservation.message && (
            <Text style={styles.messageText} numberOfLines={2}>
              "{reservation.message}"
            </Text>
          )}
          
          <Text style={styles.dateText}>
            Reservado em: {new Date(reservation.created_at).toLocaleDateString('pt-BR')}
          </Text>
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
          <MaterialIcons name="schedule" size={48} color="#f39c12" />
          <Text style={styles.loadingText}>Carregando reservas...</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ReservationItem reservation={item} />}
          contentContainerStyle={styles.reservationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="schedule" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nenhuma reserva encontrada</Text>
              <Text style={styles.emptySubtext}>Faça uma reserva para vê-la aqui</Text>
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
  reservationsList: {
    padding: 15,
  },
  reservationCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  carImageContainer: {
    width: 120,
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
  reservationInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
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
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  messageText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
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

export default ReservationsScreen;
