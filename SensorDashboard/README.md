# Sensor Dashboard (Frontend)

React Native application that provides an interactive dashboard for monitoring sensor data, predictive maintenance insights, and includes a chatbot interface for querying data using natural language.

## Features

- Real-time sensor data display
- Interactive graphs for historical data analysis
- Predictive maintenance insights (anomaly detection, failure probability, health index, part at risk)
- Part at Risk identification to pinpoint which component is likely to fail (compressor, condenser, evaporator, etc.)
- Chatbot interface for natural language queries
- Responsive design for mobile and tablet devices
- Server connectivity status check
- Configurable chart styles and visualizations
- Standardized sensor unit display
- Comprehensive sensor data metrics

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (for development)

## Installation

1. Clone the repository
2. Navigate to the SensorDashboard directory:
   ```
   cd SensorDashboard
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.sample` with the following environment variables:
   ```
   BACKEND_URL=http://your-backend-url:3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   **Note**: Never commit your `.env` file to Git.

## Running the Application

For development:

```
npx expo start
```

This will start the Expo development server. You can run the app on:

- Android simulator/device: Press 'a'
- iOS simulator/device: Press 'i'
- Web browser: Press 'w'

## Project Structure

- `/src/screens`: Main application screens
- `/src/components`: Reusable React components
- `/src/api`: API integration code
- `/src/utils`: Utility functions and configuration
- `/src/services`: Service modules for external integrations
- `/src/context`: React Context providers
- `/src/navigation`: Navigation configurations
- `/src/commons`: Common utilities, constants, and styles

## Sensor Data Configuration

The application tracks the following sensor data metrics:

| Sensor Name            | Display Name           | Unit  |
| ---------------------- | ---------------------- | ----- |
| temperature_internal   | Internal Temperature   | °C    |
| temperature_evaporator | Evaporator Temperature | °C    |
| ambient_temperature    | Ambient Temperature    | °C    |
| humidity_internal      | Internal Humidity      | %     |
| pressure_refrigerant   | Refrigerant Pressure   | kPa   |
| current_compressor     | Compressor Current     | A     |
| vibration_level        | Vibration Level        | mm/s  |
| gas_leak_level         | Gas Leak Level         | ppm   |
| compressor_status      | Compressor Status      | -     |
| compressor_cycle_time  | Compressor Cycle Time  | -     |
| energy_consumption     | Energy Consumption     | kWh   |
| temperature_gradient   | Temperature Gradient   | °C/h  |
| pressure_trend         | Pressure Trend         | kPa/h |

## Chart Configuration

The application uses a standardized chart configuration with the following properties:

- White background with clean styling
- Decimal precision of 1 place
- Primary color based on iOS blue (rgba(0, 122, 255))
- Rounded corners with 16px border radius
- 6px dots with 2px stroke width

## Server Connectivity

The application includes a server connectivity check function that pings the backend's health endpoint to ensure real-time data flow and alert users of connection issues.

## Dependencies

The main dependencies used in this project are:

- React Native
- Expo
- React Navigation
- Victory Native (for charts)
- React Native Paper (UI components)
- Gifted Chat (for chatbot interface)
- Supabase JS Client
- @env (for environment variable management)

For the complete list of dependencies, see the `package.json` file.
