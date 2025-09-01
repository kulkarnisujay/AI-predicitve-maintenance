# FridgeGuard ML Integration

This project extends the FridgeGuard application with machine learning capabilities for anomaly detection, failure prediction, health index estimation, and part risk identification in refrigerator sensor data.

## Project Structure

- **ml-backend/** - Flask server for ML prediction
- **SensorDashboard/** - React Native mobile application
- **chatbot-backend/** - Existing backend for chatbot functionality

## Components

### 1. ML Backend Server

The ML backend is a Java Spring Boot application that loads multiple pre-trained ML models for comprehensive predictive maintenance. The models analyze patterns in sensor data to identify anomalies, predict failure probability, estimate health index, and identify which specific refrigerator component is at risk of failure.

Key files:

- `src/main/java/com/example/mlbackend/MlBackendApplication.java` - Spring Boot application
- `pom.xml` - Maven dependencies
- `src/main/resources/model/autoencoder.model` - Pre-trained anomaly detection model
- `src/main/resources/model/rf_failure.model` - Random Forest failure prediction model
- `src/main/resources/model/rf_health_index.model` - Random Forest health index model
- `src/main/resources/model/part_risk.model` - Deep Learning part risk prediction model
- `src/main/resources/model/part_risk_normalizer.bin` - Normalizer for part risk model
- `src/main/resources/model/threshold.bin` - Anomaly detection threshold

### 2. React Native Integration

The mobile app includes a "Predictions" screen that communicates with the Supabase database to display anomaly detection, failure probability, health index, and part at risk prediction results.

Key files:

- `src/utils/anomalyService.js` - Service for ML backend communication
- `src/screens/PredictionsScreen.js` - UI for displaying anomaly predictions

## Setup and Deployment

### ML Backend Setup

1. Navigate to the ml-back directory

```bash
cd ml-back
```

2. Build the application with Maven

```bash
mvn clean install
```

3. Start the server

```bash
mvn spring-boot:run
```

The ML server runs on port 8080 by default.

### Mobile App Setup

1. Ensure the ML server is running

2. Update the server URL if needed

   - Edit `SensorDashboard/src/utils/anomalyService.js`
   - Change `ML_SERVER_URL` to match your server's IP address

3. Install dependencies

```bash
cd SensorDashboard
npm install
```

4. Start the React Native app

```bash
npm start
```

## How It Works

1. The ML backend loads the pre-trained autoencoder model
2. When the user opens the Predictions screen, the app:

   - Fetches recent sensor data from Supabase
   - Sends this data to the ML backend for analysis
   - Displays the results, showing any detected anomalies

3. The prediction process:
   - Data is preprocessed and normalized
   - Fed through multiple ML models:
     - Autoencoder for anomaly detection
     - Random Forest for failure probability
     - Random Forest for health index estimation
     - Deep Learning model for part risk prediction
   - Results are stored in Supabase for frontend retrieval

## Development Notes

- The ML server must be running for predictions to work
- For Android emulators, the server address is configured as `10.0.2.2:5000`
- For physical devices, update the server URL to your local IP address
- The model is trained to detect anomalies in refrigerator operation based on multiple sensor readings

## Troubleshooting

If you encounter issues with the ML integration:

1. Verify the ML server is running and accessible
2. Check the server URL configuration in `anomalyService.js`
3. Ensure all required model files are present in the correct locations
4. Check the Python environment has all required dependencies installed
