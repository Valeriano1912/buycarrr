import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CarTypeMenu = ({ visible, onClose, onSelectCarType }) => {
  const carTypes = [
    { id: 'sedan', name: 'Sedan', icon: 'directions-car' },
    { id: 'minibus', name: 'Minibus', icon: 'airport-shuttle' },
    { id: 'bus', name: 'Bus', icon: 'directions-bus' },
    { id: 'cope', name: 'Cope', icon: 'directions-car' },
    { id: 'suv', name: 'SUV', icon: 'drive-eta' },
    { id: 'pickup', name: 'Pickup', icon: 'local-shipping' },
    { id: 'coupe', name: 'Coupé', icon: 'directions-car' },
    { id: 'off-road', name: 'Off-Road', icon: 'terrain' },
  ];

  const handleSelectType = (carType) => {
    onSelectCarType(carType);
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
            <Text style={styles.menuTitle}>Tipos de Carros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Lista de Tipos */}
          <ScrollView style={styles.menuContent}>
            {carTypes.map((carType) => (
              <TouchableOpacity
                key={carType.id}
                style={styles.menuItem}
                onPress={() => handleSelectType(carType)}
              >
                <MaterialIcons 
                  name={carType.icon} 
                  size={24} 
                  color="#3498db" 
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>{carType.name}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#bdc3c7" />
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
    backgroundColor: '#fff',
    width: width * 0.8,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    backgroundColor: '#3498db',
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
    borderBottomColor: '#ecf0f1',
  },
  menuIcon: {
    marginRight: 16,
    width: 30,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
});

export default CarTypeMenu;


