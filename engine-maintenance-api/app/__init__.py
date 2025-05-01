from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
import tensorflow as tf

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

# Global variables for ML model
ml_model = None

def create_app(config_name='default'):
    app = Flask(__name__)
    CORS(app)
    
    # Load config
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.engines import engines_bp
    from app.routes.maintenance import maintenance_bp
    from app.routes.dashboard import dashboard_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(engines_bp, url_prefix='/api')
    app.register_blueprint(maintenance_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    
    # Create tables and load model
    with app.app_context():
        db.create_all()
        # Load ML model
        load_ml_model()
    
    return app

def load_ml_model():
    global ml_model
    
    try:
        # Define the path to model
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
        model_path = os.path.join(models_dir, 'RNN_fwd.h5')
        
        print(f"Loading model from: {model_path}")
        ml_model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {str(e)}")