import requests
import json

API_BASE_URL = 'http://localhost:5000/api'

def test_login():
    """Teste de login para obter token"""
    print("=== Testando Login ===")
    
    # Dados de teste - usuário comum
    login_data = {
        'email': 'teste@teste.com',
        'password': '123456'
    }
    
    try:
        response = requests.post(f'{API_BASE_URL}/auth/login', json=login_data)
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            data = response.json()
            print(f'Login bem-sucedido!')
            print(f'Resposta completa: {data}')
            token = data.get("access_token") or data.get("token")
            if token:
                print(f'Token: {token[:50]}...')
                return token
            else:
                print('Token não encontrado na resposta')
                print(f'Chaves disponíveis: {list(data.keys())}')
                return None
        else:
            print(f'Erro no login: {response.text}')
            return None
            
    except Exception as e:
        print(f'Erro de conexão: {e}')
        return None

def test_favorites(token):
    """Teste dos endpoints de favoritos"""
    print("\n=== Testando Favoritos ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Testar GET favoritos
    try:
        response = requests.get(f'{API_BASE_URL}/favorites', headers=headers)
        print(f'GET Favoritos - Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print(f'Favoritos encontrados: {len(data.get("favorites", []))}')
        else:
            print(f'Erro: {response.text}')
    except Exception as e:
        print(f'Erro de conexão: {e}')

def test_reservations(token):
    """Teste dos endpoints de reservas"""
    print("\n=== Testando Reservas ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Testar GET reservas
    try:
        response = requests.get(f'{API_BASE_URL}/reservations', headers=headers)
        print(f'GET Reservas - Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print(f'Reservas encontradas: {len(data.get("reservations", []))}')
        else:
            print(f'Erro: {response.text}')
    except Exception as e:
        print(f'Erro de conexão: {e}')

def test_create_reservation(token):
    """Teste de criação de reserva"""
    print("\n=== Testando Criação de Reserva ===")
    
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    reservation_data = {
        'car_id': 1,
        'message': 'Teste de reserva via script'
    }
    
    try:
        response = requests.post(f'{API_BASE_URL}/reservations', json=reservation_data, headers=headers)
        print(f'POST Reserva - Status: {response.status_code}')
        if response.status_code == 201:
            data = response.json()
            print(f'Reserva criada com sucesso! ID: {data.get("reservation_id")}')
        else:
            print(f'Erro: {response.text}')
    except Exception as e:
        print(f'Erro de conexão: {e}')

if __name__ == '__main__':
    print("Testando API do BuyCarMoz...")
    
    # Testar login
    token = test_login()
    
    if token:
        # Testar favoritos
        test_favorites(token)
        
        # Testar reservas
        test_reservations(token)
        
        # Testar criação de reserva
        test_create_reservation(token)
        
        # Testar reservas novamente para ver se a nova reserva aparece
        print("\n=== Verificando Reservas Após Criação ===")
        test_reservations(token)
    else:
        print("Não foi possível obter token. Verifique se o usuário existe no banco.")
