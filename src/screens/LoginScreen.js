import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    console.log('🔵 Iniciando processo de login...');
    console.log('📧 Email:', email);
    console.log('🔑 Função login existe?', typeof login);
    
    try {
      console.log('⏳ Chamando função login...');
      const result = await login(email, password);
      console.log('✅ Função login retornou');
      console.log('📦 Tipo do result:', typeof result);
      console.log('🔵 Resultado do login:', JSON.stringify(result, null, 2));
      
      if (result && result.success) {
        console.log('✅ Navegando para Main...');
        navigation.navigate('Main');
      } else {
        const errorMessage = result?.error || 'Erro desconhecido ao fazer login. Tente novamente.';
        console.log('❌ Erro no login:', errorMessage);
        Alert.alert('Erro no Login', errorMessage);
      }
    } catch (error) {
      console.error('❌ Exceção no login:', error);
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    }
  };

  const handleAdminLogin = () => {
    navigation.navigate('AdminLogin');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../LOGOS/TELALOGINA.jpg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>BuyCarr</Text>
          <Text style={styles.subtitle}>Encontre o carro dos seus sonhos</Text>
        </View>

        <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Entrar</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={handleAdminLogin}
        >
          <Text style={styles.adminButtonText}>Área do Administrador</Text>
        </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  formContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#FF6B00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B00',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  registerButtonText: {
    color: '#FF6B00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  adminButtonText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
