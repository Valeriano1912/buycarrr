# 📦 Como Fazer Commit e Push no Git

## ✅ Passo 1: Verificar Alterações

```bash
git status
```

Isso mostra todos os arquivos modificados e não rastreados.

---

## 📝 Passo 2: Adicionar Arquivos ao Stage

### Opção A: Adicionar TODOS os arquivos (recomendado)
```bash
git add .
```

### Opção B: Adicionar arquivos específicos
```bash
git add src/screens/CarManagementScreen.js
git add backend/app.py
# ... adicione outros arquivos que deseja
```

---

## 💾 Passo 3: Fazer Commit

```bash
git commit -m "Atualizar dashboard admin com cores vermelho e laranja"
```

**Ou com mensagem mais detalhada:**
```bash
git commit -m "feat: Estilizar dashboard admin com cores do sistema

- Aplicar cores laranja (#FF6B00) e vermelho (#e74c3c) no dashboard admin
- Atualizar tabs, ícones, botões e cards para corresponder ao cliente
- Melhorar consistência visual entre dashboard admin e cliente"
```

---

## 🚀 Passo 4: Enviar para o GitHub

```bash
git push origin main
```

**Se der erro de permissão, use:**
```bash
git push origin main --force
```
⚠️ **Cuidado:** `--force` sobrescreve o histórico remoto!

---

## 📋 Resumo Completo (Todos os Passos)

```bash
# 1. Ver alterações
git status

# 2. Adicionar tudo
git add .

# 3. Fazer commit
git commit -m "Atualizar dashboard admin com cores vermelho e laranja"

# 4. Enviar para GitHub
git push origin main
```

---

## 🔍 Comandos Úteis Adicionais

### Ver histórico de commits
```bash
git log
```

### Ver diferenças antes de commitar
```bash
git diff
```

### Desfazer alterações em um arquivo
```bash
git restore nome-do-arquivo.js
```

### Ver branch atual
```bash
git branch
```

---

## ⚠️ Problemas Comuns

### 1. "Your branch is ahead of origin/main"
**Solução:** Faça `git push origin main`

### 2. "Updates were rejected"
**Causa:** Alguém fez push antes de você
**Solução:**
```bash
git pull origin main
git push origin main
```

### 3. "Please tell me who you are"
**Solução:**
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

**Pronto! Suas alterações estão no GitHub! 🎉**

