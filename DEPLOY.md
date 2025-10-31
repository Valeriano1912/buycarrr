# 🚀 Guia de Deploy - BuyCar Moz

Este guia explica como fazer deploy do backend (Flask) e tornar o app acessível ao docente.

---

## 📋 Pré-requisitos

- Conta no [Render](https://render.com) (gratuita) ou similar
- Projeto no GitHub
- Backend funcionando localmente

---

## 🔧 Passo 1: Preparar Backend para Deploy

### 1.1 Verificar arquivos necessários

✅ Os seguintes arquivos já foram criados:
- `Procfile` - Define como iniciar o servidor
- `runtime.txt` - Versão do Python
- `backend/requirements.txt` - Dependências Python

### 1.2 Atualizar variáveis de ambiente no Render

Ao fazer deploy no Render, configure estas variáveis de ambiente:

```
SECRET_KEY=sua-chave-secreta-super-segura
JWT_SECRET_KEY=sua-chave-jwt-secreta
FLASK_ENV=production
PORT=10000
```

**⚠️ IMPORTANTE:** Use chaves seguras aleatórias em produção!

---

## 🌐 Passo 2: Deploy no Render

### 2.1 Criar novo serviço Web

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione o repositório do projeto

### 2.2 Configurar Build e Start

**Build Command:**
```bash
cd backend && pip install -r requirements.txt
```

**Start Command:**
```bash
cd backend && python app.py
```

Ou use o Procfile (já configurado):
```
web: cd backend && python app.py
```

### 2.3 Configurações importantes

- **Instance Type:** Free (gratuito) ou $7/mês para melhor performance
- **Auto-Deploy:** Yes (atualiza automaticamente quando você faz push no GitHub)

### 2.4 Após o deploy

Render vai gerar uma URL como: `https://buycarr-backend.onrender.com`

**Copie esta URL!** Você precisará atualizar no frontend.

---

## 📱 Passo 3: Atualizar Frontend (React Native)

### 3.1 Atualizar URL da API

No arquivo `src/services/api.js`, substitua:

```javascript
const BASE_URL = 'http://10.142.136.134:5000/api';
```

Por:

```javascript
// URL do backend em produção (Render)
const BASE_URL = 'https://seu-backend.onrender.com/api';
```

### 3.2 Também atualizar em todos os componentes que usam API_BASE_URL:

- `src/components/CarCatalog.js`
- `src/components/CarDetailsClient.js`
- `src/components/CommentsScreen.js`
- `src/components/ClientProfile.js`
- `src/screens/CarManagementScreen.js`
- E outros que tenham `API_BASE_URL` hardcoded

**💡 Dica:** Crie uma variável de ambiente ou constante centralizada!

---

## 📲 Passo 4: Como o Docente Visualiza o App

### Opção A: Expo Go (Recomendado)

1. **Instalar Expo Go** no celular (iOS/Android)
2. **Publicar no Expo:**
   ```bash
   npx expo publish
   ```
3. **Compartilhar QR Code** ou link com o docente
4. Docente escaneia o QR code e abre no Expo Go

### Opção B: Link Web (Expo Web)

1. **Gerar build web:**
   ```bash
   npx expo export:web
   ```
2. **Deploy na Vercel/Netlify** (gratuito)
3. Docente acessa pelo navegador

### Opção C: Build Nativo (APK/IPA)

1. Gerar build para Android/iOS
2. Compartilhar arquivo APK (Android) ou instruções (iOS)

---

## 🔐 Passo 5: Configurar Banco de Dados (Opcional)

Se quiser usar PostgreSQL em produção (recomendado):

1. No Render, crie um **PostgreSQL Database**
2. Atualize `SQLALCHEMY_DATABASE_URI` no `app.py`:

```python
import os

# Usar PostgreSQL em produção, SQLite em desenvolvimento
if os.getenv('DATABASE_URL'):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL').replace('postgres://', 'postgresql://')
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///buycarr.db'
```

3. Adicione `DATABASE_URL` nas variáveis de ambiente do Render

---

## ✅ Checklist Final

- [ ] Backend deployado no Render
- [ ] URL da API atualizada no frontend
- [ ] Variáveis de ambiente configuradas
- [ ] Testar endpoints da API publicamente
- [ ] App publicado no Expo ou web
- [ ] Compartilhar link/QR code com docente

---

## 🐛 Troubleshooting

### Erro: "Module not found"
- Verifique se `requirements.txt` está completo
- Certifique-se que todas as dependências estão listadas

### Erro: "Port already in use"
- Render define a porta automaticamente via `PORT`
- Certifique-se que o código usa `os.getenv('PORT', 5000)`

### Imagens não aparecem
- Configure CORS corretamente no backend
- Verifique se as URLs das imagens estão absolutas
- Use `https://` nas URLs do backend em produção

---

## 📞 Suporte

Se tiver problemas, verifique:
- Logs no Render Dashboard
- Console do Expo/React Native
- Network tab do navegador (se web)

---

**🎉 Pronto! Seu app está online e acessível de qualquer lugar!**

