from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.engine import Engine, EngineCycle
from app.models.alert import Alert
from app.models.user import User
from app.models.maintenance import Maintenance
from sqlalchemy import desc
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    # Summary statistics
    total_engines = Engine.query.count()
    active_engines = Engine.query.filter_by(status='active').count()
    maintenance_engines = Engine.query.filter_by(status='maintenance').count()
    
    # Engines needing attention (probability > 0.5)
    attention_needed_count = db.session.query(Engine).\
        join(EngineCycle, Engine.id == EngineCycle.engine_id).\
        filter(EngineCycle.failure_probability > 0.5).\
        distinct(Engine.id).count()
    
    # Recent alerts
    recent_alerts = Alert.query.filter_by(resolved=False).order_by(desc(Alert.created_at)).limit(10).all()
    alerts_data = []
    
    for alert in recent_alerts:
        engine = Engine.query.get(alert.engine_id)
        alerts_data.append({
            'id': alert.id,
            'engine_id': alert.engine_id,
            'engine_serial': engine.serial_number,
            'alert_type': alert.alert_type,
            'message': alert.message,
            'created_at': alert.created_at.isoformat()
        })
    
    # Get engines requiring immediate attention (failure probability > 0.8)
    critical_engines_data = []
    
    # Create a subquery to get the latest cycle for each engine
    latest_cycles = db.session.query(
        EngineCycle.engine_id,
        db.func.max(EngineCycle.cycle).label('max_cycle')
    ).group_by(EngineCycle.engine_id).subquery()
    
    # Join with the EngineCycle table to get the actual cycle data
    critical_engines = db.session.query(Engine, EngineCycle).\
        join(latest_cycles, Engine.id == latest_cycles.c.engine_id).\
        join(EngineCycle, (EngineCycle.engine_id == latest_cycles.c.engine_id) & 
             (EngineCycle.cycle == latest_cycles.c.max_cycle)).\
        filter(EngineCycle.failure_probability > 0.8).\
        order_by(desc(EngineCycle.failure_probability)).\
        limit(5).all()
    
    for engine, cycle in critical_engines:
        critical_engines_data.append({
            'id': engine.id,
            'serial_number': engine.serial_number,
            'aircraft_id': engine.aircraft_id,
            'failure_probability': cycle.failure_probability,
            'current_cycle': cycle.cycle,
            'rul': cycle.rul
        })
    
    # Recent maintenance activities
    recent_maintenance = Maintenance.query.\
        order_by(desc(Maintenance.start_date)).\
        limit(5).all()
    
    maintenance_data = []
    for record in recent_maintenance:
        engine = Engine.query.get(record.engine_id)
        technician = User.query.get(record.performed_by) if record.performed_by else None
        
        maintenance_data.append({
            'id': record.id,
            'engine_id': record.engine_id,
            'engine_serial': engine.serial_number,
            'maintenance_type': record.maintenance_type,
            'description': record.description,
            'start_date': record.start_date.isoformat() if record.start_date else None,
            'end_date': record.end_date.isoformat() if record.end_date else None,
            'performed_by': technician.username if technician else None
        })
    
    return jsonify({
        'summary': {
            'total_engines': total_engines,
            'active_engines': active_engines,
            'maintenance_engines': maintenance_engines,
            'attention_needed': attention_needed_count
        },
        'critical_engines': critical_engines_data,
        'recent_alerts': alerts_data,
        'recent_maintenance': maintenance_data
    }), 200

@dashboard_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    # Get query parameters
    resolved = request.args.get('resolved', 'false').lower() == 'true'
    
    alerts = Alert.query.filter_by(resolved=resolved).order_by(desc(Alert.created_at)).all()
    result = []
    
    for alert in alerts:
        engine = Engine.query.get(alert.engine_id)
        alert_data = {
            'id': alert.id,
            'engine_id': alert.engine_id,
            'engine_serial': engine.serial_number,
            'alert_type': alert.alert_type,
            'message': alert.message,
            'created_at': alert.created_at.isoformat(),
            'is_read': alert.is_read
        }
        
        if resolved:
            resolver = User.query.get(alert.resolved_by)
            alert_data.update({
                'resolved_by': resolver.username if resolver else None,
                'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None
            })
        
        result.append(alert_data)
    
    return jsonify(result), 200

@dashboard_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
@jwt_required()
def update_alert(alert_id):
    current_user = get_jwt_identity()
    alert = Alert.query.get_or_404(alert_id)
    data = request.get_json()
    
    if 'is_read' in data:
        alert.is_read = data['is_read']
    
    if 'resolved' in data and data['resolved']:
        alert.resolved = True
        alert.resolved_by = current_user['user_id']
        alert.resolved_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Alert updated successfully',
        'alert': alert.to_dict()
    }), 200