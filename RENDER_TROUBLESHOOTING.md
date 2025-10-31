# 🔧 Troubleshooting - Render Bad Gateway

## Erro: "Bad Gateway" ou "Service Unavailable"

Este erro geralmente significa que o servidor Flask não está iniciando corretamente no Render.

---

## ✅ Soluções Aplicadas

1. **Procfile atualizado** - Agora usa `gunicorn` (servidor de produção)
2. **Inicialização do banco** - Banco de dados inicializa automaticamente
3. **Variáveis de ambiente** - Certifique-se de configurar no Render

---

## 📋 Checklist no Render Dashboard

### 1. Verificar Logs
- Acesse seu serviço no Render
- Vá em **"Logs"**
- Procure por erros em vermelho
- Erros comuns:
  - `ModuleNotFoundError` → Falta dependência no requirements.txt
  - `Port already in use` → Configuração de porta incorreta
  - `ImportError` → Arquivo não encontrado

### 2. Verificar Variáveis de Ambiente
No Render Dashboard → **Environment**:

```
SECRET_KEY=sua-chave-super-secreta-aqui
JWT_SECRET_KEY=sua-chave-jwt-secreta-aqui
FLASK_ENV=production
PORT=10000
```

⚠️ **IMPORTANTE:** Use valores reais e seguros! Gere chaves aleatórias.

### 3. Verificar Build Command
No Render Dashboard → **Settings**:

**Build Command:**
```bash
cd backend && pip install -r requirements.txt
```

**Start Command:**
Deixe vazio (o Procfile já define isso)

### 4. Verificar Estrutura de Arquivos
Certifique-se que no GitHub você tem:
```
backend/
  ├── app.py
  ├── requirements.txt
  ├── __init__.py (se necessário)
Procfile (na raiz)
runtime.txt (na raiz)
```

---

## 🔍 Verificações Adicionais

### Verificar se gunicorn está instalado
O `requirements.txt` deve ter:
```
gunicorn==21.2.0
```

✅ Já está incluído!

### Testar localmente com gunicorn
```bash
cd backend
gunicorn --bind 0.0.0.0:5000 app:app
```

Se funcionar localmente, deve funcionar no Render.

---

## 🚨 Erros Comuns e Soluções

### Erro: "Module not found"
**Solução:** Adicione a dependência faltante no `requirements.txt`

### Erro: "Port already in use"
**Solução:** Já configurado para usar `$PORT` do Render automaticamente

### Erro: "Database locked"
**Solução:** SQLite pode ter problemas em produção. Considere usar PostgreSQL (Render oferece gratuito)

### Erro: "CORS"
**Solução:** Verifique se `CORS(app)` está no código (já está configurado)

---

## 📞 Próximos Passos

1. **Faça commit das alterações:**
   ```bash
   git add .
   git commit -m "Corrigir Procfile para usar gunicorn"
   git push
   ```

2. **Render vai fazer redeploy automaticamente**

3. **Aguarde 2-3 minutos** e verifique novamente

4. **Se ainda der erro**, verifique os logs no Render Dashboard

---

## 💡 Dica: Usar PostgreSQL (Recomendado)

SQLite pode ter problemas em produção. Render oferece PostgreSQL gratuito:

1. Crie um **PostgreSQL Database** no Render
2. Copie a **Internal Database URL**
3. Adicione no **Environment Variables**:
   ```
   DATABASE_URL=postgresql://usuario:senha@host/database
   ```
4. Atualize `app.py` para usar PostgreSQL se `DATABASE_URL` existir

---

**Após aplicar as correções, aguarde o redeploy e teste novamente!**


