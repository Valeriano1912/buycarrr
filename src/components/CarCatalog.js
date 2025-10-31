import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import CarDetailsClient from './CarDetailsClient';
import CarTypeMenu from './CarTypeMenu';
import CarBrandMenu from './CarBrandMenu';
import Footer from './Footer';

const API_BASE_URL = 'http://10.142.136.134:5000/api';

/**
 * Transforma o path salvo no banco para a URL real do backend.
 * - Exemplo: '/uploads/xyz.jpg' → 'http://10.142.136.134:5000/uploads/xyz.jpg'
 * - Retorna base64 direto.
 * - Se faltar a imagem, retorna um placeholder ONLINE (compatível com web, mobile, expo, etc). 
 *   Usar require gera erro de build caso o arquivo n	o exista ou n	ao seja suportado no bundle web.
 */
const getCarImageUrl = (img) => {
  if (!img) return 'https://via.placeholder.com/250x150?text=Sem+Imagem'; // Usar placeholder universal seguro
  if (img.startsWith('data:')) return img; // Caso especial: base64
  if (img.startsWith('/uploads')) return `http://10.142.136.134:5000${img}`; // Path do backend
  if (img.startsWith('http')) return img; // J 1 um link absoluto
  return 'https://via.placeholder.com/250x150?text=Sem+Imagem'; // fallback seguro
};

const CarCatalog = ({ authToken, showBrandMenu = false, onBrandMenuPress = null, selectedBrand = null, onClearBrandFilter = null }) => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCarTypeMenu, setShowCarTypeMenu] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [showCarBrandMenu, setShowCarBrandMenu] = useState(false);
  const [selectedBrandState, setSelectedBrandState] = useState(null);
  const [showAllNormal, setShowAllNormal] = useState(false); // Estado para mostrar todos os carros normais
  const [showAllPremium, setShowAllPremium] = useState(false); // Estado para mostrar todos os carros premium
  const [showAllPickup, setShowAllPickup] = useState(false); // Estado para mostrar todas as camionetas
  const [showAllBus, setShowAllBus] = useState(false); // Estado para mostrar todos os ônibus

  // Países e suas marcas associadas
  const countryBrands = {
    'Japan': ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki'],
    'Korea': ['Hyundai', 'Kia'],
    'Germany': ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche'],
    'USA': ['Ford', 'Chevrolet', 'Cadillac', 'Buick'],
    'Italy': ['Ferrari', 'Lamborghini', 'Fiat', 'Alfa Romeo'],
    'France': ['Peugeot', 'Renault', 'Citroën'],
    'UK': ['Land Rover', 'Jaguar', 'Mini', 'Rolls-Royce'],
    'Singapore': ['Toyota', 'Honda', 'BMW'], // Adicionando Singapore
    'UAE': ['Toyota', 'Nissan', 'BMW'], // Adicionando UAE
    'Thailand': ['Toyota', 'Honda', 'Nissan'], // Adicionando Thailand
  };

  const countryFlags = {
    'Japan': '🇯🇵',
    'Korea': '🇰🇷',
    'Germany': '🇩🇪',
    'USA': '🇺🇸',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'UK': '🇬🇧',
    'Singapore': '🇸🇬',
    'UAE': '🇦🇪',
    'Thailand': '🇹🇭',
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (Array.isArray(cars)) {
      filterCars();
    } else {
      // Se não há carros ainda, mostrar array vazio
      setFilteredCars([]);
    }
  }, [cars, searchQuery, selectedBrand, selectedCountry, selectedBrandState]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/cars`);
      
      // A API retorna {cars: [...]}, então precisamos acessar response.data.cars
      const carsData = response.data.cars || response.data;
      console.log('📦 Carros carregados:', carsData.length);
      // Log de amostra para debug
      if (carsData.length > 0) {
        console.log('🔍 Primeiro carro (amostra):', {
          id: carsData[0].id,
          brand: carsData[0].brand,
          model: carsData[0].model,
          imagesRaw: carsData[0].images,
          imagesType: typeof carsData[0].images
        });
      }
      setCars(carsData);
    } catch (error) {
      console.error('Erro ao carregar carros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os carros');
    } finally {
      setLoading(false);
    }
  };

  const filterCars = () => {
    // Verificar se cars é um array antes de filtrar
    if (!Array.isArray(cars) || cars.length === 0) {
      setFilteredCars([]);
      return;
    }

    let filtered = [...cars];

    // Filtro por marca específica (prioridade para marca selecionada no menu hamburger)
    if (selectedBrand && selectedBrand.name) {
      filtered = filtered.filter(car => car.brand === selectedBrand.name);
    } else if (selectedBrandState && selectedBrandState.name) {
      filtered = filtered.filter(car => car.brand === selectedBrandState.name);
    }

    // Filtro por país
    if (selectedCountry && selectedCountry.trim() !== '') {
      const countryBrandList = countryBrands[selectedCountry] || [];
      filtered = filtered.filter(car =>
        countryBrandList.some(brand => 
          car.brand.toLowerCase() === brand.toLowerCase()
        )
      );
    }

    // Filtro por busca
    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(car =>
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.year.toString().includes(searchQuery) ||
        car.price.toString().includes(searchQuery)
      );
    }

    setFilteredCars(filtered);
  };

  // Separar por categorias: carros normais, premium, camionetas e ônibus
  const getCarsByCategory = () => {
    if (!Array.isArray(filteredCars)) return { 
      normalCars: [], 
      premiumCars: [], 
      pickupTrucks: [], 
      buses: [] 
    };
    
    console.log('🔍 Total de carros filtrados:', filteredCars.length);
    
    const normalCars = filteredCars.filter(car => {
      const carType = car.car_type ? car.car_type.toLowerCase() : '';
      const isTruck = carType.includes('truck') || carType.includes('camioneta');
      const isBus = carType.includes('bus') || carType.includes('ônibus');
      return car.price < 1000000 && !isTruck && !isBus;
    });
    
    const premiumCars = filteredCars.filter(car => {
      const carType = car.car_type ? car.car_type.toLowerCase() : '';
      const isTruck = carType.includes('truck') || carType.includes('camioneta');
      const isBus = carType.includes('bus') || carType.includes('ônibus');
      return car.price >= 1000000 && !isTruck && !isBus;
    });
    
    const pickupTrucks = filteredCars.filter(car => {
      const carType = car.car_type ? car.car_type.toLowerCase() : '';
      return carType.includes('truck') || carType.includes('camioneta');
    });
    
    const buses = filteredCars.filter(car => {
      const carType = car.car_type ? car.car_type.toLowerCase() : '';
      return carType.includes('bus') || carType.includes('ônibus');
    });
    
    console.log('📊 Carros por categoria:', {
      normalCars: normalCars.length,
      premiumCars: premiumCars.length,
      pickupTrucks: pickupTrucks.length,
      buses: buses.length
    });
    
    return { normalCars, premiumCars, pickupTrucks, buses };
  };

  const handleCountryFilter = (country) => {
    // Se o país já está selecionado, deseleciona
    if (selectedCountry === country) {
      setSelectedCountry('');
      setSelectedBrandState('');
    } else {
      // Seleciona o país e filtra por suas marcas
      setSelectedCountry(country);
      setSelectedBrandState(''); // Limpa filtro de marca específica
    }
  };

  // Função para buscar carros por tipo
  const handleCarTypeFilter = async (carType) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cars/type/${carType.id}`);
      
      if (response.status === 200) {
        setCars(response.data.cars || []);
        setSelectedCarType(carType);
        setSelectedCountry(null); // Limpar filtro de país
        setSelectedBrandState(''); // Limpar filtro de marca
      }
    } catch (error) {
      console.error('Erro ao buscar carros por tipo:', error);
      Alert.alert('Erro', 'Não foi possível buscar carros por tipo');
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar filtro de tipo
  const clearCarTypeFilter = () => {
    setSelectedCarType(null);
    fetchCars(); // Recarregar todos os carros
  };

  // Função para lidar com seleção de marca
  const handleBrandSelect = (brand) => {
    setSelectedBrandState(brand);
    setSelectedCarType(null); // Limpar filtro de tipo
    setSelectedCountry(''); // Limpar filtro de país
  };

  // Função para limpar filtro de marca
  const clearBrandFilter = () => {
    setSelectedBrandState(null);
    fetchCars(); // Recarregar todos os carros
  };

  const handleShowCarDetails = (car) => {
    setSelectedCar(car);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCar(null);
  };

  const handleFavorite = (car, isFavorited) => {
    // Aqui você pode implementar a lógica para salvar/remover favoritos
    console.log('Favoritar carro:', car.id, isFavorited);
  };

  const handleReserve = (car) => {
    Alert.alert(
      'Reservar Carro',
      `Deseja reservar o ${car.brand} ${car.model}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reservar', 
          onPress: () => {
            // Aqui você pode implementar a lógica de reserva
            console.log('Reservar carro:', car.id);
            Alert.alert('Sucesso', 'Carro reservado com sucesso!');
          }
        }
      ]
    );
  };

  // CarItem exibindo imagem na ESQUERDA e informações na DIREITA
  const CarItem = ({ car, isPremium = false }) => {
    let images = [];
    try {
      let imagesData = car.images;
      if (typeof imagesData === 'string') {
        try {
          imagesData = JSON.parse(imagesData);
        } catch (parseError) {
          imagesData = [];
        }
      }
      imagesData = Array.isArray(imagesData) ? imagesData : [];
      images = imagesData.map(img => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object') return img.uri || img.path || String(img);
        return String(img);
      }).filter(img => img && img.length > 0);
    } catch (error) {
      images = [];
    }
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Novo layout: flexDirection row (imagem esquerda, info direita)
    return (
      <TouchableOpacity style={[styles.carCard, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => handleShowCarDetails(car)}>
        {/* Imagem Esquerda */}
        <View style={{ width: 110, height: 80, marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
          {images.length > 0 && !imageError ? (
            <Image
              source={{ uri: getCarImageUrl(images[0]) }}
              style={{ width: 110, height: 80, borderRadius: 8 }}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.carImagePlaceholder, { width: 110, height: 80 }]}>
              <MaterialIcons name="directions-car" size={40} color="#FF6B00" />
            </View>
          )}
        </View>
        {/* Informações Direita */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.carTitle}>{car.brand} {car.model} {car.year || ''}</Text>
          <Text style={styles.carDetails}>{car.fuel_type} • {car.mileage ? (car.mileage / 1000).toFixed(0) + 'k km' : 'N/A'}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.price}>{car.price.toLocaleString()} MZN</Text>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
            {/* Ícone de favoritar (opcional) */}
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={e => { setIsFavorite(!isFavorite); e.stopPropagation && e.stopPropagation(); }}>
              <MaterialIcons 
                name={isFavorite ? "favorite" : "favorite-border"} 
                size={22} 
                color={isFavorite ? "#e74c3c" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
          {/* Badges premium/status */}
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            {car.status === 'Vendido' && (
              <Text style={{ backgroundColor: '#e74c3c', color: '#fff', fontSize: 10, fontWeight: 'bold', borderRadius: 4, paddingHorizontal: 5, marginRight: 4 }}>VENDIDO</Text>
            )}
            {isPremium && car.status !== 'Vendido' && (
              <Text style={{ backgroundColor: '#f39c12', color: '#fff', fontSize: 10, fontWeight: 'bold', borderRadius: 4, paddingHorizontal: 5, marginRight: 4 }}>PREMIUM</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (showDetails && selectedCar) {
    return (
      <CarDetailsClient
        car={selectedCar}
        onClose={handleCloseDetails}
        onReserve={handleReserve}
        onFavorite={handleFavorite}
        authToken={authToken}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={18} color="#FF6B00" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por marca, modelo, ano ou preço..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={fetchCars} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={18} color="#FF6B00" />
        </TouchableOpacity>
        
        {/* Botão para abrir menu de tipos de carro */}
        <TouchableOpacity 
          style={styles.carTypeButton} 
          onPress={() => setShowCarTypeMenu(true)}
        >
          <MaterialIcons name="filter-list" size={18} color="#FF6B00" />
          <Text style={styles.carTypeButtonText}>Tipos</Text>
        </TouchableOpacity>

        {/* Botão para abrir menu de marcas de carro */}
        {showBrandMenu && (
          <TouchableOpacity 
            style={[styles.carBrandButton, (selectedBrand || selectedBrandState) && styles.activeCarBrandButton]} 
            onPress={onBrandMenuPress}
          >
            <MaterialIcons name="directions-car" size={18} color={(selectedBrand || selectedBrandState) ? "#fff" : "#FF6B00"} />
            <Text style={[styles.carBrandButtonText, (selectedBrand || selectedBrandState) && styles.activeCarBrandButtonText]}>
              {(selectedBrand || selectedBrandState) ? (selectedBrand?.name || selectedBrandState?.name) : 'Marcas'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botão para limpar filtro de marca */}
        {(selectedBrand || selectedBrandState) && (
          <TouchableOpacity 
            style={styles.clearBrandButton} 
            onPress={() => {
              clearBrandFilter();
              if (onClearBrandFilter) {
                onClearBrandFilter();
              }
            }}
          >
            <MaterialIcons name="clear" size={18} color="#999" />
            <Text style={styles.clearBrandButtonText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* Lista de Carros */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialIcons name="refresh" size={48} color="#3498db" />
          <Text style={styles.loadingText}>Carregando carros...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {(() => {
            const { normalCars, premiumCars, pickupTrucks, buses } = getCarsByCategory();
            
            return (
              <>
                {/* Carros Normais */}
                {normalCars.length > 0 && (
                  <View style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryTitle}>Carros Disponíveis</Text>
                      <Text style={styles.categoryCount}>({normalCars.length} carros)</Text>
                    </View>
                    <View style={styles.carsGrid}>
                      {(showAllNormal ? normalCars : normalCars.slice(0, 6)).map((car) => (
                        // Remove width fixa, deixa CarItem ocupar 100% (um por linha vertical)
                        <CarItem key={car.id} car={car} style={{ width: '100%' }} />
                      ))}
                    </View>
                    {normalCars.length > 6 && (
                      <TouchableOpacity 
                        style={styles.seeMoreButton} 
                        onPress={() => setShowAllNormal(!showAllNormal)}
                      >
                        <Text style={styles.seeMoreText}>
                          {showAllNormal ? 'Ver menos' : `Ver mais (${normalCars.length - 6} carros)`}
                        </Text>
                        <MaterialIcons 
                          name={showAllNormal ? "expand-less" : "expand-more"} 
                          size={20} 
                          color="#FF6B00" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Carros de Primeira Classe */}
                {premiumCars.length > 0 && (
                  <View style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.premiumHeader}>
                        <MaterialIcons name="star" size={20} color="#FF6B00" />
                        <Text style={styles.premiumTitle}>Carros de Primeira Classe</Text>
                      </View>
                      <Text style={styles.categoryCount}>({premiumCars.length} carros)</Text>
                    </View>
                    <View style={styles.carsGrid}>
                      {(showAllPremium ? premiumCars : premiumCars.slice(0, 6)).map((car) => (
                        <CarItem key={car.id} car={car} isPremium={true} />
                      ))}
                    </View>
                    {premiumCars.length > 6 && (
                      <TouchableOpacity 
                        style={styles.seeMoreButton} 
                        onPress={() => setShowAllPremium(!showAllPremium)}
                      >
                        <Text style={styles.seeMoreText}>
                          {showAllPremium ? 'Ver menos' : `Ver mais (${premiumCars.length - 6} carros)`}
                        </Text>
                        <MaterialIcons 
                          name={showAllPremium ? "expand-less" : "expand-more"} 
                          size={20} 
                          color="#FF6B00" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Camionetas */}
                {pickupTrucks.length > 0 && (
                  <View style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.premiumHeader}>
                        <MaterialIcons name="local-shipping" size={20} color="#FF6B00" />
                        <Text style={styles.premiumTitle}>Camionetas</Text>
                      </View>
                      <Text style={styles.categoryCount}>({pickupTrucks.length} {pickupTrucks.length === 1 ? 'veículo' : 'veículos'})</Text>
                    </View>
                    <View style={styles.carsGrid}>
                      {(showAllPickup ? pickupTrucks : pickupTrucks.slice(0, 6)).map((car) => (
                        <CarItem key={car.id} car={car} />
                      ))}
                    </View>
                    {pickupTrucks.length > 6 && (
                      <TouchableOpacity 
                        style={styles.seeMoreButton} 
                        onPress={() => setShowAllPickup(!showAllPickup)}
                      >
                        <Text style={styles.seeMoreText}>
                          {showAllPickup ? 'Ver menos' : `Ver mais (${pickupTrucks.length - 6} veículos)`}
                        </Text>
                        <MaterialIcons 
                          name={showAllPickup ? "expand-less" : "expand-more"} 
                          size={20} 
                          color="#FF6B00" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Ônibus */}
                {buses.length > 0 && (
                  <View style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <View style={styles.premiumHeader}>
                        <MaterialIcons name="airport-shuttle" size={20} color="#FF6B00" />
                        <Text style={styles.premiumTitle}>Ônibus</Text>
                      </View>
                      <Text style={styles.categoryCount}>({buses.length} {buses.length === 1 ? 'veículo' : 'veículos'})</Text>
                    </View>
                    <View style={styles.carsGrid}>
                      {(showAllBus ? buses : buses.slice(0, 6)).map((car) => (
                        <CarItem key={car.id} car={car} />
                      ))}
                    </View>
                    {buses.length > 6 && (
                      <TouchableOpacity 
                        style={styles.seeMoreButton} 
                        onPress={() => setShowAllBus(!showAllBus)}
                      >
                        <Text style={styles.seeMoreText}>
                          {showAllBus ? 'Ver menos' : `Ver mais (${buses.length - 6} veículos)`}
                        </Text>
                        <MaterialIcons 
                          name={showAllBus ? "expand-less" : "expand-more"} 
                          size={20} 
                          color="#FF6B00" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Mensagem quando não há carros */}
                {normalCars.length === 0 && premiumCars.length === 0 && pickupTrucks.length === 0 && buses.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="directions-car" size={48} color="#bdc3c7" />
                    <Text style={styles.emptyText}>
                      {cars.length === 0 ? 'Nenhum carro cadastrado' : 'Nenhum carro encontrado'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {cars.length === 0 ? 'Adicione carros ao catálogo' : 'Tente ajustar os filtros de busca'}
                    </Text>
                  </View>
                )}
              </>
            );
          })()}
          
          {/* Footer */}
          <Footer />
        </ScrollView>
      )}

      {/* Menu de Tipos de Carro */}
      <CarTypeMenu
        visible={showCarTypeMenu}
        onClose={() => setShowCarTypeMenu(false)}
        onSelectCarType={handleCarTypeFilter}
      />

      {/* Menu de Marcas de Carro */}
      <CarBrandMenu
        visible={showCarBrandMenu}
        onClose={() => setShowCarBrandMenu(false)}
        onSelectBrand={handleBrandSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  
    color: '#FF6B00',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  countryFilters: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  countryScrollContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#333',
    marginRight: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeCountryFilter: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
    borderWidth: 2,
  },
  flagText: {
    fontSize: 20,
    marginRight: 4,
  },
  countryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  activeCountryText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  refreshButton: {
    padding: 3,
    marginLeft: 8,
  },
  carTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginLeft: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  carTypeButtonText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '500',
  },
  carBrandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginLeft: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  carBrandButtonText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '500',
  },
  activeCarBrandButton: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  activeCarBrandButtonText: {
    color: '#fff',
  },
  clearBrandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginLeft: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  clearBrandButtonText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
  },
  carsGrid: {
    paddingVertical: 4,
    // paddingHorizontal: 10, <-- opcional, deixar
    // flexDirection: 'column', <-- padrão
    // justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 15,
  },
  carCard: {
    backgroundColor: '#1a1a1a',
    marginVertical: 4, // margem apenas cima/baixo
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    width: '100%', // ocupa a linha inteira
    minHeight: 90, // garantir boa altura
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  carImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
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
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
  },
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  soldOverlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  carInfo: {
    padding: 8,
    minHeight: 75,
  },
  brandLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  carDetails: {
    fontSize: 9,
    color: '#999',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  actionButton: {
    backgroundColor: '#FF6B00',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offersButtonText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#6c757d',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  // Estilos para categorias
  categorySection: {
    marginBottom: 10,
    marginTop: 5,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#151515',
    borderRadius: 8,
    marginBottom: 6,
    marginHorizontal: 10,
    marginTop: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginLeft: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#FF6B00',
    borderRadius: 8,
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  // Estilos para indicador premium
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f39c12',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default CarCatalog;
