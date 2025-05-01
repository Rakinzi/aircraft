from app import db
from datetime import datetime

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    engine_id = db.Column(db.Integer, db.ForeignKey('engine.id'), nullable=False)
    alert_type = db.Column(db.String(50))  # maintenance_due, anomaly_detected, rul_threshold
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    resolved = db.Column(db.Boolean, default=False)
    resolved_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    engine = db.relationship('Engine', backref=db.backref('alerts', lazy=True))
    user = db.relationship('User', backref=db.backref('resolved_alerts', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'engine_id': self.engine_id,
            'alert_type': self.alert_type,
            'message': self.message,
            'created_at': self.created_at.isoformat(),
            'is_read': self.is_read,
            'resolved': self.resolved,
            'resolved_by': self.resolved_by,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }