import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import Header from '../components/Header';
import CarCatalog from '../components/CarCatalog';
import FavoritesScreen from '../components/FavoritesScreen';
import ReservationsScreen from '../components/ReservationsScreen';
import ClientProfile from '../components/ClientProfile';
import Footer from '../components/Footer';
import CommentsScreen from '../components/CommentsScreen';

const ClientScreen = ({ authToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandCounts, setBrandCounts] = useState({});

  const tabs = [
    { id: 'catalog', title: 'Catálogo', icon: 'directions-car' },
    { id: 'favorites', title: 'Favoritos', icon: 'favorite' },
    { id: 'reservations', title: 'Reservas', icon: 'bookmark' },
    { id: 'comments', title: 'Comentários', icon: 'comment' },
    { id: 'profile', title: 'Perfil', icon: 'person' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return renderCatalog();
      case 'favorites':
        return renderFavorites();
      case 'reservations':
        return renderReservations();
      case 'comments':
        return renderComments();
      case 'profile':
        return renderProfile();
      default:
        return renderCatalog();
    }
  };

  const renderCatalog = () => {
    return (
      <CarCatalog 
        authToken={authToken} 
        showBrandMenu={showBrandMenu}
        onBrandMenuPress={() => setShowBrandMenu(true)}
        selectedBrand={selectedBrand}
        onClearBrandFilter={() => setSelectedBrand(null)}
      />
    );
  };

  const renderFavorites = () => {
    return <FavoritesScreen authToken={authToken} />;
  };

  const renderReservations = () => {
    return <ReservationsScreen authToken={authToken} />;
  };

  const renderProfile = () => {
    return <ClientProfile authToken={authToken} onLogout={onLogout} />;
  };

  const renderComments = () => {
    return <CommentsScreen authToken={authToken} />;
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

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setShowSideMenu(false);
    // Mudar para a aba de catálogo quando uma marca for selecionada
    setActiveTab('catalog');
  };

  // Função para buscar carros e calcular contagens por marca
  const fetchCarsAndCounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://buycarrr.onrender.com/api/cars');
      const carsData = response.data.cars || response.data;
      setCars(carsData);
      
      // Calcular contagens por marca
      const counts = {};
      carsData.forEach(car => {
        const brand = car.brand;
        counts[brand] = (counts[brand] || 0) + 1;
      });
      setBrandCounts(counts);
    } catch (error) {
      console.error('Erro ao carregar carros:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar carros quando o componente montar
  useEffect(() => {
    fetchCarsAndCounts();
  }, []);

  // Lista de marcas de carros com logos (contagens serão atualizadas dinamicamente)
  const carBrands = [
    { id: 'Toyota', name: 'Toyota', logo: require('../LOGOS/TOYOTA LOGO.jpg'), count: brandCounts['Toyota'] || 0 },
    { id: 'Nissan', name: 'Nissan', logo: require('../LOGOS/NISSAN.jpg'), count: brandCounts['Nissan'] || 0 },
    { id: 'Honda', name: 'Honda', logo: require('../LOGOS/Honda.png'), count: brandCounts['Honda'] || 0 },
    { id: 'Mazda', name: 'Mazda', logo: require('../LOGOS/Mazda.png'), count: brandCounts['Mazda'] || 0 },
    { id: 'Mitsubishi', name: 'Mitsubishi', logo: require('../LOGOS/Mitsubishi.png'), count: brandCounts['Mitsubishi'] || 0 },
    { id: 'Subaru', name: 'Subaru', logo: require('../LOGOS/subaru.png'), count: brandCounts['Subaru'] || 0 },
    { id: 'Suzuki', name: 'Suzuki', logo: require('../LOGOS/suzui.png'), count: brandCounts['Suzuki'] || 0 },
    { id: 'Isuzu', name: 'Isuzu', logo: require('../LOGOS/Isuzu-logo.png'), count: brandCounts['Isuzu'] || 0 },
    { id: 'Daihatsu', name: 'Daihatsu', logo: require('../LOGOS/Daihatsu.jpg'), count: brandCounts['Daihatsu'] || 0 },
    { id: 'Hino', name: 'Hino', logo: require('../LOGOS/Hino.jpg'), count: brandCounts['Hino'] || 0 },
    { id: 'Lexus', name: 'Lexus', logo: require('../LOGOS/Lexus.png'), count: brandCounts['Lexus'] || 0 },
    { id: 'Mercedes-Benz', name: 'Mercedes-Benz', logo: require('../LOGOS/MERCEDES.jpg'), count: brandCounts['Mercedes-Benz'] || 0 },
    { id: 'BMW', name: 'BMW', logo: require('../LOGOS/BMW LOGO.jpg'), count: brandCounts['BMW'] || 0 },
    { id: 'Volkswagen', name: 'Volkswagen', logo: require('../LOGOS/VW.jpg'), count: brandCounts['Volkswagen'] || 0 },
    { id: 'Audi', name: 'Audi', logo: require('../LOGOS/audi.jpg'), count: brandCounts['Audi'] || 0 },
    { id: 'Peugeot', name: 'Peugeot', logo: require('../LOGOS/peugeot.png'), count: brandCounts['Peugeot'] || 0 },
    { id: 'Ford', name: 'Ford', logo: require('../LOGOS/FORD.jpg'), count: brandCounts['Ford'] || 0 },
    { id: 'Volvo', name: 'Volvo', logo: require('../LOGOS/VOLVO .png'), count: brandCounts['Volvo'] || 0 },
    { id: 'Land Rover', name: 'Land Rover', logo: require('../LOGOS/LAND ROVER.png'), count: brandCounts['Land Rover'] || 0 },
    { id: 'Jaguar', name: 'Jaguar', logo: require('../LOGOS/JAGUAR LOGO.png'), count: brandCounts['Jaguar'] || 0 },
    { id: 'Jeep', name: 'Jeep', logo: require('../LOGOS/JEEP.jpg'), count: brandCounts['Jeep'] || 0 },
    { id: 'Chevrolet', name: 'Chevrolet', logo: require('../LOGOS/CHEVORLET.webp'), count: brandCounts['Chevrolet'] || 0 },
    { id: 'Hyundai', name: 'Hyundai', logo: require('../LOGOS/Hyundai-Logo-1.png'), count: brandCounts['Hyundai'] || 0 },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title="BuyCarMoz"
        showBackButton={false}
        rightIcon="logout"
        onRightPress={onLogout}
        onMenuPress={handleMenuPress}
      />
      
      {/* Content Area */}
      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.bottomTab,
              activeTab === tab.id && styles.activeBottomTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={activeTab === tab.id ? '#FF6B00' : '#999'}
            />
            <Text
              style={[
                styles.bottomTabText,
                activeTab === tab.id && styles.activeBottomTabText
              ]}
            >
              {tab.title}
            </Text>
        </TouchableOpacity>
      ))}

      </View>

      {/* Side Menu - Fora do container principal */}
      {showSideMenu && (
        <View style={styles.sideMenuOverlay}>
          <TouchableOpacity 
            style={styles.sideMenuBackdrop}
            onPress={handleCloseSideMenu}
            activeOpacity={1}
          />
          <View style={styles.sideMenu}>
            <View style={styles.sideMenuHeader}>
              <Text style={styles.sideMenuTitle}>Marcas de Carros</Text>
              <TouchableOpacity onPress={handleCloseSideMenu} style={styles.closeMenuButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sideMenuContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {carBrands.map((brand) => (
                  <TouchableOpacity 
                    key={brand.id}
                    style={styles.brandMenuItem}
                    onPress={() => handleBrandSelect(brand)}
                  >
                    <View style={styles.brandLogoContainer}>
                      {typeof brand.logo === 'string' ? (
                        <Text style={styles.brandLogoEmoji}>{brand.logo}</Text>
                      ) : (
                        <Image source={brand.logo} style={styles.brandLogoImage} resizeMode="contain" />
                      )}
                    </View>
                    <View style={styles.brandInfo}>
                      <Text style={styles.brandName}>{brand.name}</Text>
                      <Text style={styles.brandCount}>({brand.count.toLocaleString()})</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  contentArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 50,
  },
  bottomTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeBottomTab: {
    backgroundColor: '#2a2a2a',
  },
  bottomTabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  activeBottomTabText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  // Estilos para o menu lateral
  sideMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10000,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#000',
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
    backgroundColor: '#2a2a2a',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  sideMenuText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  activeSideMenuText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  // Estilos para o menu de marcas
  brandMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  brandLogoEmoji: {
    fontSize: 20,
  },
  brandLogoImage: {
    width: 30,
    height: 30,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 2,
  },
  brandCount: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '400',
  },
  // Estilos para aba de comentários
  commentsTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000',
  },
  commentsTabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginTop: 20,
    marginBottom: 15,
  },
  commentsTabText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ClientScreen;
