#!/usr/bin/env python3
"""
Script para adicionar carros de exemplo ao banco de dados
Execute este script para popular o banco com dados de teste
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Car

def add_sample_cars():
    with app.app_context():
        # Verificar se já existem carros
        existing_cars = Car.query.count()
        if existing_cars > 0:
            print(f"Já existem {existing_cars} carros no banco. Pulando adição de carros de exemplo.")
            return

        # Carros de exemplo
        sample_cars = [
            {
                'brand': 'Toyota',
                'model': 'Corolla',
                'year': 2020,
                'mileage': 45000,
                'price': 85000.00,
                'color': 'Prata',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'Toyota Corolla 2020 em excelente estado, único dono, revisões em dia.',
                'status': 'Disponível'
            },
            {
                'brand': 'Honda',
                'model': 'Civic',
                'year': 2019,
                'mileage': 52000,
                'price': 75000.00,
                'color': 'Preto',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'Honda Civic 2019, completo, ar condicionado, direção elétrica.',
                'status': 'Disponível'
            },
            {
                'brand': 'Volkswagen',
                'model': 'Golf',
                'year': 2021,
                'mileage': 28000,
                'price': 95000.00,
                'color': 'Branco',
                'fuel_type': 'Flex',
                'transmission': 'Manual',
                'description': 'Volkswagen Golf 2021, seminovo, ainda na garantia da fábrica.',
                'status': 'Disponível'
            },
            {
                'brand': 'Ford',
                'model': 'Focus',
                'year': 2018,
                'mileage': 68000,
                'price': 55000.00,
                'color': 'Azul',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'Ford Focus 2018, bem conservado, documentos em dia.',
                'status': 'Disponível'
            },
            {
                'brand': 'Chevrolet',
                'model': 'Cruze',
                'year': 2020,
                'mileage': 35000,
                'price': 78000.00,
                'color': 'Vermelho',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'Chevrolet Cruze 2020, completo, ar condicionado digital.',
                'status': 'Disponível'
            },
            {
                'brand': 'BMW',
                'model': '320i',
                'year': 2019,
                'mileage': 45000,
                'price': 150000.00,
                'color': 'Preto',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'BMW 320i 2019, importado, com todos os opcionais.',
                'status': 'Disponível'
            },
            {
                'brand': 'Mercedes-Benz',
                'model': 'C180',
                'year': 2020,
                'mileage': 30000,
                'price': 180000.00,
                'color': 'Prata',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'Mercedes-Benz C180 2020, seminovo, garantia da concessionária.',
                'status': 'Disponível'
            },
            {
                'brand': 'Audi',
                'model': 'A3',
                'year': 2021,
                'mileage': 25000,
                'price': 120000.00,
                'color': 'Branco',
                'fuel_type': 'Flex',
                'transmission': 'Automático',
                'description': 'Audi A3 2021, seminovo, ainda na garantia.',
                'status': 'Disponível'
            }
        ]

        # Adicionar carros ao banco
        for car_data in sample_cars:
            car = Car(**car_data)
            db.session.add(car)

        # Salvar no banco
        db.session.commit()
        print(f"✅ {len(sample_cars)} carros de exemplo adicionados com sucesso!")

        # Mostrar resumo
        total_cars = Car.query.count()
        print(f"📊 Total de carros no banco: {total_cars}")

if __name__ == '__main__':
    add_sample_cars()


