# 📱 Como Compartilhar o App com o Docente

## ✅ Backend Já Está Online!
- URL: `https://buycarrr-1.onrender.com`
- Status: ✅ Funcionando

---

## 🚀 Opções para Compartilhar o App

### Opção 1: Expo Go (MAIS SIMPLES - Recomendado)

**Passo a passo:**

1. **Instale o Expo Go no celular** (iOS/Android)
   - App Store ou Play Store

2. **Inicie o servidor local:**
   ```bash
   npx expo start
   ```

3. **Escaneie o QR code:**
   - O QR code aparecerá no terminal
   - O docente escaneia com o Expo Go
   - **OBS:** Você e o docente precisam estar na mesma rede Wi-Fi OU usar túnel

4. **Para funcionar em redes diferentes (túnel):**
   ```bash
   npx expo start --tunnel
   ```
   Isso cria um link que funciona de qualquer lugar!

---

### Opção 2: Expo Web (Acessar pelo Navegador)

1. **Inicie o servidor web:**
   ```bash
   npx expo start --web
   ```

2. **Acesse no navegador:**
   - Um link aparecerá (geralmente `http://localhost:19006`)
   - Para compartilhar externamente, use túnel:
   ```bash
   npx expo start --web --tunnel
   ```

3. **Compartilhe o link gerado** com o docente

---

### Opção 3: EAS Update (Atualização Over-the-Air)

**Requer configuração inicial:**

1. **Instale EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure o projeto:**
   ```bash
   eas build:configure
   eas update:configure
   ```

3. **Publique atualização:**
   ```bash
   eas update --branch production --message "Versão inicial"
   ```

4. **O docente usa o Expo Go** e escaneia o QR code do projeto

**⚠️ Mais complexo, mas permite atualizações sem rebuild**

---

### Opção 4: Build Nativo (APK/IPA)

**Para distribuição permanente:**

1. **Configure EAS:**
   ```bash
   npm install -g eas-cli
   eas build:configure
   ```

2. **Faça login:**
   ```bash
   eas login
   ```

3. **Gere build Android:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Gere build iOS (se necessário):**
   ```bash
   eas build --platform ios --profile preview
   ```

5. **Baixe e compartilhe o arquivo** (APK para Android)

---

## 🎯 Recomendação para Docente

### Método Mais Simples:

**Use Expo Go + Túnel:**

```bash
npx expo start --tunnel
```

Isso gera um link que funciona de qualquer lugar, sem precisar estar na mesma rede!

**Vantagens:**
- ✅ Não precisa publicar
- ✅ Funciona de qualquer lugar
- ✅ Fácil de compartilhar (apenas um QR code)
- ✅ Não requer build

**Desvantagens:**
- ⚠️ Precisa do servidor local rodando enquanto o docente usa
- ⚠️ Pode ser um pouco mais lento (usa túnel)

---

## 📋 Passo a Passo Completo (Recomendado)

### Para você (desenvolvedor):

1. **Inicie o servidor com túnel:**
   ```bash
   npx expo start --tunnel
   ```

2. **Anote o link gerado** (algo como `exp://...`)

3. **Compartilhe com o docente:**
   - Envie o QR code (imagem)
   - OU envie o link direto

### Para o docente:

1. **Instale Expo Go** no celular
2. **Abra o Expo Go**
3. **Escaneie o QR code** OU cole o link
4. **O app abre automaticamente!**

---

## 🔧 Alternativa: Deploy Web

Se quiser que o docente acesse pelo navegador:

1. **Gere build web:**
   ```bash
   npx expo export:web
   ```

2. **Deploy na Vercel (grátis):**
   - Acesse: https://vercel.com
   - Conecte seu GitHub
   - Deploy automático da pasta `web-build/`

3. **Compartilhe o link gerado** com o docente

---

## ✅ Resumo Rápido

**Mais fácil para o docente:**
```
npx expo start --tunnel
```
→ Compartilhe QR code → Docente escaneia no Expo Go

**Melhor para produção:**
```
eas build --platform android
```
→ Gere APK → Compartilhe arquivo → Instala no Android

**Para web:**
```
npx expo export:web
```
→ Deploy na Vercel → Compartilhe link

---

**Qual método você prefere usar?**

