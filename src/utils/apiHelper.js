import axios from 'axios';

// Função para fazer requisição com retry automático
export const apiRequestWithRetry = async (config, maxRetries = 3, delay = 2000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}: ${config.method?.toUpperCase()} ${config.url}`);
      
      // Para endpoints que podem demorar mais (como /cars com imagens base64 grandes), aumentar timeout significativamente
      const isLargeEndpoint = config.url && config.url.includes('/cars');
      const timeout = isLargeEndpoint ? 90000 : 30000; // 90s para /cars (imagens base64 são muito grandes), 30s para outros
      
      const response = await axios({
        ...config,
        timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...config.headers,
        },
        validateStatus: (status) => status >= 200 && status < 500,
        // Para React Native, pode ajudar configurar adapter
        adapter: config.adapter || undefined,
      });
      
      console.log(`✅ Sucesso na tentativa ${attempt}`);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`❌ Tentativa ${attempt} falhou:`, error.code || error.message);
      
      // Se não for Network Error, não tenta novamente
      if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
        throw error;
      }
      
      // Se não é a última tentativa, aguarda antes de tentar novamente
      if (attempt < maxRetries) {
        // Para /cars, aumentar delay ainda mais (Render pode estar processando dados grandes)
        const currentDelay = config.url && config.url.includes('/cars') ? delay * 2 : delay;
        console.log(`⏳ Aguardando ${currentDelay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        // Aumentar delay progressivamente
        delay = delay * 1.5;
      }
    }
  }
  
  // Se todas as tentativas falharam
  throw lastError;
};

// Função para testar se o servidor está online
export const testServerConnection = async (baseURL) => {
  try {
    console.log('🔍 Testando conexão com servidor...');
    const response = await axios.get(`${baseURL}/test`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.data && response.data.message) {
      console.log('✅ Servidor está online:', response.data.message);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Servidor não respondeu ao teste:', error.message);
    return false;
  }
};

