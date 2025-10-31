import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CarBrandMenu = ({ visible, onClose, onSelectBrand }) => {
  const carBrands = [
    { id: 'Toyota', name: 'Toyota', logo: require('../LOGOS/TOYOTA LOGO.jpg'), count: 76037 },
    { id: 'Nissan', name: 'Nissan', logo: require('../LOGOS/NISSAN.jpg'), count: 37041 },
    { id: 'Honda', name: 'Honda', logo: '🚗', count: 32112 },
    { id: 'Mazda', name: 'Mazda', logo: '🚗', count: 12973 },
    { id: 'Mitsubishi', name: 'Mitsubishi', logo: '🚗', count: 11927 },
    { id: 'Subaru', name: 'Subaru', logo: '🚗', count: 9655 },
    { id: 'Suzuki', name: 'Suzuki', logo: '🚗', count: 39008 },
    { id: 'Isuzu', name: 'Isuzu', logo: require('../LOGOS/Isuzu-logo.png'), count: 5093 },
    { id: 'Daihatsu', name: 'Daihatsu', logo: '🚗', count: 30957 },
    { id: 'Hino', name: 'Hino', logo: '🚗', count: 3556 },
    { id: 'Lexus', name: 'Lexus', logo: '🚗', count: 7206 },
    { id: 'Mercedes-Benz', name: 'Mercedes-Benz', logo: require('../LOGOS/MERCEDES.jpg'), count: 19652 },
    { id: 'BMW', name: 'BMW', logo: require('../LOGOS/BMW LOGO.jpg'), count: 19833 },
    { id: 'Volkswagen', name: 'Volkswagen', logo: require('../LOGOS/VW.jpg'), count: 4971 },
    { id: 'Audi', name: 'Audi', logo: '🚗', count: 6260 },
    { id: 'Peugeot', name: 'Peugeot', logo: require('../LOGOS/peugeot.png'), count: 1625 },
    { id: 'Ford', name: 'Ford', logo: require('../LOGOS/FORD.jpg'), count: 3377 },
    { id: 'Volvo', name: 'Volvo', logo: '🚗', count: 3258 },
    { id: 'Land Rover', name: 'Land Rover', logo: require('../LOGOS/LAND ROVER.png'), count: 9046 },
    { id: 'Jaguar', name: 'Jaguar', logo: require('../LOGOS/JAGUAR LOGO.png'), count: 1002 },
    { id: 'Jeep', name: 'Jeep', logo: require('../LOGOS/JEEP.jpg'), count: 3669 },
    { id: 'Chevrolet', name: 'Chevrolet', logo: require('../LOGOS/CHEVORLET.webp'), count: 7796 },
    { id: 'Hyundai', name: 'Hyundai', logo: '🚗', count: 39425 },
  ];

  const handleSelectBrand = (brand) => {
    onSelectBrand(brand);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          {/* Header do Menu */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Marcas de Carros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Lista de Marcas */}
          <ScrollView style={styles.menuContent}>
            {carBrands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.menuItem}
                onPress={() => handleSelectBrand(brand)}
              >
                <View style={styles.brandLogoContainer}>
                  {typeof brand.logo === 'string' ? (
                    <Text style={styles.brandLogo}>{brand.logo}</Text>
                  ) : (
                    <Image source={brand.logo} style={styles.brandLogoImage} resizeMode="contain" />
                  )}
                </View>
                <View style={styles.brandInfo}>
                  <Text style={styles.menuItemText}>{brand.name}</Text>
                  <Text style={styles.brandCount}>({brand.count.toLocaleString()})</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#000',
    width: width * 0.8,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#FF6B00',
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
  brandLogo: {
    fontSize: 20,
  },
  brandLogoImage: {
    width: 30,
    height: 30,
  },
  brandInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },
  brandCount: {
    fontSize: 12,
    color: '#000',
    fontWeight: '400',
  },
});

export default CarBrandMenu;


