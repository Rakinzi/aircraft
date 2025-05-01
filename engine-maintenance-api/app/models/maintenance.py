from app import db
from datetime import datetime
from sqlalchemy.dialects.mysql import JSON

class Maintenance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    engine_id = db.Column(db.Integer, db.ForeignKey('engine.id'), nullable=False)
    maintenance_type = db.Column(db.String(50))  # scheduled, unscheduled, overhaul
    description = db.Column(db.Text)
    performed_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime, nullable=True)
    cycle_count = db.Column(db.Integer)
    parts_replaced = db.Column(JSON, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    engine = db.relationship('Engine', backref=db.backref('maintenance_records', lazy=True))
    technician = db.relationship('User', backref=db.backref('maintenance_performed', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'engine_id': self.engine_id,
            'maintenance_type': self.maintenance_type,
            'description': self.description,
            'performed_by': self.performed_by,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'cycle_count': self.cycle_count,
            'parts_replaced': self.parts_replaced,
            'notes': self.notes
        }