import requests
import json

API_BASE_URL = 'http://10.142.136.134:5000/api'

def create_test_user():
    """Criar usuário de teste"""
    print("=== Criando Usuário de Teste ===")
    
    user_data = {
        'name': 'Usuário Teste',
        'email': 'teste@teste.com',
        'phone': '11999999999',
        'password': '123456',
        'confirmPassword': '123456'
    }
    
    try:
        response = requests.post(f'{API_BASE_URL}/auth/register', json=user_data)
        print(f'Status: {response.status_code}')
        
        if response.status_code == 201:
            print('Usuário criado com sucesso!')
            return True
        else:
            print(f'Erro: {response.text}')
            return False
            
    except Exception as e:
        print(f'Erro de conexão: {e}')
        return False

if __name__ == '__main__':
    create_test_user()
