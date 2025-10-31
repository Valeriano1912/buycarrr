import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Header = ({ 
  title = "BuyCarMoz", 
  showBackButton = false, 
  onBackPress = null,
  rightIcon = null,
  onRightPress = null,
  backgroundColor = "#000",
  showMenuButton = true,
  onMenuPress = null,
  showBrandMenu = false,
  onBrandMenuPress = null
}) => {
  return (
    <>
      <StatusBar backgroundColor={backgroundColor} barriumStyle="light-content" />
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : showMenuButton ? (
            <View style={styles.menuContainer}>
              <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                <MaterialIcons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
              {showBrandMenu && (
                <TouchableOpacity onPress={onBrandMenuPress} style={styles.brandMenuButton}>
                  <MaterialIcons name="directions-car" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        
        <View style={styles.rightContainer}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
              <MaterialIcons name={rightIcon} size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  menuButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMenuButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginLeft: 8,
  },
  rightButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
});

export default Header;
