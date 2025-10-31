# BuyCarr Backend API

API REST para a aplicação BuyCarr - Loja online de venda de carros.

## Instalação

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Execute a aplicação:
```bash
python app.py
```

A API estará disponível em: `http://localhost:5000`

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/admin/login` - Login de administrador
- `GET /api/auth/me` - Obter dados do usuário logado (requer token)

### Carros

- `GET /api/cars` - Listar carros disponíveis
- `GET /api/cars/<id>` - Obter detalhes de um carro

### Configuração

- `POST /api/setup/admin` - Criar usuário administrador padrão
- `GET /api/test` - Testar se a API está funcionando

## Usuário Administrador Padrão

- Email: `admin@buycarr.com`
- Senha: `admin123`

## Estrutura do Banco de Dados

### Tabelas

- **users**: Usuários do sistema
- **cars**: Carros cadastrados
- **reservations**: Reservas de carros

## Configuração para Expo Go

Para conectar o app React Native com esta API, use o IP da sua máquina:

1. Descubra seu IP local:
```bash
ipconfig
```

2. Configure a URL base da API no app React Native para:
```
http://SEU_IP:5000/api
```

Exemplo: `http://192.168.1.100:5000/api`

