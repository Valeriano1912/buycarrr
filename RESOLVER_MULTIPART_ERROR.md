# 🔧 Resolver "Error while reading multipart response"

## 🐛 Problema

O erro "Error while reading multipart response" com código 200 geralmente indica:
- **Cache corrompido** do Metro bundler
- **Problema com hot reload** do Expo
- **Bundler travado** ou em estado inconsistente

## ✅ Solução Rápida

### Passo 1: Parar o servidor
No terminal, pressione `Ctrl+C` para parar o Expo.

### Passo 2: Limpar cache
```bash
npx expo start --clear
```

OU

```bash
# Limpar cache do Metro bundler
npx expo start -c
```

### Passo 3: Se ainda não funcionar
```bash
# Limpar tudo
npm start -- --reset-cache

# OU
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

## 🔄 Alternativa: Reiniciar completamente

1. **Parar o servidor** (`Ctrl+C`)
2. **Limpar cache do Metro:**
   ```bash
   watchman watch-del-all
   rm -rf node_modules
   npm install
   ```
3. **Reiniciar:**
   ```bash
   npx expo start --clear
   ```

## 📱 No App

Se aparecer o erro novamente:
- Pressione **"RELOAD (R, R)"** no app
- OU sacuda o dispositivo e toque em "Reload"
- OU pressione `r` no terminal do Expo

---

**Esse erro não afeta seu código, é apenas um problema do bundler!**

