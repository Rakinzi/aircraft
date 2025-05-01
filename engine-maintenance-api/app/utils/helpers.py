from datetime import datetime
import json

def parse_date(date_str):
    """Parse date string to datetime object"""
    if not date_str:
        return None
    
    try:
        return datetime.fromisoformat(date_str)
    except ValueError:
        return None

def format_date(date_obj):
    """Format datetime object to ISO string"""
    if not date_obj:
        return None
    
    return date_obj.isoformat()

def parse_json(json_str):
    """Parse JSON string to Python object"""
    if not json_str:
        return {}
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {}