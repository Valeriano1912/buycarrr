# 🔐 Testar Endpoint de Login

## ✅ Backend Está Online!

O endpoint de teste está funcionando:
```
https://buycarrr-1.onrender.com/api/test
→ {"message":"API funcionando corretamente!"}
```

---

## 🔍 Testar Login Manualmente

### Opção 1: Usar Postman ou Insomnia

**POST** `https://buycarrr-1.onrender.com/api/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@buycarr.com",
  "password": "admin123"
}
```

### Opção 2: Usar curl no Terminal

```bash
curl -X POST https://buycarrr-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@buycarr.com","password":"admin123"}'
```

---

## ✅ Verificar Endpoints Disponíveis

Teste estes endpoints no navegador:

1. **Test:** https://buycarrr-1.onrender.com/api/test ✅ Funcionando
2. **Root:** https://buycarrr-1.onrender.com/ (deve mostrar informações da API)

---

## 🐛 Possíveis Problemas

### 1. Endpoint de Login não existe ou tem erro
- Verificar se `/api/auth/login` está definido no backend
- Verificar logs do Render para erros

### 2. CORS (Cross-Origin Resource Sharing)
- O backend pode estar bloqueando requisições do React Native
- Verificar se `CORS(app)` está configurado corretamente no `backend/app.py`

### 3. Credenciais Incorretas
- Admin padrão: `admin@buycarr.com` / `admin123`
- Se não funcionar, verificar se o usuário admin foi criado no banco

### 4. Timeout
- O timeout do axios está em 30 segundos
- Se a requisição demorar muito, pode dar timeout

---

## 📱 Próximo Passo

Tente fazer login no app novamente. Com as melhorias que fizemos:
- Se o endpoint estiver funcionando → Login deve funcionar
- Se houver erro → Mensagem específica será exibida

**Agora você verá mensagens claras como:**
- "Credenciais inválidas" (se email/senha errados)
- "Não foi possível conectar" (se houver problema de rede)
- "Erro do servidor (500)" (se houver erro no backend)

