from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.maintenance import Maintenance
from app.models.engine import Engine
from app.models.alert import Alert
from datetime import datetime

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/maintenance', methods=['GET'])
@jwt_required()
def get_all_maintenance():
    # Optional query parameters
    engine_id = request.args.get('engine_id', type=int)
    maintenance_type = request.args.get('type')
    
    # Start with base query
    query = Maintenance.query
    
    # Apply filters if provided
    if engine_id:
        query = query.filter_by(engine_id=engine_id)
    
    if maintenance_type:
        query = query.filter_by(maintenance_type=maintenance_type)
    
    # Execute query and convert to dict
    records = query.order_by(Maintenance.start_date.desc()).all()
    result = [record.to_dict() for record in records]
    
    return jsonify(result), 200

@maintenance_bp.route('/maintenance/<int:maintenance_id>', methods=['GET'])
@jwt_required()
def get_maintenance(maintenance_id):
    maintenance = Maintenance.query.get_or_404(maintenance_id)
    return jsonify(maintenance.to_dict()), 200

@maintenance_bp.route('/maintenance', methods=['POST'])
@jwt_required()
def add_maintenance():
    current_user = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['engine_id', 'maintenance_type', 'description', 'start_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Verify engine exists
    engine = Engine.query.get_or_404(data['engine_id'])
    
    # Parse dates
    try:
        start_date = datetime.fromisoformat(data['start_date'])
        end_date = datetime.fromisoformat(data['end_date']) if 'end_date' in data and data['end_date'] else None
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use ISO format (YYYY-MM-DD)'}), 400
    
    # Create new maintenance record
    new_maintenance = Maintenance(
        engine_id=data['engine_id'],
        maintenance_type=data['maintenance_type'],
        description=data['description'],
        performed_by=current_user['user_id'],
        start_date=start_date,
        end_date=end_date,
        cycle_count=engine.total_cycles,
        parts_replaced=data.get('parts_replaced'),
        notes=data.get('notes')
    )
    
    db.session.add(new_maintenance)
    
    # Update engine status based on maintenance
    if end_date:
        engine.status = 'active'
    else:
        engine.status = 'maintenance'
    
    # Resolve any maintenance alerts if maintenance is completed
    if end_date:
        alerts = Alert.query.filter_by(
            engine_id=data['engine_id'],
            alert_type='maintenance_due',
            resolved=False
        ).all()
        
        for alert in alerts:
            alert.resolved = True
            alert.resolved_by = current_user['user_id']
            alert.resolved_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Maintenance record added successfully',
        'maintenance': new_maintenance.to_dict()
    }), 201

@maintenance_bp.route('/maintenance/<int:maintenance_id>', methods=['PUT'])
@jwt_required()
def update_maintenance(maintenance_id):
    current_user = get_jwt_identity()
    maintenance = Maintenance.query.get_or_404(maintenance_id)
    data = request.get_json()
    
    # Update fields if provided
    if 'description' in data:
        maintenance.description = data['description']
    
    if 'maintenance_type' in data:
        maintenance.maintenance_type = data['maintenance_type']
    
    if 'end_date' in data:
        try:
            end_date = datetime.fromisoformat(data['end_date']) if data['end_date'] else None
            maintenance.end_date = end_date
            
            # Update engine status to active if maintenance is complete
            if end_date:
                engine = Engine.query.get(maintenance.engine_id)
                engine.status = 'active'
                
                # Resolve alerts
                alerts = Alert.query.filter_by(
                    engine_id=maintenance.engine_id,
                    alert_type='maintenance_due',
                    resolved=False
                ).all()
                
                for alert in alerts:
                    alert.resolved = True
                    alert.resolved_by = current_user['user_id']
                    alert.resolved_at = datetime.utcnow()
        except ValueError:
            return jsonify({'error': 'Invalid date format for end_date. Use ISO format (YYYY-MM-DD)'}), 400
    
    if 'notes' in data:
        maintenance.notes = data['notes']
    
    if 'parts_replaced' in data:
        maintenance.parts_replaced = data['parts_replaced']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Maintenance record updated successfully',
        'maintenance': maintenance.to_dict()
    }), 200