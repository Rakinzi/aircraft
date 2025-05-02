# Aircraft Engine Predictive Maintenance System - Setup Guide

This guide will help you set up both the backend and frontend of the Aircraft Engine Predictive Maintenance System and demonstrate how to test the predictive model.

## Prerequisites

- Python 3.8+ with pip
- Node.js v16+ with npm or yarn
- MySQL server

## Setting Up the Backend

### 1. Clone the repository and create a virtual environment

```bash
git clone https://github.com/your-username/engine-maintenance-api.git
cd engine-maintenance-api

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up the MySQL database

Create a MySQL database named `engine_maintenance`:

```sql
CREATE DATABASE engine_maintenance;
```

Update the database connection details in `app/config.py` if needed:

```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://username:password@localhost/engine_maintenance'
```

### 4. Load the ML model

The system needs a pre-trained machine learning model to make predictions. Place the `RNN_fwd.h5` model file in the `ml_models` directory:

```bash
mkdir -p ml_models
cp /path/to/your/RNN_fwd.h5 ml_models/
```

### 5. Start the backend server

```bash
python run.py
```

The Flask API should now be running at http://localhost:5000

## Setting Up the Frontend

### 1. Navigate to the frontend directory and install dependencies

```bash
cd ../aircraft-front
npm install
```

or if you use yarn:

```bash
yarn install
```

### 2. Start the development server

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

The React application should now be running at http://localhost:5173

## Testing the System

### 1. Register and Login

1. Navigate to http://localhost:5173/register
2. Create a new account
3. Log in with your credentials

### 2. Adding Test Data

You need to add engine data to test the predictive maintenance functionality. Here's how to do it:

1. First, add a new engine:
   - Go to the Engines section in the sidebar
   - Click "Add Engine"
   - Fill in the details like serial number, model, and aircraft ID
   - Click "Save"

2. Add cycle data for the engine:
   - Go to the newly created engine details page
   - Use the API to add cycle data (you can use a tool like Postman)
   - POST to `/api/engines/{engine_id}/cycles` with cycle data

3. Sample cycle data format:
```json
{
  "cycle": 1,
  "setting1": 0.0023,
  "setting2": 0.0003,
  "setting3": 100.0,
  "s1": 518.67,
  "s2": 643.02,
  "s3": 1585.29,
  "s4": 1398.21,
  "s5": 14.62,
  "s6": 21.61,
  "s7": 553.90,
  "s8": 2388.04,
  "s9": 9050.17,
  "s10": 1.30,
  "s11": 47.20,
  "s12": 521.72,
  "s13": 2388.03,
  "s14": 8125.55,
  "s15": 8.4052,
  "s16": 0.03,
  "s17": 392,
  "s18": 2388,
  "s19": 100.00,
  "s20": 38.86,
  "s21": 23.3735
}
```

### 3. Batch Data Import

For testing purposes, you can use the included Python script to load test data from CSV files:

```bash
cd engine-maintenance-api
python scripts/import_test_data.py --engine-id 1 --file path/to/PM_train.csv
```

### 4. Testing the Predictive Model

Once you have added at least 50 cycle data points for an engine, the system will automatically run the RNN model to predict failure probability.

1. Navigate to the engine details page
2. Check the "Predictive Analytics" section to see:
   - Failure probability trend
   - Remaining Useful Life (RUL) estimation
   - Sensor data analysis

3. The system will generate alerts when:
   - Failure probability exceeds 70%
   - Anomalies are detected in sensor readings

### 5. Understanding the Model

The system uses a Recurrent Neural Network (RNN) trained on historical data from engines that have run to failure. The model:

1. Takes sequences of 50 consecutive cycle readings
2. Uses sensor data to detect patterns that correlate with upcoming failures
3. Predicts the probability of failure within the next 30 cycles
4. Estimates the Remaining Useful Life (RUL) in cycles

The prediction works as follows:
- If prediction < 50%: Normal operation
- If prediction 50-70%: Monitor closely
- If prediction > 70%: Schedule maintenance

## Analyzing Model Performance

The model achieves approximately 93.75% accuracy in predicting engine failures 30 cycles in advance. To evaluate model performance:

1. Use test data with known failure cycles
2. Compare predictions with actual outcomes
3. The model tends to have high recall (few missed failures) with some false positives

## Troubleshooting

### Backend Issues

- **Model loading errors**: Ensure the model file is correctly placed in the ml_models directory
- **Database connection errors**: Check your MySQL credentials and ensure the service is running
- **API errors**: Check Flask logs for detailed error information

### Frontend Issues

- **API connection errors**: Ensure the backend server is running and the proxy is correctly set up in vite.config.js
- **Authentication errors**: Check local storage for token persistence issues
- **Component rendering issues**: Check browser console for React errors

## Additional Resources

- [TensorFlow Documentation](https://www.tensorflow.org/tutorials/structured_data/time_series)
- [Time Series Prediction Tutorial](https://www.tensorflow.org/tutorials/structured_data/time_series)
- [NASA Turbofan Engine Degradation Dataset](https://www.nasa.gov/content/prognostics-center-of-excellence-data-set-repository)