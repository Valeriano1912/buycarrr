# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///buycarr.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Modelos do banco de dados
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    profile_photo = db.Column(db.String(500), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.email}>'

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(30), nullable=False)
    fuel_type = db.Column(db.String(20), nullable=False)
    transmission = db.Column(db.String(20), nullable=False)
    car_type = db.Column(db.String(50), nullable=False)  # Novo campo: tipo do carro
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Disponível')
    images = db.Column(db.Text, nullable=True)  # JSON string com URLs das imagens
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Car {self.brand} {self.model}>'

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref=db.backref('favorites', lazy=True))
    car = db.relationship('Car', backref=db.backref('favorites', lazy=True))
    
    # Evitar duplicatas
    __table_args__ = (db.UniqueConstraint('user_id', 'car_id', name='unique_user_car_favorite'),)
    
    def __repr__(self):
        return f'<Favorite {self.user_id} -> {self.car_id}>'

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='Pendente')  # Pendente, Aprovado, Rejeitado, Concluído
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('reservations', lazy=True))
    car = db.relationship('Car', backref=db.backref('reservations', lazy=True))
    
    def __repr__(self):
        return f'<Reservation {self.id}>'

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 estrelas
    photo = db.Column(db.String(500), nullable=True)  # URL da foto
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('comments', lazy=True))
    car = db.relationship('Car', backref=db.backref('comments', lazy=True))
    
    def __repr__(self):
        return f'<Comment {self.id}>'

# Rotas da API

# Autenticação
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validações básicas
        if not data.get('name') or not data.get('email') or not data.get('phone') or not data.get('password'):
            return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
        
        if data.get('password') != data.get('confirmPassword'):
            return jsonify({'error': 'As senhas não coincidem'}), 400
        
        if len(data.get('password')) < 6:
            return jsonify({'error': 'A senha deve ter pelo menos 6 caracteres'}), 400
        
        # Verificar se o email já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Criar novo usuário
        user = User(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Criar token JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'is_admin': user.is_admin
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Criar token JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/auth/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        user = User.query.filter_by(email=data['email'], is_admin=True).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Credenciais de administrador inválidas'}), 401
        
        # Criar token JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login administrativo realizado com sucesso',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Carros
@app.route('/api/cars', methods=['GET'])
def get_cars():
    try:
        cars = Car.query.all()
        cars_data = []
        
        for car in cars:
            cars_data.append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'mileage': car.mileage,
                'price': car.price,
                'color': car.color,
                'fuel_type': car.fuel_type,
                'transmission': car.transmission,
                'car_type': car.car_type,
                'description': car.description,
                'status': car.status,
                'images': car.images,
                'created_at': car.created_at.isoformat()
            })
        
        return jsonify({'cars': cars_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/cars/<int:car_id>', methods=['GET'])
def get_car(car_id):
    try:
        car = Car.query.get(car_id)
        
        if not car:
            return jsonify({'error': 'Carro não encontrado'}), 404
        
        car_data = {
            'id': car.id,
            'brand': car.brand,
            'model': car.model,
            'year': car.year,
            'mileage': car.mileage,
            'price': car.price,
            'color': car.color,
            'fuel_type': car.fuel_type,
            'transmission': car.transmission,
            'car_type': car.car_type,
            'description': car.description,
            'status': car.status,
            'images': car.images,
            'created_at': car.created_at.isoformat()
        }
        
        return jsonify({'car': car_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/cars', methods=['POST'])
@jwt_required()
def create_car():
    try:
        print("=== REQUISIÇÃO CREATE_CAR RECEBIDA ===")
        
        # Verificar se o usuário é admin
        user_id = get_jwt_identity()
        print(f"User ID: {user_id}")
        
        user = User.query.get(int(user_id))
        print(f"User encontrado: {user}")
        print(f"User é admin: {user.is_admin if user else 'User não encontrado'}")
        
        if not user or not user.is_admin:
            print("ERRO: Usuário não é admin")
            return jsonify({'error': 'Acesso negado. Apenas administradores podem criar carros.'}), 403
        
        data = request.get_json()
        print(f"Dados recebidos: {data}")
        
        # Validações básicas
        required_fields = ['brand', 'model', 'year', 'mileage', 'price', 'color', 'fuel_type', 'transmission', 'car_type']
        for field in required_fields:
            if field not in data or data[field] is None or (isinstance(data[field], str) and data[field].strip() == ''):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Criar novo carro
        print("Criando novo carro...")
        car = Car(
            brand=data['brand'],
            model=data['model'],
            year=int(data['year']),
            mileage=int(data['mileage']),
            price=float(data['price']),
            color=data['color'],
            fuel_type=data['fuel_type'],
            transmission=data['transmission'],
            car_type=data['car_type'],
            description=data.get('description', ''),
            status=data.get('status', 'Disponível'),
            images=data.get('images', '')
        )
        print(f"Carro criado: {car}")
        
        db.session.add(car)
        db.session.commit()
        print("Carro salvo no banco de dados!")
        
        car_data = {
            'id': car.id,
            'brand': car.brand,
            'model': car.model,
            'year': car.year,
            'mileage': car.mileage,
            'price': car.price,
            'color': car.color,
            'fuel_type': car.fuel_type,
            'transmission': car.transmission,
            'car_type': car.car_type,
            'description': car.description,
            'status': car.status,
            'images': car.images,
            'created_at': car.created_at.isoformat()
        }
        
        print(f"Retornando sucesso: {car_data}")
        return jsonify({
            'message': 'Carro criado com sucesso',
            'car': car_data
        }), 201
        
    except Exception as e:
        print(f"ERRO na criação do carro: {e}")
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/cars/<int:car_id>', methods=['PUT'])
@jwt_required()
def update_car(car_id):
    try:
        # Verificar se o usuário é admin
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado. Apenas administradores podem atualizar carros.'}), 403
        
        car = Car.query.get(car_id)
        if not car:
            return jsonify({'error': 'Carro não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar campos
        car.brand = data.get('brand', car.brand)
        car.model = data.get('model', car.model)
        car.year = int(data.get('year', car.year))
        car.mileage = int(data.get('mileage', car.mileage))
        car.price = float(data.get('price', car.price))
        car.color = data.get('color', car.color)
        car.fuel_type = data.get('fuel_type', car.fuel_type)
        car.transmission = data.get('transmission', car.transmission)
        car.description = data.get('description', car.description)
        car.status = data.get('status', car.status)
        car.images = data.get('images', car.images)
        
        db.session.commit()
        
        car_data = {
            'id': car.id,
            'brand': car.brand,
            'model': car.model,
            'year': car.year,
            'mileage': car.mileage,
            'price': car.price,
            'color': car.color,
            'fuel_type': car.fuel_type,
            'transmission': car.transmission,
            'description': car.description,
            'status': car.status,
            'images': car.images,
            'created_at': car.created_at.isoformat()
        }
        
        return jsonify({
            'message': 'Carro atualizado com sucesso',
            'car': car_data
        }), 200
        
    except Exception as e:
        print(f"ERRO na criação do carro: {e}")
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/cars/<int:car_id>', methods=['DELETE'])
@jwt_required()
def delete_car(car_id):
    try:
        print(f"🗑️ Tentando deletar carro ID: {car_id}")
        
        # Verificar se o usuário é admin
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or not user.is_admin:
            print(f"❌ Acesso negado. User: {user_id}, Is admin: {user.is_admin if user else 'No user'}")
            return jsonify({'error': 'Acesso negado. Apenas administradores podem excluir carros.'}), 403
        
        car = Car.query.get(car_id)
        if not car:
            print(f"❌ Carro não encontrado: {car_id}")
            return jsonify({'error': 'Carro não encontrado'}), 404
        
        print(f"✅ Carro encontrado: {car.brand} {car.model}. Deletando...")
        
        db.session.delete(car)
        db.session.commit()
        
        print(f"✅ Carro {car_id} excluído com sucesso!")
        return jsonify({'message': 'Carro excluído com sucesso'}), 200
        
    except Exception as e:
        print(f"❌ ERRO ao deletar carro: {e}")
        print(f"Stack trace: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para criar usuário administrador padrão
@app.route('/api/setup/admin', methods=['POST'])
def create_admin_user():
    try:
        # Verificar se já existe um admin
        admin = User.query.filter_by(is_admin=True).first()
        if admin:
            return jsonify({'error': 'Administrador já existe'}), 400
        
        # Criar administrador padrão
        admin = User(
            name='Administrador',
            email='admin@buycarr.com',
            phone='11999999999',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        
        db.session.add(admin)
        db.session.commit()
        
        return jsonify({'message': 'Administrador criado com sucesso'}), 201
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Endpoint para atualizar perfil do usuário
@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar campos se fornecidos
        if 'name' in data and data['name']:
            user.name = data['name']
        
        if 'email' in data and data['email']:
            # Verificar se o email já está em uso por outro usuário
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email já está em uso'}), 400
            user.email = data['email']
        
        if 'phone' in data:
            user.phone = data['phone']
        
        if 'profile_photo' in data:
            user.profile_photo = data['profile_photo']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil atualizado com sucesso',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'profile_photo': user.profile_photo,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Endpoint para obter dados do perfil
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'profile_photo': user.profile_photo,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Endpoints para Favoritos
@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    try:
        user_id = get_jwt_identity()
        favorites = Favorite.query.filter_by(user_id=int(user_id)).all()
        
        favorites_data = []
        for favorite in favorites:
            car_data = {
                'id': favorite.car.id,
                'brand': favorite.car.brand,
                'model': favorite.car.model,
                'year': favorite.car.year,
                'price': favorite.car.price,
                'images': favorite.car.images,
                'favorite_id': favorite.id,
                'added_at': favorite.created_at.isoformat()
            }
            favorites_data.append(car_data)
        
        return jsonify({'favorites': favorites_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        
        car_id = data.get('car_id')
        
        if not car_id:
            return jsonify({'error': 'ID do carro é obrigatório'}), 400
        
        # Verificar se o carro existe
        car = Car.query.get(car_id)
        if not car:
            return jsonify({'error': 'Carro não encontrado'}), 404
        
        # Verificar se já é favorito
        existing_favorite = Favorite.query.filter_by(user_id=int(user_id), car_id=car_id).first()
        if existing_favorite:
            return jsonify({'error': 'Carro já está nos favoritos'}), 400
        
        # Adicionar aos favoritos
        favorite = Favorite(user_id=int(user_id), car_id=car_id)
        db.session.add(favorite)
        db.session.commit()
        
        return jsonify({'message': 'Carro adicionado aos favoritos', 'favorite_id': favorite.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(favorite_id):
    try:
        user_id = get_jwt_identity()
        favorite = Favorite.query.filter_by(id=favorite_id, user_id=int(user_id)).first()
        
        if not favorite:
            return jsonify({'error': 'Favorito não encontrado'}), 404
        
        db.session.delete(favorite)
        db.session.commit()
        
        return jsonify({'message': 'Carro removido dos favoritos'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Endpoints para Reservas
@app.route('/api/reservations', methods=['GET'])
@jwt_required()
def get_reservations():
    try:
        user_id = get_jwt_identity()
        reservations = Reservation.query.filter_by(user_id=int(user_id)).all()
        
        reservations_data = []
        for reservation in reservations:
            car_data = {
                'id': reservation.id,
                'car': {
                    'id': reservation.car.id,
                    'brand': reservation.car.brand,
                    'model': reservation.car.model,
                    'year': reservation.car.year,
                    'price': reservation.car.price,
                    'images': reservation.car.images,
                },
                'message': reservation.message,
                'status': reservation.status,
                'created_at': reservation.created_at.isoformat(),
                'updated_at': reservation.updated_at.isoformat()
            }
            reservations_data.append(car_data)
        
        return jsonify({'reservations': reservations_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/reservations', methods=['POST'])
@jwt_required()
def create_reservation():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        
        car_id = data.get('car_id')
        message = data.get('message', '')
        
        if not car_id:
            return jsonify({'error': 'ID do carro é obrigatório'}), 400
        
        # Verificar se o carro existe
        car = Car.query.get(car_id)
        if not car:
            return jsonify({'error': 'Carro não encontrado'}), 404
        
        # Criar reserva
        reservation = Reservation(
            user_id=int(user_id),
            car_id=car_id,
            message=message,
            status='Pendente'
        )
        db.session.add(reservation)
        db.session.commit()
        
        return jsonify({
            'message': 'Reserva criada com sucesso',
            'reservation_id': reservation.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para admin ver todas as reservas
@app.route('/api/admin/reservations', methods=['GET'])
@jwt_required()
def get_admin_reservations():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        # Buscar todas as reservas
        reservations = Reservation.query.order_by(Reservation.created_at.desc()).all()
        
        reservations_data = []
        for reservation in reservations:
            car = Car.query.get(reservation.car_id)
            user_data = User.query.get(reservation.user_id)
            
            reservations_data.append({
                'id': reservation.id,
                'car': {
                    'id': car.id if car else None,
                    'brand': car.brand if car else 'N/A',
                    'model': car.model if car else 'N/A',
                    'year': car.year if car else 'N/A',
                    'price': car.price if car else 0,
                    'images': car.images if car else '[]'
                },
                'user': {
                    'id': user_data.id if user_data else None,
                    'name': user_data.name if user_data else 'Usuário removido',
                    'email': user_data.email if user_data else 'N/A',
                    'phone': user_data.phone if user_data else 'N/A'
                },
                'message': reservation.message,
                'status': reservation.status,
                'created_at': reservation.created_at.isoformat(),
                'updated_at': reservation.updated_at.isoformat()
            })
        
        return jsonify({'reservations': reservations_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para confirmar venda (admin)
@app.route('/api/admin/reservations/<int:reservation_id>/confirm', methods=['PUT'])
@jwt_required()
def confirm_sale(reservation_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return jsonify({'error': 'Reserva não encontrada'}), 404
        
        # Atualizar status da reserva para "Vendido"
        reservation.status = 'Vendido'
        
        # Atualizar status do carro para "Vendido"
        car = Car.query.get(reservation.car_id)
        if car:
            car.status = 'Vendido'
        
        db.session.commit()
        
        return jsonify({'message': 'Venda confirmada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para cancelar reserva (admin)
@app.route('/api/admin/reservations/<int:reservation_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_reservation(reservation_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Acesso negado'}), 403
        
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return jsonify({'error': 'Reserva não encontrada'}), 404
        
        # Atualizar status da reserva para "Cancelado"
        reservation.status = 'Cancelado'
        
        # Atualizar status do carro para "Disponível"
        car = Car.query.get(reservation.car_id)
        if car:
            car.status = 'Disponível'
        
        db.session.commit()
        
        return jsonify({'message': 'Reserva cancelada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para buscar carros por tipo
@app.route('/api/cars/type/<car_type>', methods=['GET'])
def get_cars_by_type(car_type):
    try:
        cars = Car.query.filter_by(car_type=car_type, status='Disponível').all()
        
        cars_data = []
        for car in cars:
            cars_data.append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'mileage': car.mileage,
                'price': car.price,
                'color': car.color,
                'fuel_type': car.fuel_type,
                'transmission': car.transmission,
                'car_type': car.car_type,
                'description': car.description,
                'images': car.images,
                'status': car.status,
                'created_at': car.created_at.isoformat(),
                'updated_at': car.updated_at.isoformat()
            })
        
        return jsonify({'cars': cars_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para buscar informações de contato do administrador
@app.route('/api/admin/contact', methods=['GET'])
def get_admin_contact():
    try:
        # Buscar o administrador (primeiro usuário admin)
        admin = User.query.filter_by(is_admin=True).first()
        
        if not admin:
            return jsonify({'error': 'Administrador não encontrado'}), 404
        
        return jsonify({
            'phone': admin.phone or '11999999999',  # Fallback para número padrão
            'name': admin.name or 'Administrador',
            'email': admin.email or 'admin@buycarr.com'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota de teste
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'API funcionando corretamente!'}), 200

# Comentários
@app.route('/api/cars/<int:car_id>/comments', methods=['GET'])
def get_comments(car_id):
    try:
        comments = Comment.query.filter_by(car_id=car_id).order_by(Comment.created_at.desc()).all()
        
        comments_data = []
        for comment in comments:
            user = User.query.get(comment.user_id)
            comments_data.append({
                'id': comment.id,
                'comment': comment.comment,
                'rating': comment.rating,
                'user_name': user.name if user else 'Usuário',
                'created_at': comment.created_at.isoformat()
            })
        
        return jsonify(comments_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar comentários: {str(e)}'}), 500

@app.route('/api/cars/<int:car_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(car_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        comment_text = data.get('comment')
        rating = data.get('rating')
        
        if not comment_text or not rating:
            return jsonify({'error': 'Comentário e avaliação são obrigatórios'}), 400
        
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Avaliação deve estar entre 1 e 5 estrelas'}), 400
        
        # Verificar se o carro existe
        car = Car.query.get(car_id)
        if not car:
            return jsonify({'error': 'Carro não encontrado'}), 404
        
        # Criar comentário
        new_comment = Comment(
            user_id=current_user_id,
            car_id=car_id,
            comment=comment_text,
            rating=rating
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        user = User.query.get(current_user_id)
        
        return jsonify({
            'id': new_comment.id,
            'comment': new_comment.comment,
            'rating': new_comment.rating,
            'user_name': user.name if user else 'Usuário',
            'created_at': new_comment.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar comentário: {str(e)}'}), 500

# Buscar todos os comentários
@app.route('/api/comments', methods=['GET'])
def get_all_comments():
    try:
        comments = Comment.query.order_by(Comment.created_at.desc()).all()
        
        comments_data = []
        for comment in comments:
            user = User.query.get(comment.user_id)
            car = Car.query.get(comment.car_id) if comment.car_id else None
            comments_data.append({
                'id': comment.id,
                'comment': comment.comment,
                'rating': comment.rating,
                'photo': comment.photo,
                'user_name': user.name if user else 'Usuário',
                'car_brand': car.brand if car else None,
                'car_model': car.model if car else None,
                'created_at': comment.created_at.isoformat()
            })
        
        return jsonify(comments_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar comentários: {str(e)}'}), 500

@app.route('/api/comments', methods=['POST'])
@jwt_required()
def create_general_comment():
    try:
        current_user_id = int(get_jwt_identity())
        
        comment_text = request.form.get('comment')
        rating = request.form.get('rating')
        photo_file = request.files.get('photo')
        photo_base64 = request.form.get('photo_base64')
        
        if not comment_text or not rating:
            return jsonify({'error': 'Comentário e avaliação são obrigatórios'}), 400
        
        rating = int(rating)
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Avaliação deve estar entre 1 e 5 estrelas'}), 400
        
        photo_url = None
        # Se for base64 (web), usar diretamente
        if photo_base64:
            photo_url = photo_base64
            print(f"Foto recebida em base64")
        elif photo_file:
            # Salvar a imagem no servidor (mobile/app real)
            upload_folder = os.path.join(app.root_path, 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            filename = secure_filename(photo_file.filename)
            filepath = os.path.join(upload_folder, filename)
            photo_file.save(filepath)
            photo_url = f'/uploads/{filename}'  # URL acessível pelo frontend
            print(f"Foto salva em: {photo_url}")
        
        new_comment = Comment(
            user_id=current_user_id,
            car_id=None,  # Comentário geral, sem carro específico
            comment=comment_text,
            rating=rating,
            photo=photo_url
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        user = User.query.get(current_user_id)
        
        return jsonify({
            'id': new_comment.id,
            'comment': new_comment.comment,
            'rating': new_comment.rating,
            'photo': new_comment.photo,
            'user_name': user.name if user else 'Usuário',
            'created_at': new_comment.created_at.isoformat()
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        print(f"Erro ao processar token: {e}")
        return jsonify({'error': f'Erro ao processar token. Por favor, faca login novamente.'}), 422
    except Exception as e:
        db.session.rollback()
        print(f"Erro completo ao criar comentario: {str(e)}")
        return jsonify({'error': f'Erro ao criar comentario: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Criar usuário administrador padrão se não existir
        admin = User.query.filter_by(is_admin=True).first()
        if not admin:
            admin = User(
                name='Administrador',
                email='admin@buycarr.com',
                phone='11999999999',
                password_hash=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Usuário administrador criado: admin@buycarr.com / admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
