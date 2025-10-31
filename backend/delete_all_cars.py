#!/usr/bin/env python3
"""
Script para eliminar todos os carros do banco de dados
"""

import sys
import os

# Adicionar o diretório atual ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Car

def delete_all_cars():
    """Elimina todos os carros do banco de dados"""
    try:
        with app.app_context():
            # Contar carros antes da exclusão
            car_count = Car.query.count()
            print(f"Encontrados {car_count} carros no banco de dados")
            
            if car_count == 0:
                print("Nenhum carro encontrado para excluir")
                return
            
            # Confirmar exclusão
            confirm = input(f"Tem certeza que deseja excluir todos os {car_count} carros? (s/N): ")
            if confirm.lower() != 's':
                print("Operação cancelada")
                return
            
            # Excluir todos os carros
            Car.query.delete()
            db.session.commit()
            
            print(f"✅ {car_count} carros excluídos com sucesso!")
            
            # Verificar se foram realmente excluídos
            remaining_cars = Car.query.count()
            print(f"Carros restantes: {remaining_cars}")
            
    except Exception as e:
        print(f"❌ Erro ao excluir carros: {e}")
        db.session.rollback()

if __name__ == "__main__":
    delete_all_cars()


