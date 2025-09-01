# AI Based Predictive Maintenance System

A comprehensive IoT solution for monitoring refrigeration equipment, detecting anomalies, predicting failures, and estimating remaining useful life using machine learning.

## Overview

This project provides an end-to-end IoT system for predictive maintenance of refrigeration equipment. It integrates real-time sensor monitoring, anomaly detection, and machine learning-driven failure prediction to optimize equipment performance and reduce downtime. The system is composed of three core components:

1. **Java Spring ML Backend (`ml-back`)**: Powers machine learning inference for predictive maintenance.
2. **React Native Frontend (`SensorDashboard`)**: A mobile application for real-time visualization of sensor data and ML predictions.
3. **Node.js Chatbot Backend (`chatbot-backend`)**: A natural language interface for querying sensor data and prediction results.

## Components

### 1. Java Spring ML Backend (`ml-back`)
- **Location**: [`ml-back/`](./ml-back/README.md)
- **Purpose**: Manages all machine learning inference and predictive maintenance logic.
- **Details**: Refer to [ml-back/README.md](./ml-back/README.md) for setup instructions and technical details.

### 2. React Native Frontend (`SensorDashboard`)
- **Location**: [`SensorDashboard/`](./SensorDashboard/README.md)
- **Purpose**: Provides a mobile dashboard for real-time and historical sensor data visualization, along with ML prediction insights.
- **Details**: Refer to [SensorDashboard/README.md](./SensorDashboard/README.md) for setup and usage instructions.

### 3. Node.js Chatbot Backend (`chatbot-backend`)
- **Location**: [`chatbot-backend/`](./chatbot-backend/README.md)
- **Purpose**: Offers a REST API and OpenAI-powered chatbot for natural language queries of sensor data and predictions.
- **Details**: Refer to [chatbot-backend/README.md](./chatbot-backend/README.md) for setup instructions.

## Installation & Setup

To get started, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kulkarnisujay/AI-Predictive-Maintenance.git
   ```

2. **Navigate to the Project Directory**: All modules are located within the `react-native/` directory:
   - `SensorDashboard/` (React Native mobile app)
   - `chatbot-backend/` (Node.js chatbot server)
   - `ml-back/` (Java Spring ML backend)

3. **Follow Module-Specific Instructions**: Each component has its own setup guide. Refer to the respective README files:
   - [SensorDashboard Setup Instructions](./SensorDashboard/README.md)
   - [Chatbot Backend Setup Instructions](./chatbot-backend/README.md)
   - [ML Backend Setup Instructions](./ml-back/README.md)

## Project Structure

```
AI-Predictive-Maintenance/
├── SensorDashboard/       # React Native mobile app
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Main application screens
│   ├── services/          # Service modules
│   ├── utils/             # Utility functions and configs
│   ├── App.js             # Main application component
│   └── README.md          # Frontend documentation
├── chatbot-backend/       # Node.js chatbot API
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── Server.js          # Main server file
│   ├── seedData.js        # Database seed script
│   └── README.md          # Backend documentation
├── ml-back/               # Java Spring ML backend
│   ├── README.md          # ML backend documentation
│   └── ...
├── README.md              # Main project documentation (this file)
└── ...
```

This repository consolidates all components into a single codebase for streamlined management, deployment, and collaboration.

## Getting Started

Each component (frontend and backend) has its own setup process. Please consult the following documentation for detailed instructions:

- [SensorDashboard Setup Instructions](./SensorDashboard/README.md)
- [Chatbot Backend Setup Instructions](./chatbot-backend/README.md)
- [ML Backend Setup Instructions](./ml-back/README.md)

## Environment Variables

Both the frontend and backend require environment variables to be configured in their respective `.env` files. Sample files (`.env.sample`) are provided in each module's directory.

### Frontend Environment Variables

```
BACKEND_URL=http://your-backend-url:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

**Important**: Never commit `.env` files to Git. They are included in `.gitignore` to prevent accidental commits.

## Database Schema

The system uses a Supabase PostgreSQL database with the following primary table:

**sensor_history**

| Column Name               | Data Type    | Description                         |
|---------------------------|--------------|-------------------------------------|
| id                        | uuid         | Primary key                         |
| timestamp                 | timestamptz  | Time of sensor reading              |
| temperature_internal      | float8       | Internal temperature (°C)           |
| temperature_evaporator    | float8       | Evaporator temperature (°C)         |
| ambient_temperature       | float8       | Ambient temperature (°C)            |
| humidity_internal         | float8       | Internal humidity (%)               |
| pressure_refrigerant      | float8       | Refrigerant pressure (kPa)          |
| current_compressor        | float8       | Compressor current (A)              |
| vibration_level           | float8       | Vibration level (mm/s)              |
| gas_leak_level            | float8       | Gas leak level (ppm)                |
| compressor_status         | boolean      | Compressor active status            |
| compressor_cycle_time     | integer      | Compressor cycle time (seconds)     |
| energy_consumption        | float8       | Energy consumption (kWh)            |
| temperature_gradient      | float8       | Temperature change rate (°C/h)      |
| pressure_trend            | float8       | Pressure change rate (kPa/h)        |

## Recent Updates

- Added real-time server connectivity check for improved reliability
- Implemented a comprehensive chart configuration system for enhanced data visualization
- Improved readability with detailed sensor unit displays
- Standardized sensor naming conventions across all components
- Expanded database schema with additional sensor metrics
- Introduced a health check endpoint for backend monitoring
- Enhanced error handling for API requests

## Contributing

We welcome contributions to improve this project! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.

## About

This repository unifies all major components of the IoT Predictive Maintenance System, enabling seamless collaboration and deployment. For detailed module-specific documentation, refer to:

- [SensorDashboard README](./SensorDashboard/README.md)
- [Chatbot Backend README](./chatbot-backend/README.md)
- [ML Backend README](./ml-back/README.md)

For questions or feedback, please open an issue on this repository.

© 2025 [Harsh Rathod](https://h-rathod.github.io). All rights reserved.

