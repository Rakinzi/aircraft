from app import db
from datetime import datetime
from sqlalchemy.dialects.mysql import JSON

class Engine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    serial_number = db.Column(db.String(50), unique=True, nullable=False)
    model = db.Column(db.String(50))
    aircraft_id = db.Column(db.String(50))
    installation_date = db.Column(db.DateTime)
    total_cycles = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='active')  # active, maintenance, retired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'serial_number': self.serial_number,
            'model': self.model,
            'aircraft_id': self.aircraft_id,
            'total_cycles': self.total_cycles,
            'status': self.status,
            'installation_date': self.installation_date.isoformat() if self.installation_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class EngineCycle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    engine_id = db.Column(db.Integer, db.ForeignKey('engine.id'), nullable=False)
    cycle = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Operational settings
    setting1 = db.Column(db.Float)
    setting2 = db.Column(db.Float)
    setting3 = db.Column(db.Float)
    
    # Sensor readings (s1-s21)
    sensor_data = db.Column(JSON)  # Store all 21 sensor readings as JSON
    
    # Predictions (updated after processing)
    rul = db.Column(db.Float, nullable=True)  # Remaining useful life
    failure_probability = db.Column(db.Float, nullable=True)  # Probability of failure within 30 cycles
    anomaly_score = db.Column(db.Float, nullable=True)  # Anomaly detection score
    
    engine = db.relationship('Engine', backref=db.backref('cycles', lazy=True))
    
    __table_args__ = (
        db.UniqueConstraint('engine_id', 'cycle', name='unique_engine_cycle'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'engine_id': self.engine_id,
            'cycle': self.cycle,
            'timestamp': self.timestamp.isoformat(),
            'settings': {
                'setting1': self.setting1,
                'setting2': self.setting2,
                'setting3': self.setting3
            },
            'sensor_data': self.sensor_data,
            'rul': self.rul,
            'failure_probability': self.failure_probability,
            'anomaly_score': self.anomaly_score
        }