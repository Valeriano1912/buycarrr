# 🚗 BuyCarr - Instruções de Teste

## Configuração e Teste da Aplicação

### 1. Configurar o Backend (Python/Flask)

1. **Instalar Python** (se não estiver instalado):
   - Baixe do site oficial: https://python.org
   - Certifique-se de marcar "Add Python to PATH" durante a instalação

2. **Instalar dependências do backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Executar o servidor backend**:
   ```bash
   python app.py
   ```
   - O servidor estará rodando em: `http://localhost:5000`
   - Você verá uma mensagem confirmando que o usuário admin foi criado

### 2. Configurar o Frontend (React Native)

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar o IP da API**:
   - Abra o arquivo `src/services/api.js`
   - Substitua o IP `10.220.247.134` pelo IP da sua máquina
   - Para descobrir seu IP, execute no terminal:
     ```bash
     ipconfig
     ```
   - Procure pelo IP da sua conexão Wi-Fi (geralmente algo como 192.168.x.x ou 10.x.x.x)

3. **Executar o app**:
   ```bash
   npm start
   ```

### 3. Testar no Expo Go

1. **Instalar Expo Go** no seu celular:
   - Android: Google Play Store
   - iOS: App Store

2. **Conectar ao mesmo Wi-Fi**:
   - Certifique-se de que seu celular e computador estão na mesma rede Wi-Fi

3. **Escanear o QR Code**:
   - O terminal mostrará um QR Code
   - Abra o Expo Go e escaneie o código

### 4. Credenciais de Teste

#### Usuário Administrador Padrão:
- **Email**: `admin@buycarr.com`
- **Senha**: `admin123`

#### Para criar um usuário comum:
- Use a tela de cadastro no app
- Preencha todos os campos obrigatórios

### 5. Funcionalidades Testáveis

#### ✅ Funcionalidades Implementadas:
- [x] Tela de Login
- [x] Tela de Cadastro de Usuário
- [x] Tela de Login do Administrador
- [x] Tela Principal (usuário logado)
- [x] Dashboard do Administrador
- [x] Autenticação JWT
- [x] Persistência de login
- [x] Logout funcional

#### 🔄 Funcionalidades em Desenvolvimento:
- [ ] Catálogo de carros
- [ ] Cadastro de carros (admin)
- [ ] Busca e filtros
- [ ] Carrinho de compras
- [ ] Sistema de reservas
- [ ] Upload de imagens

### 6. Estrutura do Projeto

```
BUYCARR/
├── src/
│   ├── screens/          # Telas da aplicação
│   ├── navigation/       # Configuração de navegação
│   ├── services/         # Comunicação com API
│   ├── contexts/         # Contextos React (Auth)
│   └── components/       # Componentes reutilizáveis
├── backend/
│   ├── app.py           # Servidor Flask
│   ├── requirements.txt # Dependências Python
│   └── README.md        # Documentação do backend
└── App.js               # Arquivo principal
```

### 7. Resolução de Problemas

#### Problema: "Network Error" no app
- **Solução**: Verifique se o IP no arquivo `api.js` está correto
- **Solução**: Certifique-se de que o backend está rodando
- **Solução**: Verifique se ambos estão na mesma rede Wi-Fi

#### Problema: "Cannot connect to server"
- **Solução**: Pare o backend (Ctrl+C) e execute novamente
- **Solução**: Verifique se a porta 5000 não está sendo usada por outro programa

#### Problema: App não carrega no Expo Go
- **Solução**: Reinicie o Metro bundler (`npm start`)
- **Solução**: Limpe o cache do Expo Go
- **Solução**: Verifique se o QR Code foi escaneado corretamente

### 8. Próximos Passos

1. **Testar todas as telas** de autenticação
2. **Verificar persistência** do login
3. **Testar logout** funcional
4. **Implementar catálogo** de carros
5. **Adicionar funcionalidades** de administração

---

## 🎯 Objetivo Alcançado

✅ **Sistema de autenticação completo funcionando**
✅ **Backend Python com Flask e SQLite**
✅ **Frontend React Native com Expo**
✅ **Integração frontend-backend**
✅ **Pronto para testes no Expo Go**

A aplicação está funcionando e pronta para ser testada! 🚀


