import requests
import json

API_BASE_URL = 'http://localhost:5000/api'

def login_admin():
    """Login como admin"""
    print("=== Login como Admin ===")
    
    login_data = {
        'email': 'admin@buycarr.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{API_BASE_URL}/auth/admin/login', json=login_data)
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                print('Login admin bem-sucedido!')
                return token
            else:
                print('Token não encontrado')
                return None
        else:
            print(f'Erro no login admin: {response.text}')
            return None
            
    except Exception as e:
        print(f'Erro de conexão: {e}')
        return None

def create_test_car(token):
    """Criar carro de teste"""
    print("\n=== Criando Carro de Teste ===")
    
    car_data = {
        'brand': 'Toyota',
        'model': 'Corolla',
        'year': 2020,
        'mileage': 50000,
        'price': 250000,
        'color': 'Branco',
        'fuel_type': 'Gasolina',
        'transmission': 'Automático',
        'description': 'Carro de teste para demonstração',
        'images': '["https://example.com/car1.jpg"]'
    }
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.post(f'{API_BASE_URL}/cars', json=car_data, headers=headers)
        print(f'Status: {response.status_code}')
        
        if response.status_code == 201:
            data = response.json()
            print('Carro criado com sucesso!')
            print(f'ID do carro: {data.get("car_id")}')
            return data.get("car_id")
        else:
            print(f'Erro: {response.text}')
            return None
            
    except Exception as e:
        print(f'Erro de conexão: {e}')
        return None

if __name__ == '__main__':
    token = login_admin()
    if token:
        create_test_car(token)
    else:
        print("Não foi possível fazer login como admin")
