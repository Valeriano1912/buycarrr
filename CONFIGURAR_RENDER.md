# ⚙️ Configuração do Render - Build Command

## 🚨 Erro Encontrado

O Render está procurando `requirements.txt` na raiz, mas ele está em `backend/requirements.txt`.

---

## ✅ Solução: Configurar Build Command no Render

### No Render Dashboard:

1. Vá em seu serviço Web
2. Clique em **"Settings"**
3. Encontre a seção **"Build Command"**
4. Substitua por:

```bash
cd backend && pip install -r requirements.txt
```

**OU** deixe em branco e use o comando abaixo no **"Start Command"**:

```bash
cd backend && gunicorn --bind 0.0.0.0:$PORT app:app
```

---

## 📋 Configuração Completa Recomendada

### Build Command:
```bash
cd backend && pip install -r requirements.txt
```

### Start Command:
```bash
cd backend && gunicorn --bind 0.0.0.0:$PORT app:app
```

**OU** deixe ambos vazios e use apenas o **Procfile** (já configurado).

---

## 🔍 Verificar Estrutura de Arquivos

Certifique-se que no GitHub você tem:
```
BUYCARR/
  ├── backend/
  │   ├── app.py
  │   ├── requirements.txt ✅
  │   └── ...
  ├── Procfile ✅
  ├── runtime.txt ✅
  └── ...
```

---

## 🔄 Após Configurar

1. **Salve as configurações** no Render
2. O Render vai fazer **redeploy automático**
3. Aguarde 2-3 minutos
4. Verifique os logs

---

## ✅ Checklist Final

- [ ] Build Command aponta para `backend/requirements.txt`
- [ ] Start Command usa gunicorn (ou deixa vazio e usa Procfile)
- [ ] Variáveis de ambiente configuradas:
  - `SECRET_KEY`
  - `JWT_SECRET_KEY`
  - `FLASK_ENV=production`
  - `PORT=10000`
- [ ] Procfile está correto (sem duplicatas)

---

**Após aplicar essas configurações, o deploy deve funcionar!**


