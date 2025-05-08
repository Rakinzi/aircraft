from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.engine import Engine, EngineCycle
from app.models.alert import Alert
from app.services.prediction import run_predictions
from datetime import datetime

engines_bp = Blueprint('engines', __name__)

@engines_bp.route('/engines', methods=['GET'])
@jwt_required()
def get_engines():
    engines = Engine.query.all()
    result = []
    
    for engine in engines:
        # Get the latest cycle data
        latest_cycle = EngineCycle.query.filter_by(engine_id=engine.id).order_by(EngineCycle.cycle.desc()).first()
        
        # Count active alerts
        active_alerts = Alert.query.filter_by(engine_id=engine.id, resolved=False).count()
        
        engine_data = engine.to_dict()
        engine_data['alerts'] = active_alerts
        
        if latest_cycle:
            engine_data.update({
                'latest_cycle': latest_cycle.cycle,
                'rul': latest_cycle.rul,
                'failure_probability': latest_cycle.failure_probability,
                'maintenance_due': latest_cycle.failure_probability > 0.7 if latest_cycle.failure_probability else False
            })
        
        result.append(engine_data)
    
    return jsonify(result), 200

@engines_bp.route('/engines/<int:engine_id>', methods=['GET'])
@jwt_required()
def get_engine(engine_id):
    engine = Engine.query.get_or_404(engine_id)
    
    # Get the last 50 cycles for trend analysis
    recent_cycles = EngineCycle.query.filter_by(engine_id=engine.id).order_by(EngineCycle.cycle.desc()).limit(50).all()
    recent_cycles.reverse()  # Chronological order
    
    cycles_data = [cycle.to_dict() for cycle in recent_cycles]
    
    # Get maintenance history
    from app.models.maintenance import Maintenance
    maintenance_records = Maintenance.query.filter_by(engine_id=engine.id).all()
    maintenance_data = [record.to_dict() for record in maintenance_records]
    
    result = engine.to_dict()
    result['cycles'] = cycles_data
    result['maintenance_history'] = maintenance_data
    
    return jsonify(result), 200

@engines_bp.route('/engines', methods=['POST'])
@jwt_required()
def add_engine():
    current_user = get_jwt_identity()
    
    # Check if user has admin or engineer role
    if current_user['role'] not in ['admin', 'engineer']:
        return jsonify({'error': 'Unauthorized. Only admin or engineer can add engines'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if 'serial_number' not in data:
        return jsonify({'error': 'Serial number is required'}), 400
    
    # Check if engine with serial number already exists
    if Engine.query.filter_by(serial_number=data['serial_number']).first():
        return jsonify({'error': 'Engine with this serial number already exists'}), 409
    
    # Parse installation date if provided
    installation_date = None
    if 'installation_date' in data and data['installation_date']:
        try:
            installation_date = datetime.fromisoformat(data['installation_date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format for installation_date. Use ISO format (YYYY-MM-DD)'}), 400
    
    new_engine = Engine(
        serial_number=data['serial_number'],
        model=data.get('model'),
        aircraft_id=data.get('aircraft_id'),
        installation_date=installation_date,
        status=data.get('status', 'active')
    )
    
    db.session.add(new_engine)
    db.session.commit()
    
    return jsonify({
        'message': 'Engine added successfully',
        'engine': new_engine.to_dict()
    }), 201

@engines_bp.route('/engines/<int:engine_id>/cycles', methods=['POST'])
@jwt_required()
def add_cycle_data(engine_id):
    engine = Engine.query.get_or_404(engine_id)
    data = request.get_json()
    
    # Validate required fields
    if 'cycle' not in data:
        return jsonify({'error': 'Cycle number is required'}), 400
    
    # Ensure cycle is a positive integer
    try:
        cycle = int(data['cycle'])
        if cycle <= 0:
            return jsonify({'error': 'Cycle must be a positive integer'}), 400
    except ValueError:
        return jsonify({'error': 'Cycle must be a valid integer'}), 400
    
    # Check if cycle already exists for this engine
    existing_cycle = EngineCycle.query.filter_by(engine_id=engine_id, cycle=cycle).first()
    if existing_cycle:
        return jsonify({
            'error': f'Cycle data for this engine already exists for cycle {cycle}. Try using cycle {engine.total_cycles + 1}.'
        }), 409
    
    # Prepare sensor data
    sensor_data = {}
    for i in range(1, 22):
        key = f's{i}'
        # Use 0.0 as default if not provided
        sensor_data[key] = float(data.get(key, 0.0))
    
    # Create new cycle entry
    new_cycle = EngineCycle(
        engine_id=engine_id,
        cycle=cycle,
        setting1=float(data.get('setting1', 0.0)),
        setting2=float(data.get('setting2', 0.0)),
        setting3=float(data.get('setting3', 0.0)),
        sensor_data=sensor_data
    )
    
    db.session.add(new_cycle)
    
    # Update engine's total cycles if new cycle is higher
    if cycle > engine.total_cycles:
        engine.total_cycles = cycle
    
    try:
        db.session.commit()
        
        # Run predictions asynchronously if we have enough data
        cycles_count = EngineCycle.query.filter_by(engine_id=engine_id).count()
        if cycles_count >= 50:  # We need at least 50 cycles for prediction
            run_predictions(engine_id)
            message = 'Cycle data added and predictions updated'
        else:
            message = f'Cycle data added. Need {50 - cycles_count} more cycles for predictions'
        
        return jsonify({
            'message': message,
            'cycle': new_cycle.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save cycle data: {str(e)}'}), 500
    
    
@engines_bp.route('/engines/<int:engine_id>', methods=['PUT'])
@jwt_required()
def update_engine(engine_id):
    current_user = get_jwt_identity()
    
    # Check if user has admin or engineer role
    if current_user['role'] not in ['admin', 'engineer']:
        return jsonify({'error': 'Unauthorized. Only admin or engineer can update engines'}), 403
    
    engine = Engine.query.get_or_404(engine_id)
    data = request.get_json()
    
    # Update fields if provided
    if 'model' in data:
        engine.model = data['model']
    
    if 'aircraft_id' in data:
        engine.aircraft_id = data['aircraft_id']
    
    if 'status' in data:
        valid_statuses = ['active', 'maintenance', 'retired']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        engine.status = data['status']
    
    if 'installation_date' in data and data['installation_date']:
        try:
            engine.installation_date = datetime.fromisoformat(data['installation_date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format for installation_date. Use ISO format (YYYY-MM-DD)'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Engine updated successfully',
        'engine': engine.to_dict()
    }), 200
    

@engines_bp.route('/engines/<int:engine_id>', methods=['DELETE'])
@jwt_required()
def delete_engine(engine_id):
    current_user = get_jwt_identity()
    
    # Check if user has admin role
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized. Only admin can delete engines'}), 403
    
    try:
        engine = Engine.query.get_or_404(engine_id)
        
        # Delete all associated cycle data
        EngineCycle.query.filter_by(engine_id=engine_id).delete()
        
        # Delete all associated maintenance records
        from app.models.maintenance import Maintenance
        Maintenance.query.filter_by(engine_id=engine_id).delete()
        
        # Delete all associated alerts
        from app.models.alert import Alert
        Alert.query.filter_by(engine_id=engine_id).delete()
        
        # Finally delete the engine
        db.session.delete(engine)
        db.session.commit()
        
        return jsonify({'message': 'Engine and all associated data deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete engine: {str(e)}'}), 500