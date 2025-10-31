import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Footer = () => {
  const handlePhoneCall = () => {
    Linking.openURL('tel:+258850724566');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/258850724566');
  };

  return (
    <View style={styles.footerContainer}>
      {/* WhatsApp Contact Box */}
      <View style={styles.whatsappBox}>
        <MaterialIcons name="chat" size={24} color="#25D366" />
        <View style={styles.whatsappContent}>
          <Text style={styles.whatsappLabel}>WhatsApp</Text>
          <Text style={styles.whatsappText}>Texto Apenas</Text>
        </View>
        <Text style={styles.phoneNumber}>+258 85 072 4566</Text>
        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityText}>Seg - Sex</Text>
          <Text style={styles.availabilityText}>9:00 - 18:00 (CAT)</Text>
        </View>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>BuyCar Moz</Text>
        <MaterialIcons name="arrow-forward" size={24} color="#FF6B00" style={styles.logoArrow} />
      </View>

      {/* Contact Info */}
      <View style={styles.contactContainer}>
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Telefone:</Text>
            <TouchableOpacity onPress={handlePhoneCall}>
              <Text style={styles.contactValue}>+258 85 072 4566</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>info@buycarmoz.com</Text>
          </View>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Endereço:</Text>
            <Text style={styles.contactValue}>Mozambique, Beira</Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Por favor, note que este site não oferece vendas para clientes domésticos em Moçambique.
      </Text>

      {/* Copyright */}
      <View style={styles.copyrightBox}>
        <Text style={styles.copyrightText}>© 2025 BuyCar Moz</Text>
      </View>

      {/* Floating Chat Icon */}
      <TouchableOpacity style={styles.floatingChatButton} onPress={handleWhatsApp}>
        <MaterialIcons name="sms" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 100, // Space for floating button
  },
  whatsappBox: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whatsappContent: {
    flex: 1,
    marginLeft: 10,
  },
  whatsappLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  whatsappText: {
    color: '#999',
    fontSize: 12,
  },
  phoneNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  availabilityText: {
    color: '#999',
    fontSize: 11,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoArrow: {
    marginLeft: 10,
  },
  contactContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  contactRow: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactLabel: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  contactValue: {
    color: '#fff',
    fontSize: 14,
  },
  disclaimer: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    opacity: 0.8,
  },
  copyrightBox: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: '#FFD700',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default Footer;

