# Weather Check Project
https://weather-check-t67f.onrender.com/

## Overview

The Weather Check project is a web application that provides real-time weather updates for a given location. It offers a user-friendly and responsive interface, ensuring that users can easily access current weather information. This project is built using JavaScript, Node.js, Express.js, and utilizes the OpenWeatherMap API for weather data.

## Features

- **Real-Time Weather Updates**: Get up-to-the-minute weather data for any location.

- **Responsive UI**: The user interface is designed to work seamlessly across various devices and screen sizes.

- **Error Handling**: The project handles errors gracefully, providing a smooth user experience even in case of incorrect inputs or API issues.

## Technologies Used

- **Front-End**: HTML5, CSS3, JavaScript, EJS (Embedded JavaScript templates)

- **Back-End**: Node.js, Express.js

- **API Integration**: OpenWeatherMap API for weather data

## Usage

1. Clone the repository to your local machine:
   git clone https://github.com/yourusername/weather-check.git

2. Install the required dependencies:
   npm install

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key as follows:
   SECRET_API_KEY=your_api_key_here

4. Start the server:
   npm start

5. Open a web browser and navigate to `http://localhost:3000` to use the Weather Check application.

## How It Works

- Users can enter a location or use their device's geolocation to fetch real-time weather data.

- The project sends a request to the OpenWeatherMap API to retrieve weather information based on the provided location or coordinates.

- The received weather data is displayed in a user-friendly format, including current temperature, weather conditions, sunrise and sunset times, humidity, cloudiness, and air quality.

- The user interface is responsive, adapting to various screen sizes and devices.

## Credits

- This project utilizes the OpenWeatherMap API to fetch weather data.

## Contributing

Contributions to this project are welcome! If you have suggestions or improvements, please open an issue or create a pull request.
