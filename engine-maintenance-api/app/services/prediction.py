import numpy as np
from app import db
from app.models.engine import EngineCycle, Engine
from app.models.alert import Alert
from datetime import datetime

def run_predictions(engine_id):
    """
    Process engine cycle data and make predictions using the RNN_fwd model.
    This model was trained only on the s2 sensor value.
    
    Args:
        engine_id (int): ID of the engine to analyze
    """
    # Import ml_model from the global scope
    from app import ml_model
    
    if ml_model is None:
        print("ML model not loaded yet")
        return
    
    # Get the latest 50 cycles (or fewer if not available)
    cycles = EngineCycle.query.filter_by(engine_id=engine_id).order_by(EngineCycle.cycle.desc()).limit(50).all()
    
    if len(cycles) < 50:
        print(f"Not enough data for engine {engine_id}. Need 50 cycles, got {len(cycles)}")
        return
    
    # Reverse to get chronological order
    cycles.reverse()
    
    # For RNN_fwd.h5, we only need the s2 sensor (it was trained on just one feature)
    sequence_data = []
    for cycle in cycles:
        # Only extract s2 value from sensor_data
        s2_value = cycle.sensor_data.get('s2', 0)
        sequence_data.append([s2_value])
    
    # Reshape for RNN input [samples, time steps, features]
    # The model expects shape (batch_size, 50, 1) since it was trained with just s2
    X = np.array([sequence_data])
    
    try:
        # Make prediction with the single feature RNN model
        failure_prob = float(ml_model.predict(X)[0][0])
        print(f"Prediction for engine {engine_id}: {failure_prob:.4f}")
        
        # Update the database with prediction
        latest_cycle = cycles[-1]  # Most recent cycle
        latest_cycle_db = EngineCycle.query.get(latest_cycle.id)
        latest_cycle_db.failure_probability = failure_prob
        
        # Calculate remaining useful life - this is a simplified approach
        if failure_prob > 0.5:
            # Rough estimate: assume linear relationship with failure probability
            # 0.5 probability = 30 cycles remaining, 1.0 probability = 0 cycles remaining
            rul_estimate = 30 * (2 - (2 * failure_prob))
            latest_cycle_db.rul = max(0, rul_estimate)
        else:
            # If failure probability is low, we assume RUL is at least 30 cycles
            latest_cycle_db.rul = 30
        
        # If high probability of failure, create an alert
        engine = Engine.query.get(engine_id)
        if failure_prob > 0.7 and not Alert.query.filter_by(
                engine_id=engine_id, 
                alert_type='maintenance_due',
                resolved=False).first():
            
            new_alert = Alert(
                engine_id=engine_id,
                alert_type='maintenance_due',
                message=f'Engine {engine.serial_number} has a {failure_prob*100:.1f}% probability of failure within 30 cycles. Maintenance recommended.'
            )
            db.session.add(new_alert)
        
        db.session.commit()
        
    except Exception as e:
        print(f"Error making prediction: {str(e)}")
        db.session.rollback()   