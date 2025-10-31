# 🔧 Solução Definitiva - Render Dashboard

## ⚠️ Problema

O Render está ignorando o Procfile e executando `gunicorn app:app` na raiz, mas o `app.py` está em `backend/`.

---

## ✅ SOLUÇÃO: Configurar no Render Dashboard

### Passo a Passo:

1. **Acesse o Render Dashboard**
   - Vá em: https://dashboard.render.com
   - Clique no seu serviço Web

2. **Vá em "Settings"**

3. **Encontre a seção "Start Command"**

4. **Cole este comando:**
   ```bash
   cd backend && gunicorn --bind 0.0.0.0:$PORT app:app
   ```

5. **Verifique também o "Build Command":**
   ```bash
   cd backend && pip install -r requirements.txt
   ```

6. **Salve as alterações**

7. **O Render vai fazer redeploy automaticamente**

---

## 📋 Verificação Final

Após salvar, você deve ver nos logs:

```
==> Running 'cd backend && gunicorn --bind 0.0.0.0:$PORT app:app'
```

Se ainda mostrar `gunicorn app:app`, o problema está na configuração do Dashboard.

---

## 🔍 Se Ainda Não Funcionar

1. **Verifique se há algum campo "Command" preenchendo**
   - Deixe apenas o Start Command preenchido
   - O Procfile será ignorado se houver Start Command manual

2. **Tente deletar e recriar o serviço** (último recurso)
   - Use as mesmas configurações
   - Mas configure o Start Command desde o início

---

**A configuração manual no Dashboard é mais confiável que o Procfile quando há problemas de caminho!**


