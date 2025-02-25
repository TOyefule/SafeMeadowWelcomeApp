from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
import requests  # For ICANotes API integration
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///patients.db'  # Use PostgreSQL in production
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Patient Model
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    data = db.Column(db.JSON)  # Stores patient forms securely

# User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = Patient(name=data['name'], email=data['email'], password=hashed_pw, data={})
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully!'}), 201

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = Patient.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.email)
        return jsonify({'token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# Submit Patient Forms
@app.route('/submit_forms', methods=['POST'])
@jwt_required()
def submit_forms():
    data = request.json
    patient = Patient.query.filter_by(email=data['email']).first()
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404
    
    patient.data = data['forms']  # Store form data
    db.session.commit()
    
    # Send data to ICANotes API (mock request)
    headers = {'Authorization': f'Bearer {os.getenv("ICANOTES_API_KEY")}', 'Content-Type': 'application/json'}
    response = requests.post('https://icanotes-api.com/patient', json=patient.data, headers=headers)
    
    if response.status_code == 200:
        return jsonify({'message': 'Forms submitted successfully!'}), 200
    return jsonify({'message': 'Error submitting to ICANotes'}), 500

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
